"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@headlessui/react";
import { Schedule } from "../lib/types";

interface ScheduleFormValues {
  name: string;
  cron: string;
  timezone: string;
  enabled: boolean;
}

async function fetchSchedules(): Promise<Schedule[]> {
  const response = await fetch("/api/schedules");
  if (!response.ok) throw new Error("Failed to load schedules");
  return response.json();
}

async function createScheduleRequest(payload: ScheduleFormValues) {
  const response = await fetch("/api/schedules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Failed to create schedule");
  return response.json();
}

async function updateScheduleRequest(id: number, payload: Partial<ScheduleFormValues>) {
  const response = await fetch(`/api/schedules/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Failed to update schedule");
  return response.json();
}

async function deleteScheduleRequest(id: number) {
  const response = await fetch(`/api/schedules/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete schedule");
}

export default function ScheduleManager() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch, setValue } = useForm<ScheduleFormValues>({
    defaultValues: {
      name: "",
      cron: "0 8 * * *",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      enabled: true
    }
  });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: fetchSchedules
  });

  const selectedSchedule = watch("name");
  const enabled = watch("enabled");

  const createMutation = useMutation({
    mutationFn: createScheduleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      reset({
        name: "",
        cron: "0 8 * * *",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        enabled: true
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ScheduleFormValues> }) => updateScheduleRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScheduleRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      reset({
        name: "",
        cron: "0 8 * * *",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        enabled: true
      });
    }
  });

  const onSubmit = (values: ScheduleFormValues) => {
    createMutation.mutate(values);
  };

  const handleToggle = (schedule: Schedule) => {
    updateMutation.mutate({
      id: schedule.id,
      payload: { enabled: !schedule.enabled }
    });
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg shadow-black/40">
      <header>
        <h2 className="text-xl font-semibold text-slate-50">Scheduling</h2>
        <p className="text-sm text-slate-400">Control when summaries are generated and delivered.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Name</span>
          <input
            {...register("name", { required: true })}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            placeholder="Daily Insights"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Cron Expression</span>
          <input
            {...register("cron", { required: true })}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            placeholder="0 8 * * *"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Timezone</span>
          <input
            {...register("timezone", { required: true })}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          />
        </label>

        <div className="md:col-span-3 flex gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400 transition disabled:opacity-50"
            disabled={createMutation.isPending}
          >
            Create Schedule
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 max-h-60 overflow-y-auto">
        {isLoading && <p className="px-4 py-6 text-sm text-slate-400">Loading schedules…</p>}
        {!isLoading && schedules?.length === 0 && <p className="px-4 py-6 text-sm text-slate-400">No schedules configured yet.</p>}
        <ul className="divide-y divide-slate-800">
          {schedules?.map((schedule) => (
            <li key={schedule.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">{schedule.name}</h3>
                <p className="text-xs text-slate-500">{schedule.cron} · {schedule.timezone}</p>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={schedule.enabled}
                  onChange={() => handleToggle(schedule)}
                  className={`${schedule.enabled ? "bg-brand-500" : "bg-slate-800"} relative inline-flex h-6 w-11 items-center rounded-full transition`}
                >
                  <span className="sr-only">Toggle schedule</span>
                  <span
                    className={`${schedule.enabled ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
                <button
                  onClick={() => deleteMutation.mutate(schedule.id)}
                  className="text-xs text-red-300 border border-red-500/50 rounded-md px-2 py-1 hover:bg-red-500/10 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
