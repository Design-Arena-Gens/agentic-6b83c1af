"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@headlessui/react";
import { Source } from "../lib/types";

interface SourceFormValues {
  name: string;
  url: string;
  tags: string;
  type: "website" | "rss" | "application";
  enabled: boolean;
}

async function fetchSources(): Promise<Source[]> {
  const response = await fetch("/api/sources");
  if (!response.ok) throw new Error("Failed to load sources");
  return response.json();
}

async function createSourceRequest(payload: SourceFormValues) {
  const response = await fetch("/api/sources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      tags: payload.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
    })
  });
  if (!response.ok) throw new Error("Failed to create source");
  return response.json();
}

async function updateSourceRequest(id: number, payload: Partial<SourceFormValues>) {
  const response = await fetch(`/api/sources/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      tags: payload.tags
        ? payload.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : undefined
    })
  });
  if (!response.ok) throw new Error("Failed to update source");
  return response.json();
}

async function deleteSourceRequest(id: number) {
  const response = await fetch(`/api/sources/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete source");
}

export default function SourceManager() {
  const queryClient = useQueryClient();
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm<SourceFormValues>({
    defaultValues: {
      name: "",
      url: "",
      tags: "",
      type: "website",
      enabled: true
    }
  });

  const { data: sources, isLoading } = useQuery({
    queryKey: ["sources"],
    queryFn: fetchSources
  });

  const createMutation = useMutation({
    mutationFn: createSourceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<SourceFormValues> }) => updateSourceRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      setSelectedSource(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSourceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      setSelectedSource(null);
      reset();
    }
  });

  const onSubmit = (values: SourceFormValues) => {
    if (selectedSource) {
      updateMutation.mutate({
        id: selectedSource.id,
        payload: values
      });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleSelect = (source: Source) => {
    setSelectedSource(source);
    reset({
      name: source.name,
      url: source.url,
      tags: source.tags.join(", "),
      type: source.type,
      enabled: source.enabled
    });
  };

  const handleReset = () => {
    setSelectedSource(null);
    reset({
      name: "",
      url: "",
      tags: "",
      type: "website",
      enabled: true
    });
  };

  const enabled = watch("enabled");

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg shadow-black/40">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Sources</h2>
          <p className="text-sm text-slate-400">Configure sites and apps to monitor for AI and technology insights.</p>
        </div>
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-md text-sm border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
        >
          Reset
        </button>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Name</span>
          <input
            {...register("name", { required: true })}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            placeholder="e.g. OpenAI Research Blog"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">URL</span>
          <input
            {...register("url", { required: true })}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            placeholder="https://example.com/feed"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Tags</span>
          <input
            {...register("tags")}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            placeholder="AI, UX, Research"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Type</span>
          <select
            {...register("type")}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="website">Website</option>
            <option value="rss">RSS Feed</option>
            <option value="application">Application</option>
          </select>
        </label>

        <div className="flex items-center gap-3">
          <Switch
            checked={enabled}
            onChange={(value: boolean) => setValue("enabled", value)}
            className={`${enabled ? "bg-brand-500" : "bg-slate-800"} relative inline-flex h-6 w-11 items-center rounded-full transition`}
          >
            <span className="sr-only">Toggle source</span>
            <span
              className={`${enabled ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
          <span className="text-sm text-slate-300">{enabled ? "Active" : "Paused"}</span>
        </div>

        <div className="md:col-span-2 flex gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400 transition disabled:opacity-50"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {selectedSource ? "Update Source" : "Add Source"}
          </button>
          {selectedSource && (
            <button
              type="button"
              onClick={() => deleteMutation.mutate(selectedSource.id)}
              className="inline-flex items-center justify-center rounded-lg border border-red-500/60 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10 transition"
            >
              Remove
            </button>
          )}
        </div>
      </form>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 max-h-72 overflow-y-auto">
        {isLoading && <p className="px-4 py-6 text-sm text-slate-400">Loading sources…</p>}
        {!isLoading && sources?.length === 0 && <p className="px-4 py-6 text-sm text-slate-400">No sources configured yet.</p>}
        <ul className="divide-y divide-slate-800">
          {sources?.map((source) => (
            <li key={source.id}>
              <button
                onClick={() => handleSelect(source)}
                className="w-full text-left px-4 py-3 hover:bg-slate-900/70 transition flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">{source.name}</span>
                  <span className="text-xs uppercase tracking-wide text-slate-500">{source.type}</span>
                </div>
                <span className="text-xs text-slate-500 truncate">{source.url}</span>
                <div className="flex flex-wrap gap-2">
                  {source.tags.map((tag) => (
                    <span key={tag} className="text-[10px] uppercase tracking-wide bg-slate-800/70 px-2 py-0.5 rounded-md text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
