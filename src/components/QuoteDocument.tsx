import type { ClientInfo, QuoteItem, QuoteTotals } from "../types";
import { QuoteHeader } from "./QuoteHeader";
import { ClientSection } from "./ClientSection";
import { QuoteItemsTable } from "./QuoteItemsTable";
import { CommercialConditions } from "./CommercialConditions";
import { BankDetails } from "./BankDetails";
import { AdvisorSection } from "./AdvisorSection";
import { NotesSection } from "./NotesSection";
import { addDaysISO } from "../utils/date";
import { formatFixedTruncated } from "../utils/number";

function chunkItems(items: QuoteItem[]) {
  const FIRST_PAGES_ITEMS = 18;
  const LAST_PAGE_MAX_ITEMS = 5;

  if (items.length === 0) return [[]];

  if (items.length <= FIRST_PAGES_ITEMS) {
    return [items];
  }

  const pages: QuoteItem[][] = [];
  let index = 0;

  while (items.length - index > FIRST_PAGES_ITEMS + LAST_PAGE_MAX_ITEMS) {
    pages.push(items.slice(index, index + FIRST_PAGES_ITEMS));
    index += FIRST_PAGES_ITEMS;
  }

  const remaining = items.length - index;

  if (remaining <= FIRST_PAGES_ITEMS) {
    pages.push(items.slice(index));
  } else {
    pages.push(items.slice(index, items.length - LAST_PAGE_MAX_ITEMS));
    pages.push(items.slice(items.length - LAST_PAGE_MAX_ITEMS));
  }

  return pages;
}

export function QuoteDocument({
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
  // Vigencia de la cotización: 10 di­as
  const fechaVencimientoISO = addDaysISO(client.fechaISO, 10);

  const pages = chunkItems(items);

  const tipoCambio = Number(client.tipoCambio || 0);

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
              quoteNumber={quoteNumber}
              fechaEmisionISO={client.fechaISO}
              fechaVencimientoISO={fechaVencimientoISO}
              pageNumber={pageIndex + 1}
              totalPages={pages.length}
            />

            <ClientSection client={client} quoteNumber={quoteNumber} />

            {/* Tipo de cambio mas grande, en negrita y mas cerca al cuadro de items */}
            <div className="mt-6 mb-1 flex justify-end">
              <div className="py-2.5 text-right text-[15px] font-extrabold text-slate-900">
                TIPO DE CAMBIO:{" "}
                <span className="text-[15px]">
                  {tipoCambio ? formatFixedTruncated(tipoCambio, 3) : "0.000"}
                </span>
              </div>
            </div>

            <div className="mt-1 text-xs font-bold">
              DETALLE DE COTIZACIÓN
            </div>

            <QuoteItemsTable
              items={pageItems}
              startIndex={pages
                .slice(0, pageIndex)
                .reduce((acc, page) => acc + page.length, 0)}
              totals={isLastPage ? totals : undefined}
            />

            {isLastPage && (
              <div className="mt-3 flex flex-col gap-2">
                <AdvisorSection
                  nombre={client.nombreAsesor}
                  telefono={client.telefonoAsesor}
                  correo={client.correoAsesor}
                />

                <CommercialConditions />
                <BankDetails />
                <NotesSection />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

