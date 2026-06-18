import type { ClientInfo, QuoteItem } from "../types";
import { QuoteHeader } from "./QuoteHeader";
import { addDaysISO } from "../utils/date";
import { PurchaseOrderItemsTable } from "./PurchaseOrderItemsTable";

const SUPPLIER_NAME = "MIROMINA";
const SUPPLIER_ATTENTION = "VERONICA";
const PAYMENT_METHOD = "CONTADO";
const CURRENCY_TYPE = "SOLES O DÓLARES";
const REQUESTED_BY = "ACEROS ALDAMAR S.A.C";
const DELIVERY_ADDRESS =
  "Car. Ramiro Priale Mz A, Lt 10-B, Huachipa - Lurigancho - Lima";

const ITEMS_PER_PAGE = 18;

function chunkItems(items: QuoteItem[]) {
  const pages: QuoteItem[][] = [];

  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    pages.push(items.slice(i, i + ITEMS_PER_PAGE));
  }

  return pages.length ? pages : [[]];
}

function formatDatePE(dateISO: string) {
  if (!dateISO) return "";

  const [year, month, day] = dateISO.split("-");

  if (!year || !month || !day) return dateISO;

  return `${day}/${month}/${year}`;
}

function getStartIndex(pages: QuoteItem[][], pageIndex: number) {
  return pages.slice(0, pageIndex).reduce((acc, page) => acc + page.length, 0);
}

export function PurchaseOrderDocument({
  logoUrl,
  quoteNumber,
  client,
  items,
}: {
  logoUrl: string;
  quoteNumber: string;
  client: ClientInfo;
  items: QuoteItem[];
}) {
  const pages = chunkItems(items);

  const fechaPedido = formatDatePE(client.fechaISO);
  const fechaPago = formatDatePE(client.fechaISO);
  const fechaVencimientoISO = addDaysISO(client.fechaISO, 1);

  return (
    <div className="bg-white text-slate-900">
      {pages.map((pageItems, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;

        return (
          <div
            key={pageIndex}
            className="pdf-page mx-auto box-border w-full min-h-[277mm] bg-white print:w-[190mm] print:break-after-page"
          >
            <QuoteHeader
              logoUrl={logoUrl}
              quoteNumber={`OC-${quoteNumber}`}
              fechaEmisionISO={client.fechaISO}
              fechaVencimientoISO={fechaVencimientoISO}
              pageNumber={pageIndex + 1}
              totalPages={pages.length}
            />

            <div className="mt-3 text-center text-[13px] font-extrabold">
              ORDEN DE COMPRA
            </div>

            <div className="mt-4 flex items-start justify-between gap-8 text-sm">
              <div className="grid grid-cols-[125px_1fr] gap-y-1">
                <div className="font-bold">Proveedor</div>
                <div>: {SUPPLIER_NAME}</div>

                <div className="font-bold">Fecha de pedido</div>
                <div>: {fechaPedido}</div>

                <div className="font-bold">Fecha de pago</div>
                <div>: {fechaPago}</div>

                <div className="font-bold">Atención</div>
                <div>: {SUPPLIER_ATTENTION}</div>
              </div>

              <div className="flex flex-col gap-2 self-start">
                <div className="flex items-center gap-2 rounded border border-yellow-500 bg-yellow-300 px-4 py-2">
                  <span className="font-bold">Nro de cotización</span>

                  <span className="font-extrabold">{quoteNumber}</span>
                </div>

                <div className="flex items-center justify-between rounded border border-slate-300 bg-slate-100 px-4 py-2">
                  <span className="font-bold">Tipo de cambio</span>

                  <span className="font-extrabold">
                    {Number(client.tipoCambio || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-8 text-sm">
              Sírvase por este medio a suministrarnos los siguientes materiales:
            </div>

            <div className="mt-3 text-sm font-bold">
              DETALLE DE PRODUCTOS
            </div>

            <PurchaseOrderItemsTable
              items={pageItems}
              startIndex={getStartIndex(pages, pageIndex)}
              exchangeRate={Number(client.tipoCambio) || 0}
            />

            {isLastPage && (
              <>
                <div className="mt-6 grid grid-cols-[150px_1fr] gap-y-1 text-sm">
                  <div className="font-bold">FORMA DE PAGO</div>
                  <div>: {PAYMENT_METHOD}</div>

                  <div className="font-bold">TIPO DE MONEDA</div>
                  <div>: {CURRENCY_TYPE}</div>

                  <div className="font-bold">SOLICITADO POR</div>
                  <div>: {REQUESTED_BY}</div>
                </div>

                <div className="mt-6 grid grid-cols-[65px_1fr] border border-black text-xs">
                  <div className="bg-sky-300 px-2 py-1 font-bold">DIR.</div>

                  <div className="bg-sky-300 px-2 py-1 text-center font-bold">
                    {DELIVERY_ADDRESS}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="mt-10 border-t border-slate-500 pt-1">
                      AUTORIZADO POR
                    </div>
                  </div>

                  <div>
                    <div className="mt-10 border-t border-slate-500 pt-1">
                      RECIBIDO POR
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
