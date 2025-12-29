import { useFiscalStore } from "@/store/fiscal";

export const FMNumbersPage = () => {
  const { data } = useFiscalStore();

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold">Fiscal Module Numbers</h2>
      {data ? (
        <pre className="text-xs bg-muted rounded p-3 whitespace-pre-wrap">
          {JSON.stringify(data.fmNumbers, null, 2)}
        </pre>
      ) : (
        <p className="text-sm text-muted-foreground">
          Load a fiscal memory file first.
        </p>
      )}
    </div>
  );
};
