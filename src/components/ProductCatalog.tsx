import type { Product } from "../types";

type CatalogValue = {
  supplierPriceUsd?: string;
  isEditing?: boolean;
};

export function ProductCatalog({
  products,
  onAdd,
  values,
  onChangeValues,
  onToggleEdit,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
  values: Record<string, CatalogValue>;
  onChangeValues: (
    code: string,
    patch: Partial<Pick<CatalogValue, "supplierPriceUsd">>,
  ) => void;
  onToggleEdit: (code: string, isEditing: boolean) => void;
}) {
  return (
    <div
      className="grid max-h-[calc(100vh-260px)] gap-2 overflow-auto pr-1"
      role="list"
    >
      {products.map((p) => {
        const value = values[p.code];

        return (
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

            <div className="mt-2">
              <div className="mb-1 text-[11px] text-slate-600">
                Precio Unit.Nueva Miromina USD
              </div>

              <input
                className={`w-full rounded-none border border-slate-300 px-2 py-1 text-xs outline-none focus:border-slate-500 ${
                  value?.isEditing
                    ? "bg-white text-slate-900"
                    : "bg-slate-50 text-slate-500"
                }`}
                inputMode="decimal"
                value={value?.supplierPriceUsd ?? ""}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (!/^\d*\.?\d*$/.test(inputValue)) return;

                  onChangeValues(p.code, {
                    supplierPriceUsd: inputValue,
                  });
                }}
                placeholder="0.00"
                readOnly={!value?.isEditing}
                disabled={!value?.isEditing}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                className="rounded-none border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                onClick={() => onToggleEdit(p.code, !value?.isEditing)}
              >
                {value?.isEditing ? "Guardar" : "Editar precio"}
              </button>

              <button
                type="button"
                className="rounded-none border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                onClick={() => onAdd(p)}
              >
                Agregar
              </button>
            </div>
          </div>
        );
      })}

      {!products.length ? (
        <div className="text-xs text-slate-600">Sin resultados.</div>
      ) : null}
    </div>
  );
}
