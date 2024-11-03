let currentScore = 0;
let engagementTotal = 0;
let engagementCount = 0;
const messageQueue = []; // maintains a queue of the last 10 messages

// Map for mood images
const moodImages = {
    sad: "sadness.webp",
    empathetic: "joy.webp",
    neutral: "neutral.png",
    happy: "joy.webp",
    // Add other moods as needed
};

// Initially set to neutral mood for "other" person
document.getElementById("emotionImage").src = moodImages["neutral"];

// Function to display messages based on sender and message text
function displayMessage(messageText, sender) {
    const chatMessages = document.getElementById("chatMessages");
    const messageContainer = document.createElement("div");

    if (sender === "user1") {
        // Display user message
        messageText = messageText.replace(/^user1: /, ""); // Remove "user1: " prefix
        messageContainer.classList.add("message", "user");
        messageContainer.innerHTML = `<strong>${sender}:</strong> ${messageText}`;
    } else {
        // Display message from the other person, initially neutral
        messageContainer.classList.add("message-container");
        messageContainer.innerHTML = `
            <div class="emotion-image">
                <img class="otherperson-image" src="${moodImages["neutral"]}" alt="Emotion" onmouseover="showBubble(this, 'I might need some help...')" onmouseout="hideBubble(this)">
                <div class="thought-bubble">I might need some help...</div>
            </div>
            <div class="message other">${messageText}</div>`;
    }
    chatMessages.appendChild(messageContainer);

    // Add the message to the queue and maintain a max of 10 messages
    messageQueue.push({ text: messageText, sender: sender });
    if (messageQueue.length > 10) messageQueue.shift();
}


// Function to update the mood score circle with animation
function updateMoodScore(targetScore) {
    const moodScoreElement = document.querySelector(".mood-score");
    const duration = 3000;
    const stepTime = 20;
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

// Function to handle AI analysis results
function handleAIResults(results) {
    const { suggestedMessage, mood, suggestedMood, engagement } = results;

    const suggestedResponse = document.getElementById("suggestedResponse");
    suggestedResponse.value = suggestedMessage;

    const moodImageSrc = moodImages[suggestedMood.toLowerCase()] || "neutral.png";
    const othermoodImageSrc = moodImages[mood.toLowerCase()] || "neutral.png";
    document.getElementById("emotionImage").src = moodImageSrc; // Update mood image based on AI response
    // Update all images of the other person to the new mood image
    document.querySelectorAll(".otherperson-image").forEach(img => {
        img.src = othermoodImageSrc;
    });

    updateThoughtBubble(suggestedMessage);

    updateEngagement(engagement);
}

// Function to display a thought bubble next to the mood score
function updateThoughtBubble(text) {
    const thoughtBubble = document.getElementById("thoughtBubble");
    thoughtBubble.textContent = text;
    thoughtBubble.style.display = "block";
    setTimeout(() => {
        thoughtBubble.style.display = "none";
    }, 5000);
}

// Function to update the engagement score and average it
function updateEngagement(newScore) {
    engagementTotal += newScore;
    engagementCount += 1;
    const averageEngagement = engagementTotal / engagementCount;
    updateMoodScore(averageEngagement * 10);
}

// Button functionalities
function editResponse() {
    const responseBox = document.getElementById("suggestedResponse");
    responseBox.removeAttribute("readonly");
    responseBox.focus();
}

function copyResponse() {
    const responseBox = document.getElementById("suggestedResponse");
    responseBox.select();
    document.execCommand("copy");
}

// Function to show thought bubble on hover
function showBubble(element, text) {
    const bubble = element.nextElementSibling;
    bubble.textContent = text;
    bubble.style.display = "block";
}

// Function to hide thought bubble on mouse out
function hideBubble(element) {
    const bubble = element.nextElementSibling;
    bubble.style.display = "none";
}

// Process each line of the conversation
function processConversationLine(line) {
    const [timestamp, sender, message] = parseLine(line);
    displayMessage(message, sender);
}

// Helper function to parse a line of conversation
function parseLine(line) {
    const match = line.match(/^\[(.*?)\] \[(.*?)\]: '(.*)'$/);
    if (match) {
        const timestamp = match[1];
        const sender = match[2];
        const message = match[3];
        return [timestamp, sender, message];
    }
    return [null, null, null];
}

// Function called when "Generate" is clicked
function generateResponse() {
    const last10Messages = messageQueue.map(item => item.text).join(" ");
    
    // Simulate AI call with the concatenated messages of last 10 messages
    // Uncomment this section to make an actual call to the Flask server
    /*
    fetch('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: last10Messages })
    })
    .then(response => response.json())
    .then(data => {
        handleAIResults(data); // Use the AI results to update the UI
    })
    .catch(error => {
        console.error('Error:', error);
    });
    */

    // Example AI result for testing
    const aiResult = {
        suggestedMessage: "Take it one day at a time. I'm here for you.",
        mood: "sad",
        suggestedMood: "empathetic",
        engagement: 10
    };
    
    handleAIResults(aiResult);
}

// Example usage with predefined conversation
const scrapedConversation = [
    "[2024-11-02T12:00:00Z] [user1]: 'Hello'",
    "[2024-11-02T12:00:00Z] [user2]: 'Hey, how have you been'",
    "[2024-11-02T12:00:00Z] [user1]: 'I'm doing well, how about you?'",
    "[2024-11-02T12:00:00Z] [user2]: 'I'm feeling really down today.'",
    "[2024-11-02T12:01:00Z] [user1]: 'Oh no, what happened?'",
    "[2024-11-02T12:02:00Z] [user2]: 'I've just been going through a tough time.'",
    "[2024-11-02T12:03:00Z] [user1]: 'That sounds rough, do you want to talk about it?'", 
    "[2024-11-02T12:04:00Z] [user2]: 'I don't know, it's just everything piling up.'", 
    "[2024-11-02T12:05:00Z] [user1]: 'I'm here for you, anytime.'",
    "[2024-11-02T12:06:00Z] [user2]: 'Thank you, it helps to know someone cares.'",
    "[2024-11-02T12:07:00Z] [user1]: 'You're not alone in this.'",
    "[2024-11-02T12:08:00Z] [user2]: 'It just feels so overwhelming at times.'",
    
];

scrapedConversation.forEach(line => processConversationLine(line));


/* 
Flask server (app.py)

from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    messages = data['messages']

    # Send data to Perplexity AI (replace URL and API key as needed)
    # response = requests.post('https://api.perplexity.ai/analyze', json={'input': messages},
    #                          headers={'Authorization': 'Bearer YOUR_API_KEY'})

    # Uncomment the following lines and replace with actual AI model's response parsing logic
    # if response.status_code == 200:
    #     ai_data = response.json()
    #     suggested_message = ai_data.get("suggestedMessage", "Default suggestion")
    #     mood = ai_data.get("mood", "neutral")
    #     suggested_mood = ai_data.get("suggestedMood", "neutral")
    #     engagement = ai_data.get("engagement", 0)
    #
    #     result = {
    #         "suggestedMessage": suggested_message,
    #         "mood": mood,
    #         "suggestedMood": suggested_mood,
    #         "engagement": engagement
    #     }
    # else:
    #     result = {
    #         "suggestedMessage": "Unable to process request",
    #         "mood": "neutral",
    #         "suggestedMood": "neutral",
    #         "engagement": 0
    #     }

    # Temporary mocked response for testing
    result = {
        "suggestedMessage": "Take it one day at a time. I'm here for you.",
        "mood": "sad",
        "suggestedMood": "empathetic",
        "engagement": 2
    }

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
*/
