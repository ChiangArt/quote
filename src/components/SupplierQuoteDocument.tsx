import type { ClientInfo, QuoteItem, QuoteTotals } from "../types";
import { QuoteHeader } from "./QuoteHeader";
import { SupplierItemsTable } from "./SupplierItemsTable";
import { addDaysISO } from "../utils/date";

function chunkItems(items: QuoteItem[]) {
  const ITEMS_PER_PAGE = 35;
  const pages: QuoteItem[][] = [];

  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    pages.push(items.slice(i, i + ITEMS_PER_PAGE));
  }

  return pages.length ? pages : [[]];
}

export function SupplierQuoteDocument({
  logoUrl,
  quoteNumber,
  client,
  items,
  totals,
}: {
  logoUrl: string;
  quoteNumber: string;
  client: ClientInfo;
  items: QuoteItem[];
  totals: QuoteTotals;
}) {
  const fechaVencimientoISO = addDaysISO(client.fechaISO, 1);
  const pages = chunkItems(items);

  return (
    <div className="bg-white text-slate-900">
      {pages.map((pageItems, pageIndex) => (
        <div
          key={pageIndex}
          className="pdf-page mx-auto box-border w-full min-h-[277mm] bg-white print:w-[190mm] print:break-after-page"
        >
          <QuoteHeader
            logoUrl={logoUrl}
            quoteNumber={`PROV-${quoteNumber}`}
            fechaEmisionISO={client.fechaISO}
            fechaVencimientoISO={fechaVencimientoISO}
            pageNumber={pageIndex + 1}
            totalPages={pages.length}
          />

          <div className="mt-3 text-[11px] font-bold">
            SOLICITUD DE COTIZACIÓN A PROVEEDOR: MIROMINA
          </div>

          <SupplierItemsTable
            items={pageItems}
            startIndex={pages
              .slice(0, pageIndex)
              .reduce((acc, page) => acc + page.length, 0)}
            totals={pageIndex === pages.length - 1 ? totals : undefined}
          />
        </div>
      ))}
    </div>
  );
}
