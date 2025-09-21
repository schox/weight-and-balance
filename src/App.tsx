import { Button } from "@/components/ui/button"
import { Settings, Plane } from "lucide-react"

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plane className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Aircraft Weight & Balance Calculator</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">
            Setting up Weight & Balance Calculator...
          </h2>
          <div className="flex justify-center space-x-4">
            <Button>Get Started</Button>
            <Button variant="outline">Learn More</Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App