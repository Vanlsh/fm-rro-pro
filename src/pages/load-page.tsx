import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFiscalStore } from "@/store/fiscal";

export const LoadPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setData, setPath, message, setMessage } = useFiscalStore();

  const handleLoadFiscalMemory = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await window.api.openFiscalMemory();
      if (!result) {
        setMessage("Canceled.");
        return;
      }
      console.log("Fiscal memory data:", result.data);
      setData(result.data);
      setPath(result.filePath);
      setMessage(`Loaded: ${result.filePath}`);
    } catch (error: unknown) {
      console.error(error);
      const reason =
        error instanceof Error ? error.message : "Unknown load error.";
      setMessage(`Failed to load file: ${reason}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Load a fiscal memory file to view it in the console.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={handleLoadFiscalMemory}
        disabled={isLoading}
        className="w-full md:w-auto"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Loading..." : "Load Fiscal Memory"}
      </Button>
      {message && (
        <p className="text-xs text-muted-foreground text-center">{message}</p>
      )}
    </div>
  );
};
