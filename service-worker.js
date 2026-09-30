import { advanceJob, createDemoJob } from "./lib/job-state.mjs";

const JOB_KEY = "demo-job-state";
const RECOVERY_ALARM = "demo-job-recovery";
let runner = null;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function readJob() {
  return (await chrome.storage.local.get(JOB_KEY))[JOB_KEY] || null;
}

async function saveJob(job) {
  await chrome.storage.local.set({ [JOB_KEY]: job });
}

async function runJob() {
  if (runner) return runner;
  runner = (async () => {
    try {
      while (true) {
        const current = await readJob();
        if (!current || current.status !== "running") break;
        await delay(350);
        const next = advanceJob(current);
        await saveJob(next);
      }
    } finally {
      runner = null;
      const current = await readJob();
      if (!current || current.status !== "running") await chrome.alarms.clear(RECOVERY_ALARM);
    }
  })();
  return runner;
}

async function recoverJob() {
  const current = await readJob();
  if (current?.status === "running") void runJob();
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});
  void recoverJob();
});
chrome.runtime.onStartup.addListener(() => void recoverJob());
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === RECOVERY_ALARM) void recoverJob();
});

chrome.action.onClicked.addListener((tab) => {
  if (!Number.isInteger(tab?.id)) return;
  void chrome.sidePanel.open({ tabId: tab.id });
  void chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content/launcher.js"] });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_JOB_STATE") {
    readJob().then(sendResponse);
    return true;
  }
  if (message?.type === "START_DEMO_JOB") {
    void (async () => {
      const current = await readJob();
      if (current?.status === "running") {
        sendResponse(current);
        return;
      }
      const job = createDemoJob();
      await saveJob(job);
      await chrome.alarms.create(RECOVERY_ALARM, { delayInMinutes: 0.5, periodInMinutes: 0.5 });
      sendResponse(job);
      void runJob();
    })();
    return true;
  }
  if (message?.type === "OPEN_SIDE_PANEL" && Number.isInteger(sender.tab?.id)) {
    chrome.sidePanel.open({ tabId: sender.tab.id }).then(
      () => sendResponse({ ok: true }),
      () => sendResponse({ ok: false }),
    );
    return true;
  }
  return false;
});

void recoverJob();