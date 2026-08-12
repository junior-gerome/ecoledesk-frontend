import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { BulletinDTO } from "../../application/dtos";
import { BulletinMapper } from "../../application/mappers";
import { Bulletin } from "../../domain/entities";
import {
  BulletinBrandingConfig,
  BulletinBrandingService,
} from "./bulletin-branding.service";

type WorksheetCell = string | number;

type WorksheetRange = {
  s: { c: number; r: number };
  e: { c: number; r: number };
};

@Injectable({
  providedIn: "root",
})
export class ExcelExportService {
  constructor(
    private readonly bulletinMapper: BulletinMapper,
    private readonly brandingService: BulletinBrandingService,
  ) {}

  async generateExcelFile(bulletins: Bulletin[]): Promise<Blob> {
    const XLSX = await import("xlsx");
    const branding = await firstValueFrom(this.brandingService.getConfig());
    const workbook = XLSX.utils.book_new();

    if (!bulletins.length) {
      const emptySheet = XLSX.utils.aoa_to_sheet([["Aucun bulletin disponible"]]);
      XLSX.utils.book_append_sheet(workbook, emptySheet, "Bulletins");
    } else {
      bulletins.forEach((bulletin, index) => {
        const dto = this.bulletinMapper.toDTO(bulletin);
        const worksheetModel = this.buildWorksheetModel(dto, branding);
        const sheet = XLSX.utils.aoa_to_sheet(worksheetModel.data);

        sheet["!cols"] = worksheetModel.cols;
        sheet["!rows"] = worksheetModel.rows;
        sheet["!merges"] = worksheetModel.merges;
        sheet["!margins"] = {
          left: 0.3,
          right: 0.3,
          top: 0.45,
          bottom: 0.45,
          header: 0.2,
          footer: 0.2,
        };
        sheet["!pageSetup"] = {
          paperSize: 9,
          orientation: "portrait",
          fitToWidth: 1,
          fitToHeight: 0,
          horizontalCentered: true,
        };

        XLSX.utils.book_append_sheet(
          workbook,
          sheet,
          this.buildSheetName(dto.studentName || `Bulletin ${index + 1}`, index),
        );
      });
    }

    const xlsxContent = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    return new Blob([xlsxContent], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private buildWorksheetModel(
    dto: BulletinDTO,
    branding: BulletinBrandingConfig,
  ): {
    data: WorksheetCell[][];
    merges: WorksheetRange[];
    cols: Array<{ wch: number }>;
    rows: Array<{ hpt: number }>;
  } {
    const sequenceKeys = this.getSequenceKeys(dto);
    const totalColumns = Math.max(7, sequenceKeys.length + 5);
    const data: WorksheetCell[][] = [];
    const merges: WorksheetRange[] = [];
    const rows: Array<{ hpt: number }> = [];
    const lastCol = totalColumns - 1;
    const logoEndCol = Math.min(1, lastCol);
    const contentStartCol = Math.min(2, lastCol);
    const maxInfoValueCol = Math.min(lastCol, 2);
    const rightValueStartCol = Math.min(lastCol, 4);

    const pushRow = (cells: WorksheetCell[] = [], height = 20): number => {
      const row = [...cells];
      while (row.length < totalColumns) {
        row.push("");
      }
      data.push(row);
      rows.push({ hpt: height });
      return data.length - 1;
    };

    const mergeAcross = (rowIndex: number, startCol: number, endCol: number): void => {
      if (endCol > startCol) {
        merges.push(this.toRange(rowIndex, startCol, rowIndex, endCol));
      }
    };

    const logoRow = pushRow(
      [
        branding.logoUrl ? "Logo etablissement" : "Zone logo",
        "",
        branding.institutionLines[0] || branding.documentTitle,
      ],
      28,
    );
    if (logoEndCol >= 1) {
      merges.push(this.toRange(logoRow, 0, logoRow + 3, logoEndCol));
    }
    mergeAcross(logoRow, contentStartCol, lastCol);

    branding.institutionLines.slice(1).forEach((line) => {
      const rowIndex = pushRow(["", "", line], 22);
      mergeAcross(rowIndex, contentStartCol, lastCol);
    });

    const contactRow = pushRow(["", "", branding.contactLine], 20);
    mergeAcross(contactRow, contentStartCol, lastCol);

    pushRow([], 10);

    const titleRow = pushRow(
      [`${branding.documentTitle.toUpperCase()} - ${String(dto.trimester).toUpperCase()}`],
      26,
    );
    mergeAcross(titleRow, 0, lastCol);

    const subtitleRow = pushRow(
      [`${branding.documentSubtitle} ${dto.sequence} • ${dto.academicYear}`],
      20,
    );
    mergeAcross(subtitleRow, 0, lastCol);

    pushRow([], 8);

    const infoRows: Array<[string, WorksheetCell, string, WorksheetCell]> = [
      ["Eleve", dto.studentName, "Classe", dto.className],
      ["Matricule", dto.studentMatricule || "N/A", "Annee", dto.academicYear],
      [
        "Periode",
        dto.sequence,
        "Rang",
        dto.rank ? `${dto.rank}/${dto.totalStudents || 0}` : "Non disponible",
      ],
      ["Mois", dto.evaluationMonth, "Mention", dto.generalMention],
    ];

    infoRows.forEach(([leftLabel, leftValue, rightLabel, rightValue]) => {
      const rowIndex = pushRow([leftLabel, leftValue, "", rightLabel, rightValue], 18);
      mergeAcross(rowIndex, 1, maxInfoValueCol);
      mergeAcross(rowIndex, rightValueStartCol, lastCol);
    });

    pushRow([], 8);

    pushRow(
      [
        "Discipline",
        ...sequenceKeys.map((key) => this.formatSequenceHeader(key)),
        "Total",
        "Coefficient",
        "Moyenne",
        "Appreciation",
      ],
      22,
    );

    dto.gradeRows.forEach((row) => {
      pushRow(
        [
          row.subjectName,
          ...sequenceKeys.map((key) => this.toWorksheetScore(row.scores[key])),
          this.computeRowTotal(row),
          row.coefficient,
          Number(row.average.toFixed(2)),
          row.comments || row.mention,
        ],
        20,
      );
    });

    pushRow(
      [
        "Moyennes obtenues",
        ...sequenceKeys.map((key) => this.computeSequenceAverage(dto, key)),
        "-",
        dto.totalCoefficient,
        Number(dto.generalAverage.toFixed(2)),
        dto.generalMention,
      ],
      22,
    );

    pushRow([], 10);

    const statsTitleRow = pushRow(["Synthese pedagogique"], 22);
    mergeAcross(statsTitleRow, 0, lastCol);

    const statsRows: Array<[string, WorksheetCell, string, WorksheetCell]> = [
      [
        "Moyenne generale",
        Number(dto.generalAverage.toFixed(2)),
        "Resultat",
        dto.isSuccessful ? "SUCCES" : "ATTENTION",
      ],
      [
        "Mention generale",
        dto.generalMention,
        "Matieres reussies",
        `${dto.passingCount}/${dto.gradeRows.length}`,
      ],
      [
        "Total coefficients",
        dto.totalCoefficient,
        "Matieres en difficulte",
        dto.failingCount,
      ],
    ];

    statsRows.forEach(([leftLabel, leftValue, rightLabel, rightValue]) => {
      const rowIndex = pushRow([leftLabel, leftValue, "", rightLabel, rightValue], 18);
      mergeAcross(rowIndex, 1, maxInfoValueCol);
      mergeAcross(rowIndex, rightValueStartCol, lastCol);
    });

    pushRow([], 12);

    const signaturesRow = pushRow(
      [
        branding.parentSignatureLabel,
        "",
        branding.teacherSignatureLabel,
        "",
        branding.headSignatureLabel,
      ],
      42,
    );
    mergeAcross(signaturesRow, 0, 1);
    if (lastCol >= 3) {
      mergeAcross(signaturesRow, 2, 3);
    }
    if (lastCol >= 4) {
      mergeAcross(signaturesRow, 4, lastCol);
    }

    pushRow([], 10);

    branding.footerLines.forEach((line) => {
      const rowIndex = pushRow([line], 18);
      mergeAcross(rowIndex, 0, lastCol);
    });

    return {
      data,
      merges,
      cols: this.buildColumnWidths(totalColumns, sequenceKeys.length),
      rows,
    };
  }

  private buildColumnWidths(
    totalColumns: number,
    sequenceCount: number,
  ): Array<{ wch: number }> {
    const widths = [
      { wch: 30 },
      ...Array.from({ length: sequenceCount }, () => ({ wch: 12 })),
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 28 },
    ];

    while (widths.length < totalColumns) {
      widths.splice(widths.length - 1, 0, { wch: 12 });
    }

    return widths;
  }

  private getSequenceKeys(dto: BulletinDTO): string[] {
    const keys = new Set<string>();

    dto.gradeRows.forEach((row) => {
      Object.keys(row.scores || {}).forEach((key) => keys.add(key));
    });

    return Array.from(keys).sort(
      (left, right) => this.sequenceOrder(left) - this.sequenceOrder(right),
    );
  }

  private computeRowTotal(dtoRow: BulletinDTO["gradeRows"][number]): WorksheetCell {
    const values = Object.values(dtoRow.scores || {}).filter(
      (value): value is number => typeof value === "number" && !Number.isNaN(value),
    );

    if (!values.length) {
      return "-";
    }

    return Number(values.reduce((sum, value) => sum + value, 0).toFixed(2));
  }

  private computeSequenceAverage(dto: BulletinDTO, sequenceKey: string): WorksheetCell {
    let weightedTotal = 0;
    let totalCoefficient = 0;

    dto.gradeRows.forEach((row) => {
      const score = row.scores?.[sequenceKey];
      const coefficient = Number(row.coefficient || 0);

      if (typeof score === "number" && !Number.isNaN(score) && coefficient > 0) {
        weightedTotal += score * coefficient;
        totalCoefficient += coefficient;
      }
    });

    return totalCoefficient ? Number((weightedTotal / totalCoefficient).toFixed(2)) : "-";
  }

  private sequenceOrder(sequenceKey: string): number {
    const parsed = Number(sequenceKey.match(/(\d+)/)?.[1]);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  private formatSequenceHeader(sequenceKey: string): string {
    const label = this.sequenceOrder(sequenceKey);
    return label ? `Sequence ${label}` : sequenceKey;
  }

  private toWorksheetScore(value: number | undefined): WorksheetCell {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "-";
    }

    return Number(value.toFixed(2));
  }

  private buildSheetName(studentName: string, index: number): string {
    const sanitized = studentName
      .replace(/[\\/*?:\[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const fallback = `Bulletin ${index + 1}`;
    return (sanitized || fallback).slice(0, 31);
  }

  private toRange(
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
  ): WorksheetRange {
    return {
      s: { r: startRow, c: startCol },
      e: { r: endRow, c: endCol },
    };
  }
}
