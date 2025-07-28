let num1 = Math.floor(Math.random() * 100);
let num2 = Math.floor(Math.random() * 100);
let originalUrl; 
let originalHostname;
let count = 0;
let timeInterval;
let sec = 30;

async function checkAnswer() {
    if (count > 0 || sec < 0) return;
    const input = document.getElementById("userInput").value;
    const outputDiv = document.getElementById("output");
    clearInterval(timeInterval); 
    const correct = (parseInt(input, 10) == (num1 * num2));

    if (correct) {
        count = 1; 
        outputDiv.innerHTML = `<mark style="background: #A6FFB8;">Correct! Redirecting you back...</mark>`;
        document.getElementById('safeTimer').innerHTML = "Success!";
        document.getElementById('userInput').disabled = true;
        document.querySelector('button').disabled = true;
        await sleep(800);
        const localTime = await browser.storage.local.get("storedTime");
        localTime.storedTime[originalHostname] = Date.now();
        await browser.storage.local.set({ storedTime: localTime.storedTime });
        window.location.href = originalUrl;
    } else {
        count = 2; 
        outputDiv.innerHTML = `<mark style="background: #FFB86CA6;">Incorrect! The answer was ${num1 * num2}.</mark>`;
        document.getElementById('safeTimer').innerHTML = "Failed!";
        document.getElementById('userInput').disabled = true;
        document.querySelector('button').disabled = true;
    }
}

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

function timer() {
    if (count == 0) {
        const questionText = `<br><b>What is ${num1} x ${num2}?</b>`;
        document.getElementById('safeTimer').innerHTML = '00:' + (sec < 10 ? '0' : '') + sec + questionText;
        document.getElementById('output').innerHTML = '';

        timeInterval = setInterval(function() {
            sec--;
            document.getElementById('safeTimer').innerHTML = '00:' + (sec < 10 ? '0' : '') + sec + questionText;

            if (sec < 0) {
                clearInterval(timeInterval);
                document.getElementById('safeTimer').innerHTML = "<span style='color: red;'>Time's Up!</span>";
                document.getElementById('output').innerHTML = "LOL NOOB!";
                document.getElementById('userInput').disabled = true;
                document.querySelector('button').disabled = true;
            }
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const data = await browser.storage.local.get('path');
    originalUrl = data.path;
    const hostdata = await browser.storage.local.get('pathHostname');
    originalHostname = hostdata.pathHostname;
    document.getElementById('submitBtn').addEventListener('click', checkAnswer);
    timer(); 
});