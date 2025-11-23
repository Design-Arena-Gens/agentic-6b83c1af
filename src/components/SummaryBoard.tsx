"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Summary } from "../lib/types";

const TOPIC_FILTERS = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI" },
  { id: "uiux", label: "UI/UX" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "infrastructure", label: "Infrastructure" }
];

async function fetchSummaries(limit = 24): Promise<Summary[]> {
  const response = await fetch(`/api/summaries?limit=${limit}`);
  if (!response.ok) throw new Error("Failed to load summaries");
  return response.json();
}

function matchFilter(summary: Summary, filter: string) {
  if (filter === "all") return true;
  const lowerTopic = summary.topic.toLowerCase();
  const lowerSummary = summary.summary.toLowerCase();
  const tags = summary.tags.map((tag) => tag.toLowerCase());

  if (filter === "ai") return lowerTopic.includes("ai") || tags.some((tag) => tag.includes("ai")) || lowerSummary.includes("machine learning");
  if (filter === "uiux") return lowerTopic.includes("ux") || lowerTopic.includes("ui") || tags.some((tag) => tag.includes("design"));
  if (filter === "cybersecurity") return lowerTopic.includes("security") || tags.some((tag) => tag.includes("security"));
  if (filter === "infrastructure") return lowerTopic.includes("infrastructure") || lowerSummary.includes("cloud") || tags.some((tag) => tag.includes("devops"));

  return true;
}

export default function SummaryBoard() {
  const [filter, setFilter] = useState("all");
  const { data: summaries, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["summaries"],
    queryFn: () => fetchSummaries()
  });

  const filtered = (summaries ?? []).filter((summary) => matchFilter(summary, filter));

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg shadow-black/40">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Insights Feed</h2>
          <p className="text-sm text-slate-400">Auto-generated summaries organized by topic and sentiment.</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-lg bg-slate-800 text-sm text-slate-200 hover:bg-slate-700 transition disabled:opacity-50"
          disabled={isRefetching}
        >
          {isRefetching ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {TOPIC_FILTERS.map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id)}
            className={`px-3 py-1.5 text-xs rounded-full border ${filter === item.id ? "border-brand-400 bg-brand-500/10 text-brand-100" : "border-slate-700 text-slate-300 hover:bg-slate-800/60"}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-slate-400">Loading recent summaries…</p>}
      {!isLoading && filtered.length === 0 && <p className="text-sm text-slate-400">No summaries available for this filter.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((summary) => (
          <article key={summary.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">{summary.topic}</h3>
              <span
                className={`text-xs font-semibold uppercase ${
                  summary.sentiment === "positive"
                    ? "text-emerald-300"
                    : summary.sentiment === "negative"
                      ? "text-rose-300"
                      : "text-slate-400"
                }`}
              >
                {summary.sentiment}
              </span>
            </div>
            <p className="text-sm leading-6 text-slate-300">{summary.summary}</p>
            <div className="flex flex-wrap gap-2">
              {summary.keyEntities.map((entity) => (
                <span key={entity} className="text-[10px] uppercase tracking-wide bg-slate-800/80 px-2 py-0.5 rounded-md text-slate-200">
                  {entity}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <time>{new Date(summary.createdAt).toLocaleString()}</time>
              <a href={summary.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-200">
                Source
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
