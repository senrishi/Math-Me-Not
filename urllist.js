let captchaPosition = null;
let captchaOpen = false;

async function saveUrls() {
  const input = document.getElementById("url").value.trim();
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = "";

  if (!input) {
    statusDiv.textContent = "Please enter one or more URLs.";
    statusDiv.style.color = "red";
    return;
  }
  const urls = input.split(" ").filter((url) => url);
  const data = await browser.storage.local.get({ storedUrls: [], storedTime: {} });
  let obj = data.storedUrls;
  let time_obj = data.storedTime;

  for (let i = 0; i < urls.length; i++) {
    let url = urls[i];
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    if (!obj.includes(url)) {
      obj.push(url);
      const hostname = new URL(url).hostname.replace(/www\./, "");

      time_obj[hostname] = null;
    }
  }

  browser.storage.local.set({ storedTime: time_obj });
  browser.storage.local.set({ storedUrls: obj }).then(
    () => {
      statusDiv.textContent = "URLs saved successfully!";
      statusDiv.style.color = "green";
      document.getElementById("url").value = "";
    },
    (error) => {
      statusDiv.textContent = "Error: " + error.message;
      statusDiv.style.color = "red";
    },
  );
}

function clearUrl() {
  const statusDiv = document.getElementById("stat");
  browser.storage.local.remove(["storedUrls", "storedTime"]).then(
    () => {
      statusDiv.textContent = "URLs cleared successfully!";
      statusDiv.style.color = "green";
    },
    (error) => {
      statusDiv.textContent = "Error: " + error.message;
      statusDiv.style.color = "red";
    },
  );
}

function generateCaptcha() {
  captchaPosition = Math.floor(Math.random() * (16 - 3 + 1)) + 3;

  let grid = "";
  let count = 1;
  for (let i = 0; i < 4; i++) {
    let row = [];
    for (let j = 0; j < 4; j++) {
      row.push(count === captchaPosition ? "*" : "^");
      count++;
    }
    grid += row.join(" ") + (i < 3 ? "\n" : "");
  }

  const gridEl = document.getElementById("captchaGrid");
  if (gridEl) gridEl.textContent = grid;

  const ansEl = document.getElementById("captchaAnswer");
  if (ansEl) {
    ansEl.value = "";
    ansEl.focus();
  }

  const statDiv = document.getElementById("stat");
  if (statDiv) statDiv.textContent = "";
}

function toggleCaptcha() {
  const panel = document.getElementById("captchaPanel");
  if (!panel) return;
  captchaOpen = !captchaOpen;
  panel.classList.toggle("open", captchaOpen);
  if (captchaOpen) {
    generateCaptcha();
  }
}

function submitCaptcha() {
  const statusDiv = document.getElementById("stat");
  const ansStr = (document.getElementById("captchaAnswer").value || "").trim();
  const ansNum = parseInt(ansStr, 10);

  if (Number.isNaN(ansNum)) {
    statusDiv.textContent = "Please enter a valid number.";
    statusDiv.style.color = "red";
    return;
  }

  if (ansNum === captchaPosition * captchaPosition) {
    clearUrl();
  } else {
    statusDiv.textContent = "Incorrect answer. Try again.";
    statusDiv.style.color = "red";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addUrlsBtn").addEventListener("click", saveUrls);
  document.getElementById("url").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      saveUrls();
    }
  });
  const captchaBtn = document.getElementById("captchaBtn");
  if (captchaBtn) captchaBtn.addEventListener("click", toggleCaptcha);
  const submitBtn = document.getElementById("captchaSubmit");
  if (submitBtn) submitBtn.addEventListener("click", submitCaptcha);

  const ansEl = document.getElementById("captchaAnswer");
  if (ansEl) {
    ansEl.addEventListener("keypress", (event) => {
      if (event.key === "Enter") submitCaptcha();
    });
  }
});
