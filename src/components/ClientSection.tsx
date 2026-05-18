import type { ClientInfo } from '../types'

export function ClientSection({
  client,
  quoteNumber,
}: {
  client: ClientInfo
  quoteNumber: string
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
      <div className="no-break">
        <div className="mb-1 text-[11px] font-bold">DATOS DEL CLIENTE</div>
        <div className="space-y-1">
          <div>
            <span className="font-semibold">Razón Social:</span>{' '}
            {client.razonSocial || '-'}
          </div>
          <div>
            <span className="font-semibold">RUC:</span> {client.ruc || '-'}
          </div>
          <div>
            <span className="font-semibold">Dirección:</span>{' '}
            {client.direccion || '-'}
          </div>
        </div>
      </div>

      <div className="no-break text-right">
        <div className="mb-1 text-[11px] font-bold">RESUMEN</div>
        <div className="space-y-1">
          <div>
            <span className="font-semibold">N° Cotización:</span>{' '}
            <span className="font-extrabold">{quoteNumber}</span>
          </div>
          <div>
            <span className="font-semibold">Tipo de cambio:</span>{' '}
            {client.tipoCambio || 0}
          </div>
        </div>
      </div>
    </div>
  )
}
