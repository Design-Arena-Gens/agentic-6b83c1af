"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DeliveryPreference, Schedule } from "../lib/types";

interface DeliveryFormValues {
  channel: "email" | "telegram";
  address: string;
  scheduleId: number | "";
}

async function fetchDeliveryPreferences(): Promise<DeliveryPreference[]> {
  const response = await fetch("/api/delivery");
  if (!response.ok) throw new Error("Failed to load delivery preferences");
  return response.json();
}

async function fetchSchedules(): Promise<Schedule[]> {
  const response = await fetch("/api/schedules");
  if (!response.ok) throw new Error("Failed to load schedules");
  return response.json();
}

async function createDeliveryPreferenceRequest(payload: DeliveryFormValues) {
  const response = await fetch("/api/delivery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      scheduleId: payload.scheduleId === "" ? null : Number(payload.scheduleId)
    })
  });
  if (!response.ok) throw new Error("Failed to create delivery preference");
  return response.json();
}

async function deleteDeliveryPreferenceRequest(id: number) {
  const response = await fetch(`/api/delivery/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete delivery preference");
}

export default function DeliveryManager() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<DeliveryFormValues>({
    defaultValues: {
      channel: "email",
      address: "",
      scheduleId: ""
    }
  });

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["delivery"],
    queryFn: fetchDeliveryPreferences
  });

  const { data: schedules } = useQuery({
    queryKey: ["schedules"],
    queryFn: fetchSchedules
  });

  const createMutation = useMutation({
    mutationFn: createDeliveryPreferenceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery"] });
      reset({
        channel: "email",
        address: "",
        scheduleId: ""
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDeliveryPreferenceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery"] });
    }
  });

  const onSubmit = (values: DeliveryFormValues) => {
    createMutation.mutate(values);
  };

  return (
    <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-lg shadow-black/40">
      <header>
        <h2 className="text-xl font-semibold text-slate-50">Delivery Channels</h2>
        <p className="text-sm text-slate-400">Choose where summaries are delivered and link schedules.</p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Channel</span>
          <select
            {...register("channel")}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="email">Email</option>
            <option value="telegram">Telegram</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Destination</span>
          <input
            {...register("address", { required: true })}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            placeholder="hello@example.com or @username"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-slate-300">Schedule</span>
          <select
            {...register("scheduleId")}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">Manual / Immediate</option>
            {schedules?.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {schedule.name}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400 transition disabled:opacity-50"
            disabled={createMutation.isPending}
          >
            Add Delivery Preference
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-800 bg-slate-950/40 max-h-52 overflow-y-auto">
        {isLoading && <p className="px-4 py-6 text-sm text-slate-400">Loading delivery preferences…</p>}
        {!isLoading && preferences?.length === 0 && <p className="px-4 py-6 text-sm text-slate-400">No delivery preferences configured.</p>}
        <ul className="divide-y divide-slate-800">
          {preferences?.map((preference) => (
            <li key={preference.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-200 uppercase">{preference.channel}</p>
                <p className="text-xs text-slate-500">{preference.address}</p>
                <p className="text-xs text-slate-500">
                  {preference.scheduleId ? `Schedule #${preference.scheduleId}` : "Manual trigger"}
                </p>
              </div>
              <button
                onClick={() => deleteMutation.mutate(preference.id)}
                className="text-xs text-red-300 border border-red-500/50 rounded-md px-2 py-1 hover:bg-red-500/10 transition"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
