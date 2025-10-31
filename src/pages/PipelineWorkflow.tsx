import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, FileCode, Database, GitBranch, PlayCircle, Rocket } from "lucide-react";
import UploadXSD from "./UploadXSD";
import GenerateXML from "./GenerateXML";
import DataModel from "./DataModel";
import BuildPipeline from "./BuildPipeline";
import TestPipeline from "./TestPipeline";
import DeployPipeline from "./DeployPipeline";

const workflowSteps = [
  { id: "upload", label: "Upload XSD", icon: FileText, component: UploadXSD },
  { id: "generate", label: "Generate XML", icon: FileCode, component: GenerateXML },
  { id: "model", label: "Data Model", icon: Database, component: DataModel },
  { id: "build", label: "Build Pipeline", icon: GitBranch, component: BuildPipeline },
  { id: "test", label: "Test Pipeline", icon: PlayCircle, component: TestPipeline },
  { id: "deploy", label: "Deploy Pipeline", icon: Rocket, component: DeployPipeline },
];

export default function PipelineWorkflow() {
  const { projectId, pipelineId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState("upload");

  const currentStepIndex = workflowSteps.findIndex(step => step.id === activeStep);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/project/${projectId}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">
            {pipelineId === "new" ? "Create New Pipeline" : "Pipeline Workflow"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete all steps to build and deploy your data pipeline
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === activeStep;
          const isCompleted = index < currentStepIndex;
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setActiveStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : isCompleted
                    ? "bg-success/20 text-success border border-success/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {step.label}
              </button>
              {index < workflowSteps.length - 1 && (
                <div className="w-8 h-0.5 bg-border mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Workflow Content */}
      <div className="bg-card rounded-lg border border-border p-6">
        {workflowSteps.map((step) => {
          const StepComponent = step.component;
          return (
            <div key={step.id} className={activeStep === step.id ? "block" : "hidden"}>
              <StepComponent />
            </div>
          );
        })}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => {
              const prevIndex = currentStepIndex - 1;
              if (prevIndex >= 0) {
                setActiveStep(workflowSteps[prevIndex].id);
              }
            }}
            disabled={currentStepIndex === 0}
          >
            Previous Step
          </Button>
          <Button
            onClick={() => {
              const nextIndex = currentStepIndex + 1;
              if (nextIndex < workflowSteps.length) {
                setActiveStep(workflowSteps[nextIndex].id);
              }
            }}
            disabled={currentStepIndex === workflowSteps.length - 1}
          >
            Next Step
          </Button>
        </div>
      </div>
    </div>
  );
}
