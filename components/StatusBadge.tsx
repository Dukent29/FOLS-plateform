import { LEAD_STATUS_LABELS, QUOTE_STATUS_LABELS, MISSION_STATUS_LABELS } from "@/lib/constants";

export function StatusBadge({ status, kind = "lead" }: { status: string; kind?: "lead" | "quote" | "mission" }) {
  const map = kind === "lead" ? LEAD_STATUS_LABELS : kind === "quote" ? QUOTE_STATUS_LABELS : MISSION_STATUS_LABELS;
  return <span className={`status status-${status.toLowerCase()}`}>{map[status] ?? status}</span>;
}
