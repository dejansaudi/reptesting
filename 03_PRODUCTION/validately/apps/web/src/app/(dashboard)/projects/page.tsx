"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/store/useProjectStore";
import { apiFetch } from "@/lib/api";
import { STAGE_META, calcIRS } from "@validately/shared";

export default function ProjectsPage() {
  const router = useRouter();
  const setProject = useProjectStore((s) => s.setProject);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadProjects() {
    try {
      const res = await apiFetch("/projects");
      if (!res.ok) return;
      const { data } = await res.json();
      setProjects(data || []);
    } finally {
      setLoading(false);
    }
  }

  async function createProject() {
    setCreating(true);
    try {
      const res = await apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify({ name: "Untitled Project" }),
      });
      if (!res.ok) return;
      const project = await res.json();
      setProject({
        id: project.id,
        data: project.data || {},
        stageIdx: 0,
        version: project.version ?? 0,
      });
      router.push("/workspace");
    } finally {
      setCreating(false);
    }
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      const res = await apiFetch(`/projects/${id}`, { method: "DELETE" });
      if (!res.ok) return;
      setProjects((p) => p.filter((proj) => proj.id !== id));
    } catch {}
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

      {projects.length === 0 ? (
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
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => {
            const irs = calcIRS(project.data || {});
            const irsScore = project.irsScore ?? irs.score;
            const stage = STAGE_META[project.stageIdx ?? 0];
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
                    version: 0,
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
      )}
    </div>
  );
}
