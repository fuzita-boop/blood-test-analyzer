import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import NotFound from "@/pages/NotFound";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import History from "./pages/History";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Upload from "./pages/Upload";

function Routes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/upload" component={Upload} />
      <Route path="/report/:id" component={Report} />
      <Route path="/history" component={History} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Router hook={useHashLocation}>
            <Routes />
          </Router>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
