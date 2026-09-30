const title = document.querySelector("#job-title");
const status = document.querySelector("#job-status");
const progress = document.querySelector("#progress");
const progressLabel = document.querySelector("#progress-label");
const startButton = document.querySelector("#start");
const itemList = document.querySelector("#items");

function render(job) {
  const completed = job?.completedCount || 0;
  const total = job?.totalCount || 25;
  title.textContent = job?.title || "No job started";
  status.textContent = job?.status === "running" ? "Processing" : job?.status === "complete" ? "Complete" : "Ready";
  status.dataset.running = String(job?.status === "running");
  progress.max = total;
  progress.value = completed;
  progressLabel.textContent = `${completed} of ${total} items complete`;
  startButton.disabled = job?.status === "running";
  itemList.replaceChildren();
  for (const item of job?.items || []) {
    const row = document.createElement("li");
    row.dataset.status = item.status;
    const label = document.createElement("span");
    const itemStatus = document.createElement("span");
    label.textContent = item.label;
    itemStatus.textContent = item.status === "complete" ? "Done" : "Waiting";
    row.append(label, itemStatus);
    itemList.append(row);
  }
}

function send(type) {
  return new Promise((resolve) => chrome.runtime.sendMessage({ type }, resolve));
}

startButton.addEventListener("click", async () => render(await send("START_DEMO_JOB")));
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes["demo-job-state"]) render(changes["demo-job-state"].newValue);
});
render(await send("GET_JOB_STATE"));