export const DEMO_ITEM_COUNT = 25;

export function createDemoJob(now = new Date().toISOString()) {
  return {
    id: `demo-${Date.now()}`,
    title: "Process 25 demo items",
    status: "running",
    createdAt: now,
    completedCount: 0,
    totalCount: DEMO_ITEM_COUNT,
    items: Array.from({ length: DEMO_ITEM_COUNT }, (_, index) => ({
      id: `item-${String(index + 1).padStart(2, "0")}`,
      label: `Demo item ${index + 1}`,
      status: "pending",
    })),
  };
}

export function advanceJob(job, now = new Date().toISOString()) {
  if (!job || job.status !== "running") return job;
  const nextIndex = job.items.findIndex((item) => item.status === "pending");
  if (nextIndex < 0) return { ...job, status: "complete", completedAt: now };
  const items = job.items.map((item, index) => index === nextIndex
    ? { ...item, status: "complete" }
    : item);
  const completedCount = job.completedCount + 1;
  return {
    ...job,
    items,
    completedCount,
    status: completedCount === job.totalCount ? "complete" : "running",
    ...(completedCount === job.totalCount ? { completedAt: now } : {}),
  };
}