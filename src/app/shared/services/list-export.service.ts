import { Injectable } from "@angular/core";

export interface ListExportColumn {
  header: string;
  key: string;
  weight?: number;
  align?: "left" | "center" | "right";
}

export interface ListExportOptions {
  title: string;
  subtitle?: string;
  columns: ListExportColumn[];
  rows: Array<Record<string, string | number | null | undefined>>;
  fileName: string;
}

export type ListExportCellValue = string | number | null | undefined;

@Injectable({
  providedIn: "root",
})
export class ListExportService {
  async exportExcel(options: ListExportOptions): Promise<void> {
    const XLSX = await import("xlsx");
    const today = new Date().toLocaleDateString("fr-FR");
    const subtitle = options.subtitle || `Généré le ${today}`;

    const matrix: (string | number)[][] = [];
    matrix.push([options.title]);
    matrix.push([subtitle]);
    matrix.push([]);
    matrix.push(options.columns.map((column) => column.header));
    for (const row of options.rows) {
      matrix.push(options.columns.map((column) => this.toCell(row[column.key])));
    }

    const worksheet = XLSX.utils.aoa_to_sheet(matrix);
    worksheet["!cols"] = options.columns.map((column, index) => {
      const width = this.estimateColumnWidth(matrix, index);
      return { wch: width };
    });
    worksheet["!views"] = [{ state: "frozen", ySplit: 4 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Donnees");
    const content = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    this.downloadBlob(
      new Blob([content], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      options.fileName,
    );
  }

  async exportPdf(options: ListExportOptions): Promise<void> {
    const { jsPDF: JsPdf } = await import("jspdf");
    const doc = new JsPdf({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const printableWidth = pageWidth - margin * 2;
    const footerOffset = 12;

    const totalWeight = options.columns.reduce(
      (sum, column) => sum + (column.weight ?? 1),
      0,
    );
    const columnWidths = options.columns.map(
      (column) => (printableWidth * (column.weight ?? 1)) / totalWeight,
    );

    let cursorY = margin;
    const bottomLimit = pageHeight - margin - footerOffset;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(31, 41, 55);
    doc.text(this.truncate(options.title, pageWidth - margin * 2), pageWidth / 2, cursorY, {
      align: "center",
    });
    cursorY += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    const subtitle =
      options.subtitle || `Généré le ${new Date().toLocaleDateString("fr-FR")}`;
    doc.text(subtitle, pageWidth / 2, cursorY, { align: "center" });
    cursorY += 3;

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.8);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 6;

    if (options.rows.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("Aucun résultat à exporter.", pageWidth / 2, cursorY + 10, {
        align: "center",
      });
      doc.save(options.fileName);
      return;
    }

    const headerHeight = 8;
    const paddingX = 2;
    const paddingY = 1.8;
    const lineHeight = 3.6;
    const startX = margin;

    const drawHeader = (): void => {
      let x = startX;
      doc.setFillColor(30, 58, 138);
      doc.rect(x, cursorY, printableWidth, headerHeight, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      options.columns.forEach((column, index) => {
        const width = columnWidths[index];
        const alignment = column.align ?? "left";
        const textX =
          alignment === "left" ? x + paddingX : alignment === "center" ? x + width / 2 : x + width - paddingX;
        doc.text(column.header, textX, cursorY + headerHeight / 2 + 1, { align: alignment });
        x += width;
      });
      cursorY += headerHeight;
    };

    drawHeader();

    doc.setFontSize(8.5);
    options.rows.forEach((row, rowIndex) => {
      const cellLines: string[][] = options.columns.map((column, index) => {
        const width = columnWidths[index];
        const raw = this.toCell(row[column.key]).toString();
        return doc.splitTextToSize(raw, width - paddingX * 2) as string[];
      });
      const maxLines = Math.max(...cellLines.map((lines) => lines.length), 1);
      const rowHeight = Math.max(maxLines * lineHeight + paddingY * 2, 7);

      if (cursorY + rowHeight > bottomLimit) {
        doc.addPage();
        cursorY = margin;
        drawHeader();
      }

      let x = startX;
      const zebra = rowIndex % 2 === 1;
      const bgColor: [number, number, number] = zebra ? [245, 245, 250] : [255, 255, 255];
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.rect(x, cursorY, printableWidth, rowHeight, "F");

      doc.setDrawColor(209, 213, 219);
      doc.setLineWidth(0.2);
      doc.rect(x, cursorY, printableWidth, rowHeight, "S");

      doc.setFont("helvetica", "normal");
      doc.setTextColor(55, 65, 81);

      options.columns.forEach((column, index) => {
        const width = columnWidths[index];
        const alignment = column.align ?? "left";
        const textX =
          alignment === "left" ? x + paddingX : alignment === "center" ? x + width / 2 : x + width - paddingX;
        const lines = cellLines[index];
        lines.forEach((line, lineIndex) => {
          const lineY = cursorY + paddingY + lineHeight / 2 + lineIndex * lineHeight;
          doc.text(line, textX, lineY, { align: alignment });
        });
        x += width;
      });

      cursorY += rowHeight;
    });

    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${page} / ${pageCount}`, pageWidth / 2, pageHeight - 8, {
        align: "center",
      });
      doc.setFont("helvetica", "bold");
      doc.text(this.truncate(options.title, 120), margin, pageHeight - 8);
    }

    doc.save(options.fileName);
  }

  private toCell(value: ListExportCellValue): string | number {
    if (value === null || value === undefined) return "";
    if (typeof value === "number") return value;
    return value.trim();
  }

  private estimateColumnWidth(matrix: (string | number)[][], index: number): number {
    let max = (matrix[3]?.[index]?.toString().length ?? 0) + 2;
    for (let r = 4; r < matrix.length; r++) {
      const value = matrix[r]?.[index];
      if (value !== undefined && value !== null) {
        max = Math.max(max, value.toString().length + 2);
      }
    }
    return Math.min(Math.max(max, 8), 50);
  }

  private truncate(value: string, maxWidth: number): string {
    return value.length <= 60 ? value : `${value.slice(0, 57)}...`;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}