import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function App() {
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
          <Button type="button" variant="outline">
            Get Started
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default App;
