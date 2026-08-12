import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class BulletinPdfExportService {
  async downloadFromElement(
    element: HTMLElement,
    fileName: string,
  ): Promise<void> {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    if ("fonts" in document && "ready" in document.fonts) {
      await document.fonts.ready;
    }

    const canvas = await html2canvas(element, {
      scale: Math.min(3, window.devicePixelRatio * 2 || 2),
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });

    const imageData = canvas.toDataURL("image/png", 1);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 5;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;

    let renderWidth = availableWidth;
    let renderHeight = (canvas.height * renderWidth) / canvas.width;

    if (renderHeight > availableHeight) {
      renderHeight = availableHeight;
      renderWidth = (canvas.width * renderHeight) / canvas.height;
    }

    const offsetX = (pageWidth - renderWidth) / 2;
    const offsetY = (pageHeight - renderHeight) / 2;

    pdf.addImage(
      imageData,
      "PNG",
      Math.max(margin, offsetX),
      Math.max(margin, offsetY),
      renderWidth,
      renderHeight,
      undefined,
      "FAST",
    );

    pdf.save(this.normalizeFileName(fileName));
  }

  private normalizeFileName(fileName: string): string {
    const sanitized = String(fileName || "bulletin.pdf")
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
      .trim();

    return sanitized.toLowerCase().endsWith(".pdf")
      ? sanitized
      : `${sanitized || "bulletin"}.pdf`;
  }
}
