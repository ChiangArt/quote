import type { Product } from "../types";

export function ProductCatalog({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
}) {
  return (
    <div
      className="grid max-h-[calc(100vh-260px)] gap-2 overflow-auto pr-1"
      role="list"
    >
      {products.map((p) => (
        <div
          key={p.code}
          className="rounded-none border border-slate-300 bg-white p-3"
        >
          <div className="text-xs font-semibold leading-5">{p.name}</div>

          <div className="mt-1 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-700">Código:</span>{" "}
            {p.code}
          </div>

          <div className="mt-1 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-700">Peso TN:</span>{" "}
            {p.weightTn}
          </div>

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className="rounded-none border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
              onClick={() => onAdd(p)}
            >
              Agregar
            </button>
          </div>
        </div>
      ))}

      {!products.length ? (
        <div className="text-xs text-slate-600">Sin resultados.</div>
      ) : null}
    </div>
  );
}
