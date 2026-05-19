import type { ClientInfo, QuoteItem } from "../types";

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);

    if (!raw) return fallback;

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export type SavedQuote = {
  id: string;
  createdAt: string;
  quoteNumber: string;
  sellerCode: string;
  client: ClientInfo;
  items: QuoteItem[];
};

const SAVED_QUOTES_KEY = "cotizador.savedQuotes";

export function getSavedQuotes(): SavedQuote[] {
  return loadFromStorage<SavedQuote[]>(SAVED_QUOTES_KEY, []);
}

export function saveQuoteToStorage(quote: SavedQuote) {
  const quotes = getSavedQuotes();

  const updated = quotes.some((q) => q.id === quote.id)
    ? quotes.map((q) => (q.id === quote.id ? quote : q))
    : [quote, ...quotes];

  saveToStorage(SAVED_QUOTES_KEY, updated);
}

export function deleteQuoteFromStorage(id: string) {
  const quotes = getSavedQuotes();

  saveToStorage(
    SAVED_QUOTES_KEY,
    quotes.filter((q) => q.id !== id),
  );
}