  export type Product = {
    code: string;
    name: string;
    supplier?: string;
    unit?: string;
    pricePenNoIgv?: number;
    priceUsdNoIgv?: number;
    exchangeRate?: number;
    weightTn: number;
  };

export type QuoteItem = {
  id: string;
  randomCode: string;
  productCode: string;
  name: string;
  qty: number;
  weightTn: number;
  supplierPriceUsd: number;
  supplierPriceUpdatedAt?: string;
  supplierPriceValidDays?: number;
  profitPercent: number;
  unitPriceUsd: number;
};


  export type ClientInfo = {
    fechaISO: string;
    razonSocial: string;
    ruc: string;
    direccion: string;
    tipoCambio: string;
    correoAsesor: string;
    nombreAsesor: string;
    telefonoAsesor: string;
  };

  export type QuoteTotals = {
    totalQty: number;
    totalWeightTn: number;
    subtotalUsd: number;
    igvUsd: number;
    totalUsd: number;
    totalPen: number;
  };

  export type SavedQuote = {
    id: string;
    createdAt: string;
    quoteNumber: string;
    sellerCode: string;
    client: ClientInfo;
    items: QuoteItem[];
  };
