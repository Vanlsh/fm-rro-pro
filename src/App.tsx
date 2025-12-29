import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function App() {
  const [isLoading, setIsLoading] = useState(false);
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
      setMessage(`Loaded: ${result.filePath}`);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load file.");
    } finally {
      setIsLoading(false);
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
          {message && (
            <p className="text-xs text-muted-foreground text-center">{message}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
