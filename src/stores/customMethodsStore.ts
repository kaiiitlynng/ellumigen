import { useSyncExternalStore } from "react";

export interface CustomMethod {
  id: string;
  label: string;
  description: string;
  createdAt: string;
}

const STORAGE_KEY = "ellumigen.customMethods.v1";

let methods: CustomMethod[] = loadFromStorage();
const listeners = new Set<() => void>();

function loadFromStorage(): CustomMethod[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
  } catch {
    // ignore quota / unavailable
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return methods;
}

export function useCustomMethods(): CustomMethod[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function addCustomMethod(label: string, description: string): CustomMethod | null {
  const slug = slugify(label);
  if (!slug) return null;
  // De-dupe by slug
  if (methods.some((m) => m.id === slug)) return null;
  const next: CustomMethod = {
    id: slug,
    label: slug,
    description: description.trim() || "Custom method",
    createdAt: new Date().toISOString(),
  };
  methods = [next, ...methods];
  persist();
  return next;
}

export function deleteCustomMethod(id: string) {
  methods = methods.filter((m) => m.id !== id);
  persist();
}

export function getCustomMethodsSnapshot(): CustomMethod[] {
  return methods;
}
