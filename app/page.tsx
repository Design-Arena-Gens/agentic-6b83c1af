"use client";

import { useEffect } from "react";
import SourceManager from "@/src/components/SourceManager";
import ScheduleManager from "@/src/components/ScheduleManager";
import DeliveryManager from "@/src/components/DeliveryManager";
import ControlPanel from "@/src/components/ControlPanel";
import SummaryBoard from "@/src/components/SummaryBoard";
import StatusFeed from "@/src/components/StatusFeed";

export default function Home() {
  useEffect(() => {
    fetch("/api/schedules", { cache: "no-store" });
  }, []);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest rounded-full bg-brand-500/10 text-brand-200 border border-brand-500/30">
            Emerging Tech Intelligence
          </span>
          <h1 className="text-4xl font-semibold text-slate-50">Agentic Intelligence Aggregator</h1>
          <p className="text-base text-slate-300 max-w-2xl">
            Aggregate and distill critical updates across AI research, computer science, UX, and broader technology ecosystems. Configure custom
            sources, automate collection, and deliver tailored digests via the channels your team already trusts.
          </p>
        </div>
        <div className="rounded-2xl border border-brand-500/30 bg-brand-500/10 p-4 max-w-sm">
          <p className="text-sm text-brand-100">
            Scheduler, queue, and NLP pipelines are ready. Add a few sources to begin generating insights or trigger an on-demand pull from the
            control panel.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-6 xl:col-span-2">
          <ControlPanel />
          <SummaryBoard />
        </div>
        <div className="space-y-6">
          <SourceManager />
          <ScheduleManager />
          <DeliveryManager />
        </div>
      </div>

      <StatusFeed />
    </main>
  );
}
