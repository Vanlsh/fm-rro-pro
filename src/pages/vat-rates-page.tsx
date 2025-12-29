import { useFiscalStore } from "@/store/fiscal";

export const VatRatesPage = () => {
  const { data } = useFiscalStore();

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold">VAT Rates</h2>
      {data ? (
        <pre className="text-xs bg-muted rounded p-3 whitespace-pre-wrap">
          {JSON.stringify(data.vatRates, null, 2)}
        </pre>
      ) : (
        <p className="text-sm text-muted-foreground">
          Load a fiscal memory file first.
        </p>
      )}
    </div>
  );
};
