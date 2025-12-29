import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function App() {
  const MIN_DUMP_SIZE = 0xa00; // minimum bytes for a valid fiscal memory dump
  const [isLoading, setIsLoading] = useState(false);
  const [isSampleLoading, setIsSampleLoading] = useState(false);
  const [loadedData, setLoadedData] = useState<any | null>(null);
  const [loadedPath, setLoadedPath] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
      setLoadedData(result.data);
      setLoadedPath(result.filePath);
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

  const handleLoadSample = async () => {
    setIsSampleLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/sample.bin");
      if (!response.ok) {
        throw new Error("sample.bin not found");
      }
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength < MIN_DUMP_SIZE) {
        throw new Error(
          `sample.bin is too small (${arrayBuffer.byteLength} bytes).`
        );
      }
      const data = await window.api.parseFiscalMemory(arrayBuffer);
      console.log("Fiscal memory sample data:", data);
      setLoadedData(data);
      setLoadedPath("public/sample.bin");
      setMessage("Loaded sample.bin from public/");
    } catch (error: unknown) {
      console.error(error);
      const reason =
        error instanceof Error ? error.message : "Unknown load error.";
      setMessage(`Failed to load sample.bin: ${reason}`);
    } finally {
      setIsSampleLoading(false);
    }
  };

  const handleSaveAs = async () => {
    if (!loadedData) {
      setMessage("Nothing to save. Load a fiscal memory file first.");
      return;
    }
    setMessage(null);
    try {
      const res = await window.api.saveFiscalMemoryAs(loadedData);
      if (!res) {
        setMessage("Save canceled.");
        return;
      }
      setMessage(`Saved to: ${res.filePath}`);
    } catch (error: unknown) {
      console.error(error);
      const reason =
        error instanceof Error ? error.message : "Unknown save error.";
      setMessage(`Failed to save: ${reason}`);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>UI Shell Ready</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            All previous pages and custom logic were removed. Use the Shadcn UI
            components to build a fresh flow from here.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleLoadFiscalMemory}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Loading..." : "Load Fiscal Memory"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleLoadSample}
            disabled={isSampleLoading}
            className="w-full"
          >
            {isSampleLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isSampleLoading ? "Loading..." : "Load sample.bin (public/)"}
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSaveAs}
            disabled={!loadedData}
            className="w-full"
          >
            Save Fiscal Memory As...
          </Button>
          {message && (
            <p className="text-xs text-muted-foreground text-center">{message}</p>
          )}
          {loadedPath && (
            <p className="text-[10px] text-muted-foreground text-center">
              Current: {loadedPath}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
