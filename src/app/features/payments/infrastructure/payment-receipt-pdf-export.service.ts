import {
  ApplicationRef,
  EnvironmentInjector,
  Injectable,
  createComponent,
  inject,
} from '@angular/core';
import { BrowserApiService } from '@core/services/browser-api.service';
import { firstValueFrom } from 'rxjs';
import {
  BulletinBrandingService,
} from '@app/features/grades/infrastructure/services/bulletin-branding.service';
import { PaymentReceiptDocumentViewModel } from '../domain/models/payment-receipt.model';
import { PaymentReceiptDocumentComponent } from '../presentation/receipts/payment-receipt-document.component';

@Injectable({
  providedIn: 'root',
})
export class PaymentReceiptPdfExportService {
  private readonly appRef = inject(ApplicationRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly brandingService = inject(BulletinBrandingService);
  private readonly browserApi = inject(BrowserApiService);

  async generateBlob(receipt: PaymentReceiptDocumentViewModel): Promise<Blob> {
    const browserWindow = this.browserApi.window;
    const documentRef = browserWindow?.document;
    if (!browserWindow || !documentRef) {
      throw new Error('Payment receipt PDF export is only available in the browser.');
    }

    const branding = await firstValueFrom(this.brandingService.getConfig());
    const host = documentRef.createElement('div');

    host.style.position = 'fixed';
    host.style.left = '-200vw';
    host.style.top = '0';
    host.style.width = '210mm';
    host.style.pointerEvents = 'none';
    host.style.opacity = '0';
    host.style.zIndex = '-1';

    documentRef.body.appendChild(host);

    const componentRef = createComponent(PaymentReceiptDocumentComponent, {
      environmentInjector: this.environmentInjector,
      hostElement: host,
    });

    this.appRef.attachView(componentRef.hostView);
    componentRef.setInput('receipt', receipt);
    componentRef.setInput('branding', branding);
    componentRef.setInput('pdfMode', true);
    componentRef.changeDetectorRef.detectChanges();

    try {
      await this.waitForRender(host, browserWindow);

      const sheet = host.querySelector<HTMLElement>('[data-payment-receipt-sheet="true"]');
      if (!sheet) {
        throw new Error('Payment receipt sheet not found.');
      }

      return await this.renderSinglePagePdf(sheet, browserWindow, documentRef);
    } finally {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      host.remove();
    }
  }

  private async renderSinglePagePdf(
    element: HTMLElement,
    browserWindow: Window,
    documentRef: Document,
  ): Promise<Blob> {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const fonts = (documentRef as Document & { fonts?: { ready?: Promise<unknown> } }).fonts;
    if (fonts?.ready) {
      await fonts.ready;
    }

    const canvas = await html2canvas(element, {
      scale: Math.min(3, browserWindow.devicePixelRatio * 2 || 2),
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
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
      canvas.toDataURL('image/png', 1),
      'PNG',
      Math.max(margin, offsetX),
      Math.max(margin, offsetY),
      renderWidth,
      renderHeight,
      undefined,
      'FAST',
    );

    return pdf.output('blob');
  }

  private async waitForRender(host: HTMLElement, browserWindow: Window): Promise<void> {
    await this.waitForImages(host, browserWindow);
    await this.nextFrame(browserWindow);
    await this.nextFrame(browserWindow);
  }

  private async waitForImages(host: HTMLElement, browserWindow: Window): Promise<void> {
    const images = Array.from(host.querySelectorAll('img'));

    await Promise.all(
      images.map(
        (image) =>
          new Promise<void>((resolve) => {
            if (image.complete) {
              resolve();
              return;
            }

            const finish = () => resolve();
            image.addEventListener('load', finish, { once: true });
            image.addEventListener('error', finish, { once: true });
            browserWindow.setTimeout(finish, 1200);
          }),
      ),
    );
  }

  private nextFrame(browserWindow: Window): Promise<void> {
    return new Promise((resolve) => {
      browserWindow.requestAnimationFrame(() => resolve());
    });
  }
}
