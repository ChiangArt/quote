export function PdfActions({
  disabled,
  onAfterSave,
}: {
  getTarget?: () => HTMLElement | null
  fileName?: string
  disabled?: boolean
  onAfterSave?: () => void
}) {
  function handleGenerate() {
    onAfterSave?.()
    setTimeout(() => {
      window.print()
    }, 100)
  }

  return (
    <button
      type="button"
      className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50 print:hidden"
      onClick={handleGenerate}
      disabled={disabled}
      title="Exportar a PDF Nativo (A4)"
    >
      Generar PDF / Imprimir
    </button>
  )
}
