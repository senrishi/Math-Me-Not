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
    //object to store the hostnames of the url 
    if (!obj.includes(url)) {
      obj.push(url);
      const hostname = new URL(url).hostname.replace(/www\./, "");
      //object that assigns a null value (for the time) to the hostname
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
  // Generate a random position from 3 to 16 inclusive (4x4 grid)
  captchaPosition = Math.floor(Math.random() * (16 - 3 + 1)) + 3;

  // Build a 4x4 grid where the random position is marked with '*'
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
  // Use smoother collapse animation via class toggle
  panel.classList.toggle("open", captchaOpen);
  if (captchaOpen) {
    // Reset and generate a new challenge whenever opened
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
    // Captcha solved; proceed to clear stored URLs
    clearUrl();
  } else {
    statusDiv.textContent = "Incorrect answer. Try again.";
    statusDiv.style.color = "red";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addUrlsBtn").addEventListener("click", saveUrls);

  // Add Enter key support for the URL input field
  document.getElementById("url").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      saveUrls();
    }
  });

  // Clearing is only available via captcha; no standalone button

  // Captcha button expands the panel and generates a new challenge
  const captchaBtn = document.getElementById("captchaBtn");
  if (captchaBtn) captchaBtn.addEventListener("click", toggleCaptcha);

  // Submit captcha answer
  const submitBtn = document.getElementById("captchaSubmit");
  if (submitBtn) submitBtn.addEventListener("click", submitCaptcha);

  // Enter key submits the captcha answer
  const ansEl = document.getElementById("captchaAnswer");
  if (ansEl) {
    ansEl.addEventListener("keypress", (event) => {
      if (event.key === "Enter") submitCaptcha();
    });
  }
});
