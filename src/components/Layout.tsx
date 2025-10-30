import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Database, 
  FileCode, 
  FileText, 
  GitBranch, 
  PlayCircle, 
  CheckCircle2, 
  BarChart3,
  FolderOpen,
  Home
} from "lucide-react";

const navigationItems = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/projects", icon: FolderOpen, label: "Projects" },
  { path: "/upload", icon: FileText, label: "Upload XSD" },
  { path: "/generate-xml", icon: FileCode, label: "Generate XML" },
  { path: "/data-model", icon: Database, label: "Data Model" },
  { path: "/build-pipeline", icon: GitBranch, label: "Build Pipeline" },
  { path: "/execution", icon: PlayCircle, label: "Execution" },
  { path: "/validation", icon: CheckCircle2, label: "Validation" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
];

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Database className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Data Engineering Workflow</h1>
              <p className="text-xs text-muted-foreground">XSD to Analytics Pipeline</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-[73px] z-40">
        <div className="container mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};
