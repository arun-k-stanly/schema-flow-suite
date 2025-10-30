import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import UploadXSD from "./pages/UploadXSD";
import GenerateXML from "./pages/GenerateXML";
import DataModel from "./pages/DataModel";
import BuildPipeline from "./pages/BuildPipeline";
import Execution from "./pages/Execution";
import ValidationNew from "./pages/ValidationNew";
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
            <Route path="/projects" element={<Projects />} />
            <Route path="/project/:projectId" element={<ProjectDetail />} />
            <Route path="/upload" element={<UploadXSD />} />
            <Route path="/generate-xml" element={<GenerateXML />} />
            <Route path="/data-model" element={<DataModel />} />
            <Route path="/build-pipeline" element={<BuildPipeline />} />
            <Route path="/execution" element={<Execution />} />
            <Route path="/validation" element={<ValidationNew />} />
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
