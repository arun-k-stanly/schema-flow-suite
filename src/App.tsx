import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Button } from "./components/ui/button";
import { ArrowLeft } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import PipelineWorkflow from "./pages/PipelineWorkflow";
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
            <Route path="/project/:projectId/pipeline/:pipelineId" element={<PipelineWorkflow />} />
            <Route path="/project/:projectId/pipeline/:pipelineId/execution" element={
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/project/${window.location.pathname.split('/')[2]}`}>
                      <ArrowLeft className="w-5 h-5" />
                    </Link>
                  </Button>
                  <h2 className="text-2xl font-bold">Pipeline Execution</h2>
                </div>
                <Execution />
              </div>
            } />
            <Route path="/project/:projectId/pipeline/:pipelineId/validation" element={
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/project/${window.location.pathname.split('/')[2]}`}>
                      <ArrowLeft className="w-5 h-5" />
                    </Link>
                  </Button>
                  <h2 className="text-2xl font-bold">Pipeline Validation</h2>
                </div>
                <ValidationNew />
              </div>
            } />
            <Route path="/project/:projectId/pipeline/:pipelineId/analytics" element={
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/project/${window.location.pathname.split('/')[2]}`}>
                      <ArrowLeft className="w-5 h-5" />
                    </Link>
                  </Button>
                  <h2 className="text-2xl font-bold">Pipeline Analytics</h2>
                </div>
                <Analytics />
              </div>
            } />
            {/* Redirects from old routes to new structure */}
            <Route path="/upload" element={<Projects />} />
            <Route path="/generate-xml" element={<Projects />} />
            <Route path="/data-model" element={<Projects />} />
            <Route path="/build-pipeline" element={<Projects />} />
            <Route path="/execution" element={<Projects />} />
            <Route path="/validation" element={<Projects />} />
            <Route path="/analytics" element={<Projects />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
