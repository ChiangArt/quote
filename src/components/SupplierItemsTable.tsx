import type { QuoteItem, QuoteTotals } from "../types";
import { formatNumber } from "../utils/number";

type Props = {
  items: QuoteItem[];
  startIndex?: number;
  totals?: QuoteTotals;
};

const th = "border border-slate-300 bg-slate-100 px-1 py-1 font-bold";
const td = "border border-slate-300 px-1.5 py-1";
const tdTotal = "border border-slate-300 bg-slate-50 px-1.5 py-1 font-bold";

export function SupplierItemsTable({ items, startIndex = 0, totals }: Props) {
  return (
    <div className="mt-2">
      <table className="w-full table-fixed border-collapse text-[10px]">
        <thead>
          <tr>
            <th className={`${th} text-right`} style={{ width: 24 }}>
              #
            </th>

            <th className={`${th} text-left`} style={{ width: 70 }}>
              Código
            </th>

            <th className={`${th} text-left`}>Producto</th>

            <th className={`${th} text-right`} style={{ width: 50 }}>
              Cant.
            </th>

            <th className={`${th} text-right`} style={{ width: 70 }}>
              Peso TN
            </th>
          </tr>
        </thead>

        <tbody>
          {items.length ? (
            items.map((item, idx) => (
              <tr key={item.id}>
                <td className={`${td} text-right`}>{startIndex + idx + 1}</td>

                <td className={td}>{item.productCode}</td>

                <td className={`${td} leading-snug`}>{item.name}</td>

                <td className={`${td} text-right`}>{item.qty}</td>

                <td className={`${td} text-right`}>
                  {formatNumber(item.weightTn * item.qty, 6)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className={`${td} text-slate-600`}>
                No hay productos agregados.
              </td>
            </tr>
          )}

          {totals && (
            <tr>
              <td colSpan={3} className={`${tdTotal} text-right`}>
                TOTALES
              </td>

              <td className={`${tdTotal} text-right`}>{totals.totalQty}</td>

              <td className={`${tdTotal} text-right`}>
                {formatNumber(totals.totalWeightTn, 3)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
