const title = document.querySelector("#job-title");
const status = document.querySelector("#job-status");
const progress = document.querySelector("#progress");
const progressLabel = document.querySelector("#progress-label");
const startButton = document.querySelector("#start");
const resetButton = document.querySelector("#reset");
const itemList = document.querySelector("#items");
const errorBox = document.querySelector("#error");

function showError(error) {
  errorBox.hidden = false;
  errorBox.textContent = error instanceof Error ? error.message : String(error);
}

function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = "";
}

function render(job) {
  if (job?.error) {
    showError(job.error);
    return;
  }
  clearError();
  const completed = job?.completedCount || 0;
  const total = job?.totalCount || 25;
  title.textContent = job?.title || "No job started";
  status.textContent = job?.status === "running" ? "Processing" : job?.status === "complete" ? "Complete" : "Ready";
  status.dataset.running = String(job?.status === "running");
  progress.max = total;
  progress.value = completed;
  progressLabel.textContent = `${completed} of ${total} items complete`;
  startButton.disabled = job?.status === "running";
  resetButton.disabled = job?.status === "running";
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
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type }, (response) => {
      const runtimeError = chrome.runtime.lastError;
      if (runtimeError) reject(new Error(runtimeError.message));
      else resolve(response);
    });
  });
}

startButton.addEventListener("click", async () => {
  try { render(await send("START_DEMO_JOB")); } catch (error) { showError(error); }
});

resetButton.addEventListener("click", async () => {
  try {
    await send("RESET_DEMO_JOB");
    render(null);
  } catch (error) { showError(error); }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes["demo-job-state"]) render(changes["demo-job-state"].newValue);
});

async function init() {
  try {
    render(await send("GET_JOB_STATE"));
  } catch (error) {
    showError(error);
  }
}

void init();
