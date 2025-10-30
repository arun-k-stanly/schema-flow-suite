import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import UploadXSD from "./pages/UploadXSD";
import GenerateXML from "./pages/GenerateXML";
import DataModel from "./pages/DataModel";
import PySparkPipeline from "./pages/PySparkPipeline";
import Execution from "./pages/Execution";
import Validation from "./pages/Validation";
import DataQuality from "./pages/DataQuality";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadXSD />} />
            <Route path="/generate-xml" element={<GenerateXML />} />
            <Route path="/data-model" element={<DataModel />} />
            <Route path="/pyspark" element={<PySparkPipeline />} />
            <Route path="/execution" element={<Execution />} />
            <Route path="/validation" element={<Validation />} />
            <Route path="/quality" element={<DataQuality />} />
            <Route path="/analytics" element={<Analytics />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
