let mediaRecorder;
let audioChunks = [];

// Elements
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const statusText = document.getElementById("status");

// Start recording
startButton.addEventListener("click", async () => {
    startButton.disabled = true;
    stopButton.disabled = false;
    statusText.textContent = "Recording...";

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = sendAudioToAPI;
        mediaRecorder.start();
    } catch (err) {
        console.error("Error accessing audio:", err);
    }
});

// Stop recording
stopButton.addEventListener("click", () => {
    startButton.disabled = false;
    stopButton.disabled = true;
    statusText.textContent = "Stopped recording.";

    if (mediaRecorder) {
        mediaRecorder.stop();
    }
});


function sendAudioToAPI() {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    fetch("https://your-api-endpoint.com/upload", {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        statusText.textContent = "Audio uploaded successfully!";
        console.log("Server response:", data);
    })
    .catch(error => {
        statusText.textContent = "Error uploading audio.";
        console.error("Error:", error);
    });

    audioChunks = [];
}


function showAudio() {
    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    // Create an audio element to play the recording
    const audioURL = URL.createObjectURL(audioBlob);
    const audioElement = document.createElement("audio");
    audioElement.src = audioURL;
    audioElement.controls = true;

    // Append the audio element to the page
    document.body.appendChild(audioElement);

    audioChunks = [];
}