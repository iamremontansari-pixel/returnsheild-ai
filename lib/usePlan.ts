"use client";

import { useSyncExternalStore } from "react";

export type Plan = "free" | "pro";
const KEY = "rs_plan";

function subscribe(callback: () => void) {
  window.addEventListener("rs-plan-change", callback);
  return () => window.removeEventListener("rs-plan-change", callback);
}

function getSnapshot(): Plan {
  try {
    return localStorage.getItem(KEY) === "pro" ? "pro" : "free";
  } catch {
    return "free";
  }
}

export function setPlan(plan: Plan) {
  try {
    localStorage.setItem(KEY, plan);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("rs-plan-change"));
}

export function usePlan() {
  const plan = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => "free" as Plan
  );
  return { plan, isPro: plan === "pro" };
}
