"use client";

import { useQuery } from "@tanstack/react-query";
import { AggregationJob } from "../lib/types";

async function fetchStatus(): Promise<AggregationJob[]> {
  const response = await fetch("/api/status");
  if (!response.ok) throw new Error("Failed to fetch status feed");
  return response.json();
}

const STATUS_COLOR: Record<AggregationJob["status"], string> = {
  pending: "text-slate-400",
  running: "text-sky-300",
  completed: "text-emerald-300",
  failed: "text-rose-300"
};

export default function StatusFeed() {
  const { data: jobs, refetch } = useQuery({
    queryKey: ["status"],
    queryFn: fetchStatus,
    refetchInterval: 15000
  });

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg shadow-black/40">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-50">Activity Monitor</h2>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 text-xs rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
        >
          Refresh
        </button>
      </header>
      <ul className="space-y-3">
        {jobs?.map((job) => (
          <li key={job.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-200">Job #{job.id}</span>
              <span className={`${STATUS_COLOR[job.status]} uppercase text-xs font-semibold`}>{job.status}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {job.startedAt ? `Started: ${new Date(job.startedAt).toLocaleString()}` : "Not started"}
              {job.finishedAt ? ` · Finished: ${new Date(job.finishedAt).toLocaleString()}` : ""}
            </p>
            {job.error && <p className="text-xs text-rose-300 mt-1">Error: {job.error}</p>}
          </li>
        ))}
        {(!jobs || jobs.length === 0) && <p className="text-sm text-slate-400">No activity logged yet.</p>}
      </ul>
    </section>
  );
}
