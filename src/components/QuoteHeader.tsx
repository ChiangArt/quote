export function QuoteHeader({
  logoUrl,
  quoteNumber,
  fechaEmisionISO,
  fechaVencimientoISO,
  pageNumber,
  totalPages,
}: {
  logoUrl: string
  quoteNumber: string
  fechaEmisionISO: string
  fechaVencimientoISO: string
  pageNumber?: number
  totalPages?: number
}) {
  return (
    <div className="no-break">
      <div className="grid grid-cols-[120px_1fr_220px] items-center gap-3">
        <div className="flex items-center justify-center">
          <img
            src={logoUrl}
            alt="Logo"
            className="h-25 w-30 object-contain"
          />
        </div>

        <div className="text-center leading-tight">
          <div className="text-base font-extrabold">ACEROS ALDAMAR S.A.C.</div>
          <div className="text-sm font-semibold">RUC: 20615840221</div>
        </div>

        <div className="text-right leading-tight">
          <div className="text-lg font-extrabold tracking-wide">COTIZACIÓN</div>
          <div className="text-sm">
            <span className="font-semibold">N°:</span>{' '}
            <span className="font-extrabold">{quoteNumber}</span>
          </div>
          <div className="text-sm text-slate-700">
            Validez: <span className="font-semibold">1 día</span>
          </div>
          {pageNumber && totalPages && (
            <div className="text-sm text-slate-700">
              Página: <span className="font-semibold">{pageNumber}</span> de <span className="font-semibold">{totalPages}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-800">
        <div className="leading-snug">
          <div>
            Oficina: URB. PORTALES DE JAVIER PRADO, CAL. INGLATERRA 224
          </div>
          <div>Teléfono: 991 047 687</div>
          <div>
            Web: <span className="font-semibold">www.acerosaldamar.com</span>
          </div>
          <div>Facebook: Aceros Aldamar</div>
          <div>Instagram: @acerosaldamar</div>
        </div>

        <div className="text-right leading-snug">
          <div>
            Fecha de emisión:{' '}
            <span className="font-semibold">{fechaEmisionISO}</span>
          </div>
          <div>
            Fecha de vencimiento:{' '}
            <span className="font-semibold">{fechaVencimientoISO}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 border-b border-slate-900" />
    </div>
  )
}
