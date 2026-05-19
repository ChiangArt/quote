import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCatalog } from "./components/ProductCatalog";
import { QuoteDocument } from "./components/QuoteDocument";
import { PdfDownloadButton } from "./components/PdfDownloadButton";
import { QuoteConfigForm } from "./components/QuoteConfigForm";
import type { ClientInfo, Product, QuoteItem, SavedQuote } from "./types";
import { buildQuoteNumber, randomShortCode } from "./utils/random";
import {
  deleteQuoteFromStorage,
  getSavedQuotes,
  loadFromStorage,
  saveQuoteToStorage,
  saveToStorage,
} from "./utils/storage";
import logoTemporal from "./assets/logo_temporal.png";
import { SupplierQuoteDocument } from "./components/SupplierQuoteDocument";
import { PRODUCTS } from "./data/products";
import { PurchaseOrderDocument } from "./components/PurchaseOrderDocument";

const IGV_RATE = 0.18;
const DEFAULT_PROFIT_PERCENT = 5;

function generateQuoteRandom() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return 10000 + (array[0] % 90000);
  }

  return (Date.now() % 90000) + 10000;
}

function calculateClientPrice(supplierPriceUsd: number, profitPercent: number) {
  return supplierPriceUsd + supplierPriceUsd * (profitPercent / 100);
}

function App() {
  const logoUrl = logoTemporal;

  const docRef = useRef<HTMLDivElement | null>(null);
  const supplierDocRef = useRef<HTMLDivElement | null>(null);
  const purchaseOrderDocRef = useRef<HTMLDivElement | null>(null);

  const [catalogQuery, setCatalogQuery] = useState("");
  const [uiMessage, setUiMessage] = useState<{
    text: string;
    type: "success" | "error" | "warning" | "info";
  } | null>(null);
  const [sellerCode, setSellerCode] = useState(() =>
    loadFromStorage("cotizador.sellerCode", ""),
  );

  const [quoteRandom, setQuoteRandom] = useState(() => generateQuoteRandom());

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

  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>(() =>
    getSavedQuotes(),
  );

  const [catalogValues, setCatalogValues] = useState<
    Record<string, { supplierPriceUsd?: string; isEditing?: boolean }>
  >(() => loadFromStorage("cotizador.catalogValues", {}));

  const quoteNumber = useMemo(
    () => buildQuoteNumber(sellerCode, quoteRandom),
    [sellerCode, quoteRandom],
  );

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

    return PRODUCTS.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const codeMatch = String(p.code).toLowerCase().includes(q);

      return nameMatch || codeMatch;
    });
  }, [catalogQuery]);

  function refreshSavedQuotes() {
    setSavedQuotes(getSavedQuotes());
  }

  function handleUpdateCatalogValue(
    code: string,
    patch: { supplierPriceUsd?: string; isEditing?: boolean },
  ) {
    setCatalogValues((prev) => ({
      ...prev,
      [code]: {
        supplierPriceUsd: prev[code]?.supplierPriceUsd ?? "",
        isEditing: prev[code]?.isEditing ?? false,
        ...patch,
      },
    }));

    if (patch.supplierPriceUsd !== undefined) {
      const supplierPriceUsd = Number(patch.supplierPriceUsd || 0);

      setItems((prev) =>
        prev.map((it) => {
          if (it.productCode !== code) return it;

          const unitPriceUsd = calculateClientPrice(
            supplierPriceUsd,
            it.profitPercent,
          );

          return {
            ...it,
            supplierPriceUsd,
            unitPriceUsd,
          };
        }),
      );
    }
  }

  function handleSaveQuote() {
    if (!items.length) {
      setUiMessage({
        text: "Agrega al menos un producto antes de guardar.",
        type: "warning",
      });
      return;
    }

    const quote: SavedQuote = {
      id: quoteNumber,
      createdAt: new Date().toISOString(),
      quoteNumber,
      sellerCode,
      client,
      items,
    };

    saveQuoteToStorage(quote);
    refreshSavedQuotes();

    setItems([]);

    setClient((prev) => ({
      ...prev,
      razonSocial: "",
      ruc: "",
      direccion: "",
      fechaISO: new Date().toISOString().slice(0, 10),
    }));

    setQuoteRandom(generateQuoteRandom());

    setUiMessage({
      text: `Cotización ${quoteNumber} guardada correctamente.`,
      type: "success",
    });
  }

  function handleLoadQuote(quote: SavedQuote) {
    setSellerCode(quote.sellerCode);
    setClient(quote.client);
    setItems(quote.items);

    const numberPart = Number(quote.quoteNumber.split("-").pop());

    if (Number.isFinite(numberPart)) {
      setQuoteRandom(numberPart);
    }

    setUiMessage({
      text: `Cotización ${quote.quoteNumber} cargada para editar.`,
      type: "info",
    });
  }

  function handleDeleteQuote(id: string) {
    deleteQuoteFromStorage(id);
    refreshSavedQuotes();

    setUiMessage({
      text: "Cotización eliminada correctamente.",
      type: "success",
    });
  }

  function handleAddProduct(product: Product) {
    if (items.some((it) => it.productCode === product.code)) {
      setUiMessage({
        text: `El producto ${product.code} ya fue agregado. No se permite duplicar.`,
        type: "error",
      });
      return;
    }

    const v = catalogValues[product.code];
    const supplierPriceUsd = Number(v?.supplierPriceUsd) || 0;
    const profitPercent = DEFAULT_PROFIT_PERCENT;
    const unitPriceUsd = calculateClientPrice(supplierPriceUsd, profitPercent);
    const weightTn = Number(product.weightTn ?? 0);

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
        supplierPriceUsd,
        profitPercent,
        unitPriceUsd,
      },
    ]);
  }

  function handleRemoveItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function handleUpdateItem(
    id: string,
    patch: Partial<
      Pick<
        QuoteItem,
        | "qty"
        | "weightTn"
        | "supplierPriceUsd"
        | "profitPercent"
        | "unitPriceUsd"
      >
    >,
  ) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    );
  }

  function handleProfitPercentChange(id: string, value: string) {
    if (!/^\d*\.?\d*$/.test(value)) return;

    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;

        const profitPercent = value === "" ? 0 : Number(value);
        const unitPriceUsd = calculateClientPrice(
          it.supplierPriceUsd,
          profitPercent,
        );

        return {
          ...it,
          profitPercent,
          unitPriceUsd,
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
      {uiMessage ? (
        <div
          className={`fixed right-4 top-4 z-50 overflow-hidden rounded-lg shadow-2xl ${
            uiMessage.type === "success"
              ? "border border-emerald-300 bg-emerald-500"
              : uiMessage.type === "error"
                ? "border border-red-300 bg-red-500"
                : uiMessage.type === "warning"
                  ? "border border-amber-300 bg-amber-500"
                  : "border border-sky-300 bg-sky-500"
          }`}
        >
          <div className="flex items-start justify-between gap-4 px-4 py-3 text-sm font-semibold text-white">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {uiMessage.type === "success"
                  ? "✓"
                  : uiMessage.type === "error"
                    ? "✕"
                    : uiMessage.type === "warning"
                      ? "!"
                      : "i"}
              </span>

              <span>{uiMessage.text}</span>
            </div>

            <button
              type="button"
              onClick={() => setUiMessage(null)}
              className="text-white/80 transition hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}
      <div className="mx-auto grid max-w-375 grid-cols-[420px_1fr] gap-4 p-4 pb-10 max-[1100px]:grid-cols-1 print:block print:p-0 print:m-0">
        <aside className="flex flex-col gap-4 print:hidden">
          <section className="rounded-none border border-slate-300 bg-white">
            <div className="border-b border-slate-300 px-4 py-3">
              <div className="text-sm font-extrabold">
                Cotizaciones guardadas
              </div>
              <div className="text-xs text-slate-600">
                Guarda, abre, edita o elimina cotizaciones.
              </div>
            </div>

            <div className="p-4">
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveQuote}
                  disabled={!items.length}
                  className="flex-1 rounded-none border border-slate-300 bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
                >
                  Guardar cotización
                </button>
              </div>

              <div className="flex max-h-52 flex-col gap-2 overflow-auto">
                {savedQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="border border-slate-200 bg-slate-50 p-2 text-xs"
                  >
                    <div className="font-extrabold">{q.quoteNumber}</div>

                    <div className="text-slate-600">
                      {q.client.razonSocial || "Sin cliente"}
                    </div>

                    <div className="text-[10px] text-slate-500">
                      {new Date(q.createdAt).toLocaleDateString("es-PE")}
                    </div>

                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadQuote(q)}
                        className="rounded-none border border-slate-300 bg-white px-2 py-1 font-semibold"
                      >
                        Abrir
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuote(q.id)}
                        className="rounded-none border border-red-200 bg-white px-2 py-1 font-semibold text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}

                {!savedQuotes.length ? (
                  <div className="text-xs text-slate-500">
                    Aún no hay cotizaciones guardadas.
                  </div>
                ) : null}
              </div>
            </div>
          </section>

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
              <label className="mb-1 block text-xs text-slate-600">
                Buscar producto
              </label>

              <input
                className="w-full rounded-none border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                placeholder="Ej: código, PLANCHA, BARRA, TUBO..."
              />

              <div style={{ height: 12 }} />

              <ProductCatalog
                products={filteredCatalog}
                onAdd={handleAddProduct}
                values={catalogValues}
                onChangeValues={handleUpdateCatalogValue}
                onToggleEdit={(code, next) =>
                  setCatalogValues((prev) => ({
                    ...prev,
                    [code]: {
                      supplierPriceUsd: prev[code]?.supplierPriceUsd,
                      isEditing: next,
                    },
                  }))
                }
              />
            </div>
          </section>
        </aside>

        <main className="grid gap-4 print:block">
          <section className="rounded-none border border-slate-300 bg-white print:hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-4 py-3">
              <div>
                <div className="text-sm font-extrabold">Items</div>
              </div>
            </div>

            <div className="p-4">
              <div className="max-h-65 overflow-auto">
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr>
                      <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">
                        #
                      </th>
                      <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">
                        Código
                      </th>
                      <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-left">
                        Producto
                      </th>
                      <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-right">
                        Cant.
                      </th>
                      <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-right">
                        Peso TN
                      </th>
                      <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-right">
                        Precio Unit. Miromina
                      </th>
                      <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-right">
                        % Gan.
                      </th>
                      <th className="border border-slate-300 bg-slate-100 px-2 py-1 text-right">
                        Precio Cliente
                      </th>
                      <th className="border border-slate-300 bg-slate-100 px-2 py-1" />
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
                            className="w-full rounded-none border border-slate-300 bg-white px-2 py-1 text-right text-xs outline-none focus:border-slate-500"
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

                        <td className="border border-slate-300 bg-slate-50 px-2 py-1 text-right font-semibold text-slate-700">
                          {it.supplierPriceUsd > 0
                            ? it.supplierPriceUsd.toFixed(2)
                            : "0.00"}
                        </td>

                        <td className="border border-slate-300 px-2 py-1 text-right">
                          <input
                            className="w-full rounded-none border border-slate-300 bg-white px-2 py-1 text-right text-xs outline-none focus:border-slate-500"
                            inputMode="decimal"
                            value={String(it.profitPercent)}
                            onChange={(e) =>
                              handleProfitPercentChange(it.id, e.target.value)
                            }
                          />
                        </td>

                        <td className="border border-slate-300 px-2 py-1 text-right font-bold">
                          {it.unitPriceUsd.toFixed(2)}
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
                          colSpan={9}
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

          <section className="rounded-none border border-slate-300 bg-white print:m-0 print:border-none">
            <div className="flex items-center justify-between gap-3 border-b border-slate-300 px-4 py-3 print:hidden">
              <div>
                <div className="text-sm font-extrabold">Vista previa PDF</div>
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
              <div className="flex gap-2 print:hidden">
                <PdfDownloadButton
                  targetRef={docRef}
                  fileName={`CLIENTE-${quoteNumber}.pdf`}
                  disabled={!items.length}
                  label="Cotización para Cliente"
                />

                <PdfDownloadButton
                  targetRef={supplierDocRef}
                  fileName={`PROVEEDOR-${quoteNumber}.pdf`}
                  disabled={!items.length}
                  label="Cotización para Proveedor"
                />

                <PdfDownloadButton
                  targetRef={purchaseOrderDocRef}
                  fileName={`OC-${quoteNumber}.pdf`}
                  disabled={!items.length}
                  label="Orden de Compra"
                />
              </div>

              <div className="mt-3 w-full overflow-x-auto overflow-y-visible bg-slate-100 p-4 print:m-0 print:block print:overflow-visible print:bg-white print:p-0">
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

                <div style={{ display: "none" }}>
                  <div ref={purchaseOrderDocRef}>
                    <PurchaseOrderDocument
                      logoUrl={logoUrl}
                      quoteNumber={quoteNumber}
                      client={client}
                      items={items}
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
