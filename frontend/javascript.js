let currentScore = 0;

function displayMessage(messageText, sender) {
    const chatMessages = document.getElementById("chatMessages");
    const messageContainer = document.createElement("div");

    if (sender === "User") {
        messageContainer.classList.add("message", "user");
        messageContainer.innerHTML = `<strong>${sender}:</strong> ${messageText}`;
    } else {
        messageContainer.classList.add("message-container");
        messageContainer.innerHTML = `
            <img class="emotion-image" src="anxiety.gif" alt="Emotion">
            <div class="message other">${messageText}</div>`;
    }
    chatMessages.appendChild(messageContainer);
}

// Function to update the mood score with animation
function updateMoodScore(targetScore) {
    const moodScoreElement = document.querySelector(".mood-score");
    const duration = 3000; // Animation duration in ms
    const stepTime = 20; // Time per step
    const steps = Math.abs(targetScore - currentScore) / stepTime;
    const stepSize = (targetScore - currentScore) / steps;

    function animate() {
        if (Math.abs(targetScore - currentScore) > Math.abs(stepSize)) {
            currentScore += stepSize;
            const angle = (Math.min(Math.max(currentScore, 0), 100) / 100) * 360;
            moodScoreElement.style.background = `conic-gradient(#ff00e6 ${angle}deg, #1a1a2e ${angle}deg)`;
            requestAnimationFrame(animate);
        } else {
            currentScore = targetScore;
            const angle = (currentScore / 100) * 360;
            moodScoreElement.style.background = `conic-gradient(#ff00e6 ${angle}deg, #1a1a2e ${angle}deg)`;
        }
    }

    requestAnimationFrame(animate);
}

// Function to show thought bubble text and hide it after a while
function updateThoughtBubble(text) {
    const thoughtBubble = document.getElementById("thoughtBubble");
    thoughtBubble.textContent = text;
    thoughtBubble.style.display = "block";
    setTimeout(() => {
        thoughtBubble.style.display = "none";
    }, 5000);
}

// Button functionalities
function editResponse() {
    const responseBox = document.getElementById("suggestedResponse");
    responseBox.removeAttribute("readonly"); // Unlocks the text box for editing
    responseBox.focus();
}

function copyResponse() {
    const responseBox = document.getElementById("suggestedResponse");
    responseBox.select();
    document.execCommand("copy");
    alert("Response copied to clipboard!");
}

function generateResponse() {
    // Placeholder function for generating a response
    console.log("Generate function called.");
}

// Example usage
displayMessage("Hello! This is a test message.", "User");
displayMessage("Here's another message for the chat log.", "Other");
updateMoodScore(60);
updateThoughtBubble("Maybe try saying something different");
