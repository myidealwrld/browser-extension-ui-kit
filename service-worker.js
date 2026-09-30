import { advanceJob, createDemoJob } from "./lib/job-state.mjs";

const JOB_KEY = "demo-job-state";
const RECOVERY_ALARM = "demo-job-recovery";
const ALARM_PERIOD_MINUTES = 0.5;
let runner = null;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function readJob() {
  return (await chrome.storage.local.get(JOB_KEY))[JOB_KEY] || null;
}

async function saveJob(job) {
  await chrome.storage.local.set({ [JOB_KEY]: { ...job, updatedAt: new Date().toISOString() } });
}

async function ensureRecoveryAlarm() {
  const current = await chrome.alarms.get(RECOVERY_ALARM);
  if (!current) {
    await chrome.alarms.create(RECOVERY_ALARM, {
      delayInMinutes: ALARM_PERIOD_MINUTES,
      periodInMinutes: ALARM_PERIOD_MINUTES,
    });
  }
}

async function clearRecoveryAlarm() {
  await chrome.alarms.clear(RECOVERY_ALARM);
}

async function runJob() {
  if (runner) return runner;
  runner = (async () => {
    try {
      await ensureRecoveryAlarm();
      while (true) {
        const current = await readJob();
        if (!current || current.status !== "running") break;
        await delay(350);
        await saveJob(advanceJob(current));
      }
    } finally {
      runner = null;
      const current = await readJob();
      if (!current || current.status !== "running") await clearRecoveryAlarm();
    }
  })();
  return runner;
}

async function recoverJob() {
  const current = await readJob();
  if (current?.status === "running") {
    await ensureRecoveryAlarm();
    void runJob();
  }
}

chrome.runtime.onInstalled.addListener(() => void recoverJob());
chrome.runtime.onStartup.addListener(() => void recoverJob());
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === RECOVERY_ALARM) void recoverJob();
});

chrome.action.onClicked.addListener((tab) => {
  if (!Number.isInteger(tab?.id)) return;
  void chrome.sidePanel.open({ tabId: tab.id }).catch((error) => console.warn("Could not open side panel", error));
  void chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content/launcher.js"] })
    .catch(() => {});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_JOB_STATE") {
    readJob().then(sendResponse, (error) => sendResponse({ error: String(error) }));
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
      await ensureRecoveryAlarm();
      sendResponse(await readJob());
      void runJob();
    })().catch((error) => sendResponse({ error: String(error) }));
    return true;
  }

  if (message?.type === "RESET_DEMO_JOB") {
    void (async () => {
      await chrome.storage.local.remove(JOB_KEY);
      await clearRecoveryAlarm();
      sendResponse({ ok: true });
    })().catch((error) => sendResponse({ error: String(error) }));
    return true;
  }

  if (message?.type === "OPEN_SIDE_PANEL" && Number.isInteger(sender.tab?.id)) {
    chrome.sidePanel.open({ tabId: sender.tab.id }).then(
      () => sendResponse({ ok: true }),
      (error) => sendResponse({ ok: false, error: String(error) }),
    );
    return true;
  }

  return false;
});

void recoverJob();
