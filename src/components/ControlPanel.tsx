"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Source } from "../lib/types";

async function fetchSources(): Promise<Source[]> {
  const response = await fetch("/api/sources");
  if (!response.ok) throw new Error("Failed to fetch sources");
  return response.json();
}

async function triggerAggregation(payload: { sourceIds?: number[]; force?: boolean }) {
  const response = await fetch("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Failed to enqueue aggregation");
}

export default function ControlPanel() {
  const { data: sources } = useQuery({
    queryKey: ["sources"],
    queryFn: fetchSources
  });

  const [selectedSources, setSelectedSources] = useState<number[]>([]);
  const [force, setForce] = useState(false);

  const mutation = useMutation({
    mutationFn: triggerAggregation
  });

  const toggleSource = (id: number) => {
    setSelectedSources((prev) => (prev.includes(id) ? prev.filter((sourceId) => sourceId !== id) : [...prev, id]));
  };

  const handleRun = () => {
    mutation.mutate({
      sourceIds: selectedSources.length > 0 ? selectedSources : undefined,
      force
    });
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg shadow-black/40">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Controls</h2>
          <p className="text-sm text-slate-400">Manually trigger aggregation or scope to specific sources.</p>
        </div>
        <button
          onClick={handleRun}
          className="px-4 py-2 rounded-lg bg-brand-500 text-sm font-semibold text-white hover:bg-brand-400 transition disabled:opacity-50"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Enqueuing…" : "Run Aggregation"}
        </button>
      </header>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Select Sources</h3>
        <div className="flex flex-wrap gap-2">
          {sources?.map((source) => {
            const active = selectedSources.includes(source.id);
            return (
              <button
                key={source.id}
                onClick={() => toggleSource(source.id)}
                className={`px-3 py-1.5 text-xs rounded-full border ${active ? "border-brand-500 bg-brand-500/20 text-brand-100" : "border-slate-700 text-slate-300 hover:bg-slate-800/60"}`}
              >
                {source.name}
              </button>
            );
          })}
          {!sources?.length && <p className="text-xs text-slate-500">Configure sources to target specific feeds.</p>}
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={force}
          onChange={(event) => setForce(event.target.checked)}
          className="h-4 w-4 rounded border border-slate-700 bg-slate-950"
        />
        <span className="text-sm text-slate-300">Force summarization even if content appears low relevance</span>
      </label>

      {mutation.isError && <p className="text-sm text-rose-300">Failed to trigger aggregation. Check queue configuration.</p>}
      {mutation.isSuccess && <p className="text-sm text-emerald-300">Aggregation job enqueued successfully.</p>}
    </section>
  );
}
