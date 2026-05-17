import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Pod } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return '未知错误';
}

export function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as { message?: unknown; response?: { data?: { message?: unknown } } };
    const responseMessage = e.response?.data?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim()) return responseMessage;
    if (typeof e.message === 'string' && e.message.trim()) return e.message;
  }
  return '请求失败';
}

export function getPhaseMeta(pod: Pod) {
  const phase = pod.phase || pod.status || 'Unknown';
  const normalized = phase.toLowerCase();
  if (normalized === 'running') return { phase, cls: 'bg-emerald-100 text-emerald-700' };
  if (normalized === 'succeeded') return { phase, cls: 'bg-emerald-100 text-emerald-700' };
  if (normalized === 'failed') return { phase, cls: 'bg-red-100 text-red-700' };
  if (normalized === 'pending') return { phase, cls: 'bg-amber-100 text-amber-700' };
  return { phase, cls: 'bg-slate-200 text-slate-700' };
}

export function podDiagnosis(pod: Pod) {
  const reason = (pod.reason || '').trim();
  const message = (pod.message || '').trim();
  if (!reason && !message) return '';
  if (reason && message) return `${reason}: ${message}`;
  return reason || message;
}

export function toMap(list: { key: string; value: string }[]): Record<string, string> {
  return list.reduce((acc, curr) => {
    const k = curr.key.trim();
    if (k) acc[k] = curr.value;
    return acc;
  }, {} as Record<string, string>);
}

export function fromMap(obj?: Record<string, string>): { key: string; value: string }[] {
  if (!obj) return [];
  return Object.entries(obj).map(([key, value]) => ({ key, value }));
}

export function validateJson(text: string | undefined): string | null {
  const trimmed = (text ?? '').trim();
  if (!trimmed) return null;
  try {
    JSON.parse(trimmed);
    return null;
  } catch (e: unknown) {
    return e instanceof Error ? e.message : 'JSON 格式无效';
  }
}
