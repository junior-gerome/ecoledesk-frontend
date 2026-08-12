import { Injectable, inject } from "@angular/core";
import { BulletinRow } from "@app/features/grades/domain/models";
import { GradeDocumentGateway } from "./grade-document.gateway";

export interface StudentGradeExportRow {
  subject: string;
  sequence: string;
  value: number;
  coefficient: number;
  date: string;
}

@Injectable()
export class GradeFileExportService {
  private readonly documentGateway = inject(GradeDocumentGateway);

  async exportStudentGradesToExcel(params: {
    studentName: string;
    className: string;
    period: string;
    rows: StudentGradeExportRow[];
    average: number;
    fileName: string;
    formatNumber: (value: number) => string;
  }): Promise<void> {
    const XLSX = await import("xlsx");
    const sheetData: Array<Array<string | number>> = [
      ["Bulletin eleve"],
      ["Nom", params.studentName],
      ["Classe", params.className],
      ["Periode", params.period],
      [],
      ["Matiere", "Sequence", "Note", "Coefficient", "Date"],
    ];

    params.rows.forEach((row) => {
      sheetData.push([
        row.subject,
        row.sequence,
        Number(params.formatNumber(row.value)),
        Number(params.formatNumber(row.coefficient)),
        row.date,
      ]);
    });

    sheetData.push([]);
    sheetData.push([
      "Moyenne generale",
      "",
      Number(params.formatNumber(params.average)),
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    worksheet["!cols"] = [
      { wch: 28 },
      { wch: 18 },
      { wch: 10 },
      { wch: 12 },
      { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bulletin");
    const xlsxContent = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    this.downloadBlob(
      new Blob([xlsxContent], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      params.fileName,
    );
  }

  async exportBulletinToExcel(params: {
    studentName: string;
    className: string;
    activeAcademicYear: string;
    trimestre: string;
    sequence: string;
    month: string;
    rows: BulletinRow[];
    totalCoefficient: number;
    weightedTotal: number;
    average: number;
    fileName: string;
    formatNumber: (value: number) => string;
  }): Promise<void> {
    const XLSX = await import("xlsx");
    const sheetData: Array<Array<string | number>> = [
      ["Bulletin scolaire"],
      ["Eleve", params.studentName],
      ["Classe", params.className],
      ["Annee academique", params.activeAcademicYear],
      ["Trimestre", params.trimestre],
      ["Sequence", params.sequence],
      ["Mois de realisation", params.month],
      [],
      [
        "Matiere",
        "Sequence",
        "Mois",
        "Note",
        "Coefficient",
        "Ponderee",
        "Date",
      ],
    ];

    params.rows.forEach((row) => {
      sheetData.push([
        row.subject,
        row.sequence,
        row.realizationMonth,
        Number(params.formatNumber(row.note)),
        Number(params.formatNumber(row.coefficient)),
        Number(params.formatNumber(row.weighted)),
        row.assessmentDate
          ? new Date(row.assessmentDate).toLocaleDateString("fr-FR")
          : "",
      ]);
    });

    sheetData.push([]);
    sheetData.push([
      "Total coeff.",
      "",
      "",
      Number(params.formatNumber(params.totalCoefficient)),
    ]);
    sheetData.push([
      "Total pondere",
      "",
      "",
      Number(params.formatNumber(params.weightedTotal)),
    ]);
    sheetData.push([
      "Moyenne generale",
      "",
      "",
      Number(params.formatNumber(params.average)),
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    worksheet["!cols"] = [
      { wch: 28 },
      { wch: 18 },
      { wch: 18 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bulletin");
    const xlsxContent = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    this.downloadBlob(
      new Blob([xlsxContent], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      params.fileName,
    );
  }

  downloadBlob(blob: Blob, fileName: string): void {
    this.documentGateway.downloadBlob(blob, fileName);
  }
}
