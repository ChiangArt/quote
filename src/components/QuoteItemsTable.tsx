import type { QuoteItem, QuoteTotals } from "../types";
import {
  formatMoneyPen,
  formatMoneyUsd,
  formatNumber,
  roundMoney,
} from "../utils/number";

type Props = {
  items: QuoteItem[];
  startIndex?: number;
  totals?: QuoteTotals;
  currency?: "usd" | "pen";
  exchangeRate?: number;
};

const th = "border border-slate-300 bg-slate-100 px-1 py-1 font-bold";
const td = "border border-slate-300 px-1.5 py-1";
const tdTotal = "border border-slate-300 bg-slate-50 px-1.5 py-1 font-bold";
const tdGrand =
  "border border-slate-300 bg-slate-100 px-1.5 py-1 font-extrabold";

export function QuoteItemsTable({
  items,
  startIndex = 0,
  totals,
  currency = "usd",
  exchangeRate = 0,
}: Props) {
  return (
    <div className="mt-2">
      <table className="w-full table-fixed border-collapse text-xs">
        <thead>
          <tr>
            <th className={`${th} text-right`} style={{ width: 24 }}>#</th>
            <th className={`${th} text-left`} style={{ width: 70 }}>Cod. Cliente</th>
            <th className={`${th} text-left`}>Producto</th>
            <th className={`${th} text-right`} style={{ width: 42 }}>Cant.</th>
            <th className={`${th} text-right`} style={{ width: 60 }}>Peso TN</th>
            <th className={`${th} text-right`} style={{ width: 72 }}>P. Unit</th>
            <th className={`${th} text-right`} style={{ width: 78 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? (
            items.map((item, idx) => (
              <ItemRow
                key={item.id}
                item={item}
                number={startIndex + idx + 1}
                currency={currency}
                exchangeRate={exchangeRate}
              />
            ))
          ) : (
            <tr>
              <td colSpan={7} className={`${td} text-slate-600`}>
                No hay productos agregados. Usa el catálogo de la izquierda.
              </td>
            </tr>
          )}
          {totals ? <TotalsRows totals={totals} currency={currency} /> : null}
        </tbody>
      </table>
    </div>
  );
}

function ItemRow({
  item,
  number,
  currency,
  exchangeRate,
}: {
  item: QuoteItem;
  number: number;
  currency: "usd" | "pen";
  exchangeRate: number;
}) {
  const rowTotal = roundMoney(item.qty * item.unitPriceUsd);
  const rowWeightTn = item.weightTn * item.qty;
  const unitPrice =
    currency === "pen"
      ? roundMoney(item.unitPriceUsd * exchangeRate)
      : item.unitPriceUsd;
  const total =
    currency === "pen" ? roundMoney(rowTotal * exchangeRate) : rowTotal;
  const formatMoney = currency === "pen" ? formatMoneyPen : formatMoneyUsd;

  return (
    <tr>
      <td className={`${td} text-right`}>{number}</td>
      <td className={td}>{item.randomCode}</td>
      <td className={`${td} leading-snug`}>{item.name}</td>
      <td className={`${td} text-right`}>{item.qty}</td>
      <td className={`${td} text-right`}>{formatNumber(rowWeightTn, 6)}</td>
      <td className={`${td} text-right`}>{formatMoney(unitPrice)}</td>
      <td className={`${td} text-right`}>{formatMoney(total)}</td>
    </tr>
  );
}

function TotalsRows({
  totals,
  currency,
}: {
  totals: QuoteTotals;
  currency: "usd" | "pen";
}) {
  const isPen = currency === "pen";
  const formatMoney = isPen ? formatMoneyPen : formatMoneyUsd;
  const subtotal = isPen ? totals.subtotalPen : totals.subtotalUsd;
  const igv = isPen ? totals.igvPen : totals.igvUsd;
  const total = isPen ? totals.totalPen : totals.totalUsd;

  return (
    <>
      <tr>
        <td colSpan={3} className={`${tdTotal} text-right`}>TOTALES</td>
        <td className={`${tdTotal} text-right`}>
          {formatNumber(totals.totalQty ?? 0, 0)}
        </td>
        <td className={`${tdTotal} text-right`}>
          {formatNumber(totals.totalWeightTn, 3)}
        </td>
        <td className={`${tdTotal} text-right`}>Subtotal</td>
        <td className={`${tdTotal} text-right`}>{formatMoney(subtotal)}</td>
      </tr>
      <tr>
        <td colSpan={5} className="border-none"></td>
        <td className={`${tdTotal} text-right`}>IGV 18%</td>
        <td className={`${tdTotal} text-right`}>{formatMoney(igv)}</td>
      </tr>
      <tr>
        <td colSpan={5} className="border-none"></td>
        <td className={`${tdGrand} text-right`}>
          {isPen ? "Total PEN" : "Total USD"}
        </td>
        <td className={`${tdGrand} text-right`}>{formatMoney(total)}</td>
      </tr>
    </>
  );
}