import test from "node:test";
import assert from "node:assert/strict";
import { advanceJob, createDemoJob, DEMO_ITEM_COUNT } from "../lib/job-state.mjs";

test("creates 25 serializable pending demo items", () => {
  const job = createDemoJob("2026-01-01T00:00:00.000Z");
  assert.equal(job.totalCount, DEMO_ITEM_COUNT);
  assert.equal(job.items.length, 25);
  assert.equal(JSON.parse(JSON.stringify(job)).status, "running");
});

test("advances item progress and completes the job", () => {
  let job = createDemoJob();
  for (let step = 0; step < DEMO_ITEM_COUNT; step += 1) job = advanceJob(job);
  assert.equal(job.completedCount, 25);
  assert.equal(job.status, "complete");
  assert.ok(job.items.every((item) => item.status === "complete"));
  assert.equal(advanceJob(job), job);
});