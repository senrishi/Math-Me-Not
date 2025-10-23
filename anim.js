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
    const safeDiv = document.getElementById("safeTimer");
    clearInterval(timeInterval); 
    const correct = (parseInt(input, 10) == (num1 * num2));

    if (correct) {
        count = 1; 
        safeDiv.innerHTML = `<strong>Success!</strong><br><strong>Redirecting you back...</strong>`;
        document.getElementById('userInput').disabled = true;
        document.querySelector('button').disabled = true;
        await sleep(2000);
        const localTime = await browser.storage.local.get("storedTime");
        localTime.storedTime[originalHostname] = Date.now();
        await browser.storage.local.set({ storedTime: localTime.storedTime });
        window.location.href = originalUrl;
    } else {
        count = 2; 
        safeDiv.innerHTML = `<strong>Failed!</strong><br><strong>The answer was ${num1 * num2}.</strong>`;
        document.getElementById('userInput').disabled = true;
        document.querySelector('button').disabled = true;
    }
}

const sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

function timer() {
    if (count == 0) {
        const questionText = `<br><b>What is ${num1} x ${num2}?</b>`;
        document.getElementById('safeTimer').innerHTML = '00:' + (sec < 10 ? '0' : '') + sec + questionText;

        timeInterval = setInterval(function() {
            sec--;
            document.getElementById('safeTimer').innerHTML = '00:' + (sec < 10 ? '0' : '') + sec + questionText;

            if (sec < 0) {
                clearInterval(timeInterval);
                document.getElementById('safeTimer').innerHTML = "<strong><span style='color: red;'>Time's Up!</span></strong><br><strong>LOL NOOB!</strong>";
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

    // Add Enter key support for the input field
    document.getElementById('userInput').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            checkAnswer();
        }
    });

    timer();
});
