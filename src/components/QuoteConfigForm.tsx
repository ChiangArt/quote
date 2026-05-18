import type { ClientInfo } from "../types";
import { addDaysISO } from "../utils/date";
import { useState } from "react";

export function QuoteConfigForm({
  sellerCode,
  onSellerCode,
  client,
  onClient,
}: {
  sellerCode: string;
  onSellerCode: (value: string) => void;
  client: ClientInfo;
  onClient: (patch: Partial<ClientInfo>) => void;
}) {
  const fechaVencimientoISO = addDaysISO(client.fechaISO, 1);

  const [isFxEditing, setIsFxEditing] = useState(false);

  return (
    <section className="min-h-130 rounded-none border border-slate-300 bg-white">
      {" "}
      <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-4 py-3">
        <div>
          <div className="text-sm font-extrabold">Datos</div>

          <div className="text-xs text-slate-600">
            Estos campos no aparecen como inputs en el PDF
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-slate-600">
              Código vendedor
            </label>

            <input
              className="w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={sellerCode}
              onChange={(e) => onSellerCode(e.target.value.toUpperCase())}
              placeholder="Ej: YAR"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-600">
              Fecha de emisión
            </label>

            <input
              className="w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              type="date"
              value={client.fechaISO}
              onChange={(e) => onClient({ fechaISO: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-2">
          <label className="mb-1 block text-xs text-slate-600">
            Fecha de vencimiento
          </label>

          <input
            className="w-full rounded-none border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            value={fechaVencimientoISO}
            readOnly
          />
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs text-slate-600">
            Razón Social
          </label>

          <input
            className="w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            value={client.razonSocial}
            onChange={(e) => onClient({ razonSocial: e.target.value })}
          />
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-xs text-slate-600">Dirección</label>

          <input
            className="w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            value={client.direccion}
            onChange={(e) => onClient({ direccion: e.target.value })}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 flex h-5 items-center text-xs text-slate-600">
              RUC
            </label>
            <input
              className="w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={client.ruc}
              onChange={(e) => onClient({ ruc: e.target.value })}
            />
          </div>

          <div>
            <div className="mb-1 flex h-5 items-center justify-between gap-2">
              <label className="block text-xs text-slate-600">
                Tipo de cambio
              </label>

              <button
                type="button"
                className="h-5 rounded-none border border-slate-300 bg-white px-2 text-[10px] font-semibold leading-none hover:bg-slate-50"
                onClick={() => setIsFxEditing((v) => !v)}
              >
                {isFxEditing ? "Guardar" : "Editar"}
              </button>
            </div>

            <input
              className="w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:bg-slate-50"
              inputMode="decimal"
              value={client.tipoCambio ?? ""}
              onChange={(e) => {
                const value = e.target.value;

                if (!/^\d*\.?\d*$/.test(value)) return;

                onClient({
                  tipoCambio: value,
                });
              }}
              placeholder="Ej: 3.75"
              readOnly={!isFxEditing}
              disabled={!isFxEditing}
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-slate-600">
              Nombre asesor
            </label>

            <input
              className="w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={client.nombreAsesor}
              onChange={(e) =>
                onClient({
                  nombreAsesor: e.target.value,
                })
              }
              placeholder="Nombre asesor"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-600">
              Teléfono asesor
            </label>

            <input
              className="w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={client.telefonoAsesor}
              onChange={(e) =>
                onClient({
                  telefonoAsesor: e.target.value,
                })
              }
              placeholder="999999999"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs text-slate-600">
            Correo asesor
          </label>

          <input
            className="w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
            value={client.correoAsesor}
            onChange={(e) =>
              onClient({
                correoAsesor: e.target.value,
              })
            }
            placeholder="correo@dominio.com"
          />
        </div>
      </div>
    </section>
  );
}
