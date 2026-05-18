import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCatalog } from "./components/ProductCatalog";
import { QuoteDocument } from "./components/QuoteDocument";
import { PdfDownloadButton } from "./components/PdfDownloadButton";
import { QuoteConfigForm } from "./components/QuoteConfigForm";
import type { ClientInfo, Product, QuoteItem } from "./types";
import { buildQuoteNumber, randomShortCode } from "./utils/random";
import { loadFromStorage, saveToStorage } from "./utils/storage";
import logoTemporal from "./assets/logo_temporal.png";
import { SupplierQuoteDocument } from "./components/SupplierQuoteDocument";
import { PRODUCTS } from "./data/products";
const IGV_RATE = 0.18;

function App() {
  const [catalogQuery, setCatalogQuery] = useState("");
  const logoUrl = logoTemporal;
  const [uiMessage, setUiMessage] = useState<string | null>(null);
  const [sellerCode, setSellerCode] = useState(() =>
    loadFromStorage("cotizador.sellerCode", ""),
  );
  const [quoteRandom] = useState(() =>
    Math.floor(10000 + Math.random() * 90000),
  );

  const [client, setClient] = useState<ClientInfo>(() => ({
    ...loadFromStorage<
      Pick<
        ClientInfo,
        | "razonSocial"
        | "ruc"
        | "direccion"
        | "tipoCambio"
        | "correoAsesor"
        | "nombreAsesor"
        | "telefonoAsesor"
      >
    >("cotizador.client", {
      razonSocial: "",
      ruc: "",
      direccion: "",
      tipoCambio: "",
      correoAsesor: "",
      nombreAsesor: "",
      telefonoAsesor: "",
    }),
    fechaISO: new Date().toISOString().slice(0, 10),
  }));

  const [items, setItems] = useState<QuoteItem[]>([]);
  const [catalogValues, setCatalogValues] = useState<
    Record<string, { unitPriceUsd?: string; isEditing?: boolean }>
  >(() => loadFromStorage("cotizador.catalogValues", {}));

  const quoteNumber = useMemo(
    () => buildQuoteNumber(sellerCode, quoteRandom),
    [sellerCode, quoteRandom],
  );

  const docRef = useRef<HTMLDivElement | null>(null);
  const supplierDocRef = useRef<HTMLDivElement | null>(null);

  const totals = useMemo(() => {
    const totalQty = items.reduce(
      (acc, it) => acc + (Number.isFinite(it.qty) ? it.qty : 0),
      0,
    );

    const totalWeightTn = items.reduce(
      (acc, it) => acc + (Number.isFinite(it.weightTn) ? it.weightTn : 0),
      0,
    );

    const subtotalUsd = items.reduce(
      (acc, it) => acc + it.qty * it.unitPriceUsd,
      0,
    );

    const igvUsd = subtotalUsd * IGV_RATE;

    const totalUsd = subtotalUsd + igvUsd;

    const totalPen = totalUsd * (Number(client.tipoCambio) || 0);
    return {
      totalQty,
      totalWeightTn,
      subtotalUsd,
      igvUsd,
      totalUsd,
      totalPen,
    };
  }, [client.tipoCambio, items]);

  const filteredCatalog = useMemo(() => {
    const q = catalogQuery.trim().toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q));
  }, [catalogQuery]);

  function handleAddProduct(product: Product) {
    if (items.some((it) => it.productCode === product.code)) {
      setUiMessage(
        `El producto ${product.code} ya fue agregado. No se permite duplicar.`,
      );
      return;
    }
    const v = catalogValues[product.code];
    const unitPriceUsd = Number(v?.unitPriceUsd || 0);
    const weightTn = Number(product.weightTn ?? 0);
    if (!unitPriceUsd || unitPriceUsd <= 0) {
      setUiMessage(
        `Agrega el precio (USD) para el producto ${product.code} antes de agregar.`,
      );
      return;
    }

    setUiMessage(null);
    setItems((prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        randomCode: randomShortCode(),
        productCode: product.code,
        name: product.name,
        qty: 1,
        weightTn,
        unitPriceUsd,
      },
    ]);
  }

  function handleRemoveItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function handleUpdateItem(
    id: string,
    patch: Partial<Pick<QuoteItem, "qty" | "weightTn" | "unitPriceUsd">>,
  ) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        return {
          ...it,
          ...patch,
        };
      }),
    );
  }

  useEffect(() => {
    saveToStorage("cotizador.sellerCode", sellerCode);
  }, [sellerCode]);

  useEffect(() => {
    saveToStorage("cotizador.client", {
      razonSocial: client.razonSocial,
      ruc: client.ruc,
      direccion: client.direccion,
      tipoCambio: client.tipoCambio,
      correoAsesor: client.correoAsesor,
      nombreAsesor: client.nombreAsesor,
      telefonoAsesor: client.telefonoAsesor,
    });
  }, [
    client.nombreAsesor,
    client.telefonoAsesor,
    client.correoAsesor,
    client.direccion,
    client.razonSocial,
    client.ruc,
    client.tipoCambio,
  ]);

  useEffect(() => {
    saveToStorage("cotizador.catalogValues", catalogValues);
  }, [catalogValues]);

  return (
    <>
      <div className="mx-auto grid max-w-375 grid-cols-[420px_1fr] gap-4 p-4 pb-10 max-[1100px]:grid-cols-1 print:block print:p-0 print:m-0">
        {/* IZQUIERDA: DATOS + CATÁLOGO */}
        <aside className="flex flex-col gap-4 print:hidden">
          {" "}
          <QuoteConfigForm
            sellerCode={sellerCode}
            onSellerCode={setSellerCode}
            client={client}
            onClient={(patch) =>
              setClient((c) => ({
                ...c,
                ...patch,
              }))
            }
          />
          <section className="rounded-none border border-slate-300 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-4 py-3">
              <div>
                <div className="text-sm font-extrabold">Catálogo</div>
                <div className="text-xs text-slate-600">
                  Click para agregar a la cotización
                </div>
              </div>

              <span className="rounded-none border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
                {items.length} items
              </span>
            </div>

            <div className="p-4">
              {uiMessage ? (
                <div className="mb-3 border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                  {uiMessage}
                </div>
              ) : null}

              <label className="mb-1 block text-xs text-slate-600">
                Buscar producto
              </label>

              <input
                className="w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                placeholder="Ej: PLANCHA, BARRA, TUBO..."
              />

              <div style={{ height: 12 }} />

              <ProductCatalog
                products={filteredCatalog}
                onAdd={handleAddProduct}
                values={catalogValues}
                onChangeValues={(code, patch) =>
                  setCatalogValues((prev) => ({
                    ...prev,
                    [code]: {
                      unitPriceUsd: prev[code]?.unitPriceUsd ?? "",
                      isEditing: prev[code]?.isEditing ?? false,
                      ...patch,
                    },
                  }))
                }
                onToggleEdit={(code, next) =>
                  setCatalogValues((prev) => ({
                    ...prev,
                    [code]: {
                      unitPriceUsd: prev[code]?.unitPriceUsd,
                      isEditing: next,
                    },
                  }))
                }
              />
            </div>
          </section>
        </aside>

        {/* DERECHA: ITEMS + VISTA PREVIA */}
        <main className="grid gap-4 print:block">
          <section className="rounded-none border border-slate-300 bg-white print:hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-4 py-3">
              <div>
                <div className="text-sm font-extrabold">Items</div>
                <div className="text-xs text-slate-600">
                  Cantidad se edita aquí (el PDF no muestra inputs)
                </div>
              </div>
            </div>

            <div className="p-4">
              <div className="max-h-65 overflow-auto">
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr>
                      <th
                        className="border border-slate-300 bg-slate-100 px-2 py-1 text-left"
                        style={{ width: 38 }}
                      >
                        #
                      </th>
                      <th
                        className="border border-slate-300 bg-slate-100 px-2 py-1 text-left"
                        style={{ width: 90 }}
                      >
                        Código
                      </th>
                      <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">
                        Producto
                      </th>
                      <th
                        className="border border-slate-300 bg-slate-100 px-2 py-1 text-right"
                        style={{ width: 90 }}
                      >
                        Cant.
                      </th>
                      <th
                        className="border border-slate-300 bg-slate-100 px-2 py-1 text-right"
                        style={{ width: 95 }}
                      >
                        Peso (TN)
                      </th>
                      <th
                        className="border border-slate-300 bg-slate-100 px-2 py-1 text-right"
                        style={{ width: 120 }}
                      >
                        P. Unit (USD)
                      </th>
                      <th
                        className="border border-slate-300 bg-slate-100 px-2 py-1"
                        style={{ width: 52 }}
                      />
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={it.id}>
                        <td className="border border-slate-300 px-2 py-1 text-right">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {it.productCode}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">
                          {it.name}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-right">
                          <input
                            className="w-full rounded-none border border-slate-300 bg-white px-2 py-1 text-xs text-right outline-none focus:border-slate-500"
                            inputMode="numeric"
                            value={String(it.qty)}
                            onChange={(e) => {
                              const value = e.target.value;

                              if (!/^\d*$/.test(value)) return;

                              handleUpdateItem(it.id, {
                                qty: value === "" ? 0 : Number(value),
                              });
                            }}
                          />
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-right">
                          {it.weightTn}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-right">
                          {it.unitPriceUsd}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-right">
                          <button
                            type="button"
                            className="rounded-none border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveItem(it.id)}
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!items.length ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="border border-slate-300 px-3 py-2 text-slate-600"
                        >
                          Agrega productos desde el catálogo.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-none border border-slate-300 bg-white print:border-none print:m-0">
            <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-4 py-3 print:hidden">
              <div>
                <div className="text-sm font-extrabold">Vista previa (PDF)</div>
                <div className="text-xs text-slate-600">
                  A4 sin cuadros tipo input
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-600">N° Cotización</div>
                <div className="text-sm font-extrabold">{quoteNumber}</div>
              </div>
            </div>

            <div className="p-4 print:p-0">
              <div className="flex gap-2">
                <PdfDownloadButton
                  targetRef={docRef}
                  fileName={`CLIENTE-${quoteNumber}.pdf`}
                  disabled={!items.length}
                  label="Descargar PDF Cliente"
                />

                <PdfDownloadButton
                  targetRef={supplierDocRef}
                  fileName={`PROVEEDOR-${quoteNumber}.pdf`}
                  disabled={!items.length}
                  label="Descargar PDF Proveedor"
                />
              </div>

              <div className="mt-3 w-full overflow-x-auto overflow-y-visible bg-slate-100 p-4 print:m-0 print:p-0 print:block print:bg-white print:overflow-visible">
                <div
                  id="pdf-root"
                  ref={docRef}
                  className="mx-auto w-[210mm] min-w-[210mm] max-w-[210mm] bg-white px-[10mm] py-[8mm] print:mx-0 print:w-[190mm] print:min-w-[190mm] print:max-w-[190mm] print:p-0 print:shadow-none"
                >
                  <QuoteDocument
                    logoUrl={logoUrl}
                    quoteNumber={quoteNumber}
                    client={client}
                    items={items}
                    totals={totals}
                  />
                </div>

                <div style={{ display: "none" }}>
                  <div ref={supplierDocRef}>
                    <SupplierQuoteDocument
                      logoUrl={logoUrl}
                      quoteNumber={quoteNumber}
                      client={client}
                      items={items}
                      totals={totals}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default App;
