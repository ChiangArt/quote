import type { QuoteItem } from "../types";
import { roundMoney } from "../utils/number";

const IGV_RATE = 0.18;

function formatMoney(value: number) {
  return value > 0 ? roundMoney(value).toFixed(2) : "";
}

function formatWeight(value: number) {
  return value.toFixed(3);
}

export function PurchaseOrderItemsTable({
  items,
  startIndex,
  exchangeRate = 0,
}: {
  items: QuoteItem[];
  startIndex: number;
  exchangeRate?: number;
}) {
  const totalQty = items.reduce((acc, item) => acc + item.qty, 0);

  const totalWeightTn = items.reduce(
    (acc, item) => acc + item.qty * item.weightTn,
    0,
  );

  const subtotalUsd = roundMoney(
    items.reduce(
      (acc, item) => acc + roundMoney(item.qty * item.supplierPriceUsd),
      0,
    ),
  );

  const igvUsd = roundMoney(subtotalUsd * IGV_RATE);
  const totalUsd = roundMoney(subtotalUsd + igvUsd);
  const totalPen = roundMoney(totalUsd * exchangeRate);

  return (
    <table className="mt-2 w-full border-collapse text-[11px]">
      <thead>
        <tr className="bg-sky-200">
          <th className="border border-black px-1 py-1">N°</th>
          <th className="border border-black px-1 py-1">Código proveedor</th>
          <th className="border border-black px-1 py-1">Descripción</th>
          <th className="border border-black px-1 py-1">Cant.</th>
          <th className="border border-black px-1 py-1">Peso TN</th>
          <th className="border border-black px-1 py-1">Precio Miromina</th>
          <th className="border border-black px-1 py-1">Total</th>
        </tr>
      </thead>

      <tbody>
        {items.map((item, index) => {
          const rowWeight = item.qty * item.weightTn;
          const rowTotal = roundMoney(item.qty * item.supplierPriceUsd);

          return (
            <tr key={item.id}>
              <td className="border border-black px-1 py-1 text-center">
                {startIndex + index + 1}
              </td>

              <td className="border border-black px-1 py-1 text-center">
                {item.productCode}
              </td>

              <td className="border border-black px-1 py-1">{item.name}</td>

              <td className="border border-black px-1 py-1 text-center">
                {item.qty}
              </td>

              <td className="border border-black px-1 py-1 text-right">
                {formatWeight(rowWeight)}
              </td>

              <td className="border border-black px-1 py-1 text-right">
                {formatMoney(item.supplierPriceUsd)}
              </td>

              <td className="border border-black px-1 py-1 text-right">
                {formatMoney(rowTotal)}
              </td>
            </tr>
          );
        })}
      </tbody>

      <tfoot>
        <tr className="font-bold">
          <td colSpan={3} className="border border-black px-1 py-1 text-right">
            TOTALES
          </td>

          <td className="border border-black px-1 py-1 text-center">
            {totalQty}
          </td>

          <td className="border border-black px-1 py-1 text-right">
            {formatWeight(totalWeightTn)}
          </td>

          <td className="border border-black px-1 py-1 text-right">Subtotal</td>

          <td className="border border-black px-1 py-1 text-right">
            ${formatMoney(subtotalUsd)}
          </td>
        </tr>

        <tr>
          <td colSpan={5} className="border-none" />

          <td className="border border-black px-1 py-1 text-right font-bold">
            IGV 18%
          </td>

          <td className="border border-black px-1 py-1 text-right font-bold">
            ${formatMoney(igvUsd)}
          </td>
        </tr>

        <tr>
          <td colSpan={5} className="border-none" />

          <td className="border border-black px-1 py-1 text-right font-extrabold">
            Total USD
          </td>

          <td className="border border-black px-1 py-1 text-right font-extrabold">
            ${formatMoney(totalUsd)}
          </td>
        </tr>

        <tr>
          <td colSpan={5} className="border-none" />

          <td className="border border-black px-1 py-1 text-right font-extrabold">
            Total PEN
          </td>

          <td className="border border-black px-1 py-1 text-right font-extrabold">
            S/ {formatMoney(totalPen)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
