(() => {
  const hostId = "generic-job-panel-launcher";
  if (document.getElementById(hostId)) return;

  const host = document.createElement("div");
  host.id = hostId;
  host.style.cssText = "position:fixed;right:0;bottom:96px;z-index:2147483646";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>
      button { border:1px solid #224d3b; border-right:0; border-radius:8px 0 0 8px; background:#f5f2e9; color:#17392b; padding:12px 14px; font:600 13px/1.2 system-ui,sans-serif; box-shadow:0 5px 18px #17291f30; cursor:pointer }
      button:focus-visible { outline:3px solid #d66b45; outline-offset:2px }
    </style>
    <button type="button" aria-label="Open the demo side panel">Open job panel</button>
  `;
  shadow.querySelector("button").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" });
  });
  document.documentElement.append(host);
})();