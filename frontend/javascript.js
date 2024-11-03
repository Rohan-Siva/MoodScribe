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



// Example usage
displayMessage("Hello! This is a test message.", "User");
displayMessage("Here's another message for the chat log.", "Other");
updateMoodScore(100); // Update smoothly to 50%
updateThoughtBubble("Maybe try saying something different");
