let num1, num2;

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

function check() {
  const ip = document.getElementById("ip").value;
  if (parseInt(ip) == num1 + num2) {
    document.getElementById("clearUrlsBtn").disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("addUrlsBtn").addEventListener("click", saveUrls);
  document.getElementById("clearUrlsBtn").addEventListener("click", clearUrl);
  
  num1 = Math.floor(Math.random() * 100);
  num2 = Math.floor(Math.random() * 100);
  document.getElementById("clearUrlsBtn").disabled = true;
  document.getElementById("sum").innerHTML ="Solve this problem to get access to the clear button.<br>"+"<br>What is " + num1 + " + " + num2 + "?";
  document.getElementById("submit").addEventListener("click", check);
});