import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BottomNavigation } from "@/components/bottom-navigation";
import Home from "@/pages/home";
import History from "@/pages/history";
import Charts from "@/pages/charts";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-bg-light pb-16">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/history" component={History} />
        <Route path="/charts" component={Charts} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
