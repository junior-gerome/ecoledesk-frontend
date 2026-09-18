import { EnvironmentInjector, Injectable, inject } from "@angular/core";
import { createComponent } from "@angular/core";
import { Observable } from "rxjs";
import { BulletinDTO } from "@features/grades/application/dtos";
import { BulletinSheetComponent } from "@features/grades/presentation/bulletin/bulletin-sheet.component";
import {
  BulletinBrandingConfig,
} from "@features/grades/infrastructure/services";

/**
 * Assemble plusieurs bulletins (rendu BulletinSheetComponent) dans un unique
 * PDF : design officiel de l'application remplissant integralement le format
 * A4 (pleine page, 1:1), capture en haute resolution pour des ecritures
 * nettes et lisibles.
 */
@Injectable({
  providedIn: "root",
})
export class BulletinCombinePdfService {
  private readonly environmentInjector = inject(EnvironmentInjector);

  combineToPdf(
    bulletins: BulletinDTO[],
    branding: BulletinBrandingConfig,
    fileName: string,
  ): Observable<unknown> {
    return new Observable((subscriber) => {
      let cancelled = false;
      const cleanup: Array<() => void> = [];

      (async () => {
        try {
          const safeBulletins = (bulletins ?? []).filter((bulletin) => !!bulletin);
          if (!safeBulletins.length) {
            throw new Error("Aucun bulletin a assembler.");
          }

          const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
            import("html2canvas"),
            import("jspdf"),
          ]);

          if ("fonts" in document && "ready" in document.fonts) {
            await document.fonts.ready;
          }

          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true,
          });

          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          for (let index = 0; index < safeBulletins.length; index++) {
            if (cancelled) {
              return;
            }

            const bulletin = safeBulletins[index];
            const host = this.createOffscreenHost();
            cleanup.push(() => this.destroyHost(host));

            const componentRef = createComponent(BulletinSheetComponent, {
              environmentInjector: this.environmentInjector,
              hostElement: host,
            });
            cleanup.push(() => componentRef.destroy());

            host.classList.add("bulletin-shell", "bulletin-shell--pdf");
            componentRef.setInput("bulletin", bulletin);
            componentRef.setInput("branding", branding);
            componentRef.setInput("pdfMode", true);
            componentRef.changeDetectorRef.detectChanges();

            await new Promise<void>((resolve) =>
              window.setTimeout(() => resolve(), 120),
            );

            const sheetElement =
              host.querySelector<HTMLElement>(".bulletin-sheet");
            if (!sheetElement) {
              throw new Error(
                `Rendu bulletin introuvable pour l'eleve ${bulletin.studentName}.`,
              );
            }

            sheetElement.style.minHeight = `${pageHeight}mm`;

            if (index > 0) {
              pdf.addPage();
            }

            const canvas = await html2canvas(sheetElement, {
              scale: 4,
              useCORS: true,
              backgroundColor: "#ffffff",
              logging: false,
              windowWidth: sheetElement.scrollWidth,
              windowHeight: sheetElement.scrollHeight,
              scrollX: 0,
              scrollY: 0,
            });

            const imageData = canvas.toDataURL("image/png", 0.92);

            pdf.addImage(
              imageData,
              "PNG",
              0,
              0,
              pageWidth,
              pageHeight,
              undefined,
              "FAST",
            );

            cleanup.forEach((destroy) => destroy());
            cleanup.length = 0;
          }

          if (cancelled) {
            return;
          }

          pdf.save(this.normalizeFileName(fileName));
          subscriber.next(undefined);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        } finally {
          cleanup.forEach((destroy) => destroy());
          cleanup.length = 0;
        }
      })();

      return () => {
        cancelled = true;
      };
    });
  }

  private normalizeFileName(fileName: string): string {
    const sanitized = String(fileName || "bulletins.pdf")
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
      .trim();

    return sanitized.toLowerCase().endsWith(".pdf")
      ? sanitized
      : `${sanitized || "bulletins"}.pdf`;
  }

  private createOffscreenHost(): HTMLElement {
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.top = "0";
    host.style.left = "-20000px";
    host.style.width = "210mm";
    host.style.height = "auto";
    host.style.overflow = "hidden";
    host.style.pointerEvents = "none";
    host.style.background = "#ffffff";
    document.body.appendChild(host);
    return host;
  }

  private destroyHost(host: HTMLElement): void {
    if (host.parentElement) {
      host.parentElement.removeChild(host);
    }
  }
}