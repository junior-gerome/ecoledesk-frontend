import { Injectable } from '@angular/core';

@Injectable()
export class ReceiptDocumentGateway {
  private readonly urlFactory = window.URL;

  downloadBlob(blob: Blob, fileName: string): void {
    const url = this.urlFactory.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = fileName;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    this.urlFactory.revokeObjectURL(url);
  }

  openPreview(blob: Blob, fileName: string): { ok: boolean; reason?: string } {
    const previewWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!previewWindow) {
      return { ok: false, reason: 'blocked' };
    }

    previewWindow.document.write(
      [
        '<!doctype html>',
        '<html lang="fr">',
        '<head>',
        '<meta charset="utf-8" />',
        '<title>Preparation du recu</title>',
        '</head>',
        '<body style="font-family: Arial, sans-serif; padding: 24px; color: #111827;">',
        "<p>Ouverture de l'apercu du recu...</p>",
        '</body>',
        '</html>',
      ].join(''),
    );
    previewWindow.document.close();

    const url = this.urlFactory.createObjectURL(blob);
    previewWindow.document.title = fileName;
    previewWindow.addEventListener(
      'beforeunload',
      () => this.urlFactory.revokeObjectURL(url),
      { once: true },
    );
    previewWindow.location.href = url;

    return { ok: true };
  }

  openPrintable(blob: Blob, fileName: string): { ok: boolean; reason?: string } {
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) {
      return { ok: false, reason: 'blocked' };
    }

    printWindow.document.write(
      [
        '<!doctype html>',
        '<html lang="fr">',
        '<head>',
        '<meta charset="utf-8" />',
        '<title>Preparation du recu</title>',
        '</head>',
        '<body style="font-family: Arial, sans-serif; padding: 24px; color: #111827;">',
        '<p>Preparation du recu de paiement...</p>',
        '</body>',
        '</html>',
      ].join(''),
    );
    printWindow.document.close();

    const url = this.urlFactory.createObjectURL(blob);
    let hasPrinted = false;

    const triggerPrint = () => {
      if (hasPrinted) {
        return;
      }

      hasPrinted = true;
      try {
        printWindow.focus();
        printWindow.print();
      } finally {
        window.setTimeout(() => this.urlFactory.revokeObjectURL(url), 60_000);
      }
    };

    printWindow.document.title = fileName;
    printWindow.addEventListener(
      'afterprint',
      () => {
        this.urlFactory.revokeObjectURL(url);
        printWindow.close();
      },
      { once: true },
    );
    printWindow.addEventListener('load', triggerPrint, { once: true });
    printWindow.location.href = url;
    window.setTimeout(triggerPrint, 1_200);

    return { ok: true };
  }
}
