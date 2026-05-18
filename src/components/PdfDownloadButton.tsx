import React, { useState } from "react";

type Props = {
  targetRef: React.RefObject<HTMLDivElement | null>;
  fileName?: string;
  disabled?: boolean;
  onAfterSave?: () => void;
  label?: string;
};

export function PdfDownloadButton({
  targetRef,
  fileName,
  disabled,
  onAfterSave,
  label = "Descargar PDF",
}: Props) {
  const [loading, setLoading] = useState(false);

  function handleDownload() {
    if (disabled) {
      alert("Primero agrega al menos un producto.");
      return;
    }

    if (!targetRef.current) {
      alert("No se encontró el documento PDF.");
      return;
    }

    setLoading(true);

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("No se pudo abrir la ventana de impresión.");
      setLoading(false);
      return;
    }

    const styles = Array.from(
      document.querySelectorAll("style, link[rel='stylesheet']"),
    )
      .map((node) => node.outerHTML)
      .join("\n");

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
<title>${fileName || label}</title>          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            html, body {
              margin: 0;
              padding: 0;
              background: white;
            }

            .pdf-page {
              width: 190mm !important;
              min-height: 277mm !important;
              page-break-after: always !important;
              break-after: page !important;
            }

            .pdf-page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
          </style>
        </head>
        <body>
          ${targetRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
      onAfterSave?.();
      setLoading(false);
    }, 700);
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleDownload}
      className="rounded-none border border-slate-300 bg-black px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 print:hidden"
    >
      {loading ? "Generando..." : label}
    </button>
  );
}
