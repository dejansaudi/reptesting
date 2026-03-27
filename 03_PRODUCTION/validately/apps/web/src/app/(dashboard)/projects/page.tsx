"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/store/useProjectStore";
import { apiFetch } from "@/lib/api";
import { STAGE_META, calcIRS, TIER_LIMITS } from "@validately/shared";
import { useUser } from "@/hooks/useUser";

interface Project {
  id: string;
  name: string;
  data: Record<string, string>;
  stageIdx: number;
  version: number;
  irsScore?: number;
  updatedAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const setProject = useProjectStore((s) => s.setProject);
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [loadError, setLoadError] = useState(false);

  const loadProjects = useCallback(async () => {
    try {
      const res = await apiFetch("/projects");
      if (!res.ok) { setLoadError(true); return; }
      const { data } = await res.json();
      setProjects(data || []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  async function createProject() {
    setCreateError(null);

    // Client-side plan limit check
    const plan = user?.plan || "free";
    const limits = TIER_LIMITS[plan as keyof typeof TIER_LIMITS] ?? TIER_LIMITS.free;
    if (projects.length >= limits.maxProjects) {
      setCreateError(
        `Your ${plan} plan allows ${limits.maxProjects} project${limits.maxProjects === 1 ? "" : "s"}. Upgrade to create more.`
      );
      return;
    }

    setCreating(true);
    try {
      const res = await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({ name: "Untitled Project" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setCreateError(body?.message || "Failed to create project. Please try again.");
        return;
      }
      const project = await res.json();
      setProject({
        id: project.id,
        data: project.data || {},
        stageIdx: 0,
        version: project.version ?? 0,
      });
      router.push("/workspace");
    } catch {
      setCreateError("Network error. Please check your connection and try again.");
    } finally {
      setCreating(false);
    }
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeleteError(null);
    try {
      const res = await apiFetch(`/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setDeleteError("Failed to delete project. Please try again.");
        return;
      }
      setProjects((p) => p.filter((proj) => proj.id !== id));
    } catch {
      setDeleteError("Failed to delete project. Please check your connection.");
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-content-subtle animate-pulse">
          Loading projects...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Projects</h1>
        <button
          onClick={createProject}
          disabled={creating}
          className="px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-bold hover:bg-brand-hover disabled:opacity-50 transition-colors"
        >
          {creating ? "Creating..." : "+ New Project"}
        </button>
      </div>

      {loadError && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-4 rounded-lg mb-4">
          Failed to load projects. Please check your connection and try again.
          <button onClick={() => { setLoadError(false); setLoading(true); loadProjects(); }}
            className="ml-2 underline font-bold">Retry</button>
        </div>
      )}

      {createError && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-4 rounded-lg mb-4">
          {createError}
          <button onClick={() => setCreateError(null)}
            className="ml-2 underline font-bold">Dismiss</button>
        </div>
      )}

      {deleteError && (
        <div className="bg-danger/10 border border-danger/30 text-danger text-sm p-4 rounded-lg mb-4">
          {deleteError}
          <button onClick={() => setDeleteError(null)}
            className="ml-2 underline font-bold">Dismiss</button>
        </div>
      )}

      {projects.length === 0 && !loadError ? (
        <div className="text-center py-16">
          <div className="text-3xl mb-3">{"\u{1F680}"}</div>
          <h2 className="text-lg font-bold mb-2">No projects yet</h2>
          <p className="text-sm text-content-subtle mb-6">
            Create your first project to start validating your startup idea.
          </p>
          <button
            onClick={createProject}
            disabled={creating}
            className="px-6 py-3 rounded-lg bg-brand text-white text-sm font-bold hover:bg-brand-hover transition-colors"
          >
            Create First Project
          </button>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid gap-4">
          {projects.map((project) => {
            const irs = calcIRS(project.data || {});
            const irsScore = project.irsScore ?? irs.score;
            const stage = STAGE_META[project.stageIdx ?? 0] ?? STAGE_META[0];
            const updated = new Date(project.updatedAt).toLocaleDateString();

            return (
              <div
                key={project.id}
                className="bg-surface-1 border border-border rounded-xl p-5 hover:border-brand/50 transition-colors cursor-pointer group"
                onClick={() => {
                  setProject({
                    id: project.id,
                    data: project.data || {},
                    stageIdx: project.stageIdx ?? 0,
                    version: project.version ?? 0,
                  });
                  router.push("/workspace");
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate">
                      {project.name || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-content-subtle">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{
                          backgroundColor: stage?.color + "20",
                          color: stage?.color,
                        }}
                      >
                        {stage?.icon} {stage?.phase}
                      </span>
                      <span>IRS: {irsScore}/{irs.maxScore}</span>
                      <span>Updated {updated}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 text-xs text-danger hover:bg-danger/10 rounded transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
