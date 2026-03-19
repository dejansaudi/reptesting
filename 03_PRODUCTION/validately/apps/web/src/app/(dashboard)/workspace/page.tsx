"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { STAGE_META } from "@validately/shared";
import { useProjectStore } from "@/store/useProjectStore";
import { apiFetch } from "@/lib/api";
import { useAutosave } from "@/hooks/useAutosave";

// Workspace components
import { useUser } from "@/hooks/useUser";
import { StageNav } from "@/components/workspace/StageNav";
import { SaveStatus } from "@/components/workspace/SaveStatus";
import { ErrorBoundary } from "@/components/workspace/ErrorBoundary";
import { FloatingGateStatus } from "@/components/workspace/FloatingGateStatus";
import { GateRequirements } from "@/components/workspace/GateRequirements";
import { AssessPanel } from "@/components/workspace/AssessPanel";
import { AICoach } from "@/components/workspace/AICoach";
import { STAGE_COMPONENTS } from "@/components/workspace/stages";

// Modals
import { SnapshotsModal } from "@/components/workspace/modals/SnapshotsModal";
import { ShareModal } from "@/components/workspace/modals/ShareModal";
import { SettingsModal } from "@/components/workspace/modals/SettingsModal";
import { PricingModal } from "@/components/workspace/modals/PricingModal";
import { ExportModal } from "@/components/workspace/modals/ExportModal";
import { ResearchModal } from "@/components/workspace/modals/ResearchModal";

// FIX P2: Skeleton loading component
function WorkspaceSkeleton() {
  return (
    <div className="flex h-full animate-pulse">
      <aside className="hidden md:block w-[220px] border-r border-border bg-surface-1 p-3">
        <div className="h-4 bg-surface-3 rounded w-16 mb-4" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-11 bg-surface-2 rounded-md mb-1.5" />
        ))}
      </aside>
      <main className="flex-1 flex flex-col">
        <div className="h-[60px] bg-surface-1 border-b border-border" />
        <div className="flex-1 p-5 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface-2 rounded-lg" />
          ))}
        </div>
      </main>
    </div>
  );
}

function useLoadProject() {
  const { projectId, setProject } = useProjectStore();
  const [loading, setLoading] = useState(!projectId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await apiFetch("/projects");
        if (!res.ok) {
          setError("Failed to load projects");
          setLoading(false);
          return;
        }
        const { data: projects } = await res.json();
        if (projects && projects.length > 0) {
          const p = projects[0];
          if (!cancelled) {
            setProject({
              id: p.id,
              data: p.data || {},
              stageIdx: p.stageIdx ?? 0,
              version: p.version ?? 0,
            });
          }
        } else {
          if (cancelled) return;
          const createRes = await apiFetch("/projects", {
            method: "POST",
            body: JSON.stringify({ name: "My Startup" }),
          });
          if (!createRes.ok) {
            if (!cancelled) {
              setError("Failed to create project");
              setLoading(false);
            }
            return;
          }
          const newProject = await createRes.json();
          if (!cancelled) {
            setProject({
              id: newProject.id,
              data: newProject.data || {},
              stageIdx: newProject.stageIdx ?? 0,
              version: newProject.version ?? 0,
            });
          }
        }
      } catch {
        if (!cancelled) setError("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId, setProject]);

  return { loading, error };
}

const TOOLS = [
  { key: "snapshots", icon: "\u{1F4F8}", label: "Snapshots" },
  { key: "share", icon: "\u{1F517}", label: "Share" },
  { key: "research", icon: "\u{1F50D}", label: "Research" },
  { key: "export", icon: "\u{1F4E5}", label: "Export" },
  { key: "settings", icon: "\u2699\uFE0F", label: "Settings" },
] as const;

export default function WorkspacePage() {
  const { projectId, data, stageIdx, tab, setTab, setStageIdx, update, version, setVersion } =
    useProjectStore();
  const { loading, error } = useLoadProject();
  const [showCoach, setShowCoach] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser();

  // FIX P0: Real autosave with actual status reporting
  const saveStatus = useAutosave(data, projectId, !!projectId, version, setVersion);


  // Warn user before leaving with unsaved changes
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (saveStatus === "saving" || saveStatus === "error") {
        e.preventDefault();
      }
    },
    [saveStatus]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  // FIX P2: Skeleton loading instead of text
  if (loading) return <WorkspaceSkeleton />;

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-danger">{error}</div>
      </div>
    );
  }

  const StageForm = STAGE_COMPONENTS[stageIdx];
  const currentStage = STAGE_META[stageIdx];

  return (
    <div className="flex h-full">
      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-40 md:z-auto w-[220px] border-r border-border bg-surface-1 p-3 overflow-y-auto flex-shrink-0 h-full transition-transform`}
        role="navigation"
        aria-label="Stage navigation"
      >
        <StageNav
          currentStage={stageIdx}
          onSelectStage={(idx) => {
            setStageIdx(idx);
            setTab("build");
            setShowSidebar(false);
          }}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[60px] bg-surface-1 border-b border-border flex items-center px-3 sm:px-4 justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden text-content text-lg p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open stage navigation"
              aria-expanded={showSidebar}
            >
              \u2630
            </button>
            <div>
              <div className="text-sm font-bold flex items-center gap-2">
                {data.startup_name || "Validately"}
                {/* FIX P2: Current stage indicator in mobile header */}
                <span className="text-[10px] text-content-subtle font-normal md:hidden">
                  \u2014 {currentStage?.phase}
                </span>
              </div>
              <SaveStatus status={saveStatus} />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Build / Assess tabs */}
            {(["build", "assess"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                role="tab"
                aria-selected={tab === t}
                className={`px-3 py-2 rounded-md text-[11px] font-semibold border-none cursor-pointer min-h-[36px] transition-colors ${
                  tab === t
                    ? "bg-brand text-white"
                    : "bg-surface-3 text-content hover:bg-surface-elevated"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}

            {/* IRS button */}
            <button
              onClick={() => router.push("/scoreboard")}
              className="px-3 py-2 rounded-md text-[11px] font-semibold bg-surface-3 text-content hover:bg-surface-elevated min-h-[36px] transition-colors"
              title="IRS Scoreboard"
            >
              IRS
            </button>

            <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

            {/* Desktop tools */}
            {TOOLS.map((tool) => (
              <button
                key={tool.key}
                onClick={() => setActiveModal(tool.key)}
                className="hidden sm:flex px-2 py-1.5 rounded-md text-sm bg-surface-3 text-content hover:bg-surface-elevated min-w-[36px] min-h-[36px] items-center justify-center transition-colors"
                aria-label={tool.label}
                title={tool.label}
              >
                {tool.icon}
              </button>
            ))}

            {/* Mobile tools dropdown */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                className="px-2 py-1.5 rounded-md text-sm bg-surface-3 text-content min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="More tools"
                aria-expanded={showToolsDropdown}
              >
                \u22EE
              </button>
              {showToolsDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowToolsDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-surface-1 border border-border rounded-lg shadow-lg z-50 py-1 min-w-[160px]">
                    {TOOLS.map((tool) => (
                      <button
                        key={tool.key}
                        onClick={() => {
                          setActiveModal(tool.key);
                          setShowToolsDropdown(false);
                        }}
                        className="w-full px-3 py-2.5 text-left text-xs font-semibold text-content hover:bg-surface-2 flex items-center gap-2"
                      >
                        <span>{tool.icon}</span>
                        {tool.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content area — FIX P2: transition on stage change */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5">
          <ErrorBoundary>
            {tab === "build" && StageForm && (
              <div className="animate-in fade-in duration-200">
                {/* FIX P1: Floating gate status at top of form */}
                <FloatingGateStatus stageIdx={stageIdx} data={data} />
                <StageForm data={data} update={update} />
                <GateRequirements stageIdx={stageIdx} data={data} />
              </div>
            )}
            {tab === "assess" && (
              <AssessPanel stageIdx={stageIdx} data={data} />
            )}
          </ErrorBoundary>
        </div>
      </main>

      {/* AI Coach */}
      <AICoach show={showCoach} onToggle={() => setShowCoach(!showCoach)} />

      {/* Modals */}
      {activeModal === "snapshots" && (
        <SnapshotsModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "share" && (
        <ShareModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "settings" && (
        <SettingsModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "pricing" && (
        <PricingModal
          currentPlan={user?.plan || "free"}
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal === "export" && (
        <ExportModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === "research" && (
        <ResearchModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
