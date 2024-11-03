from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import os
import requests
import json
from uuid import uuid4
from datetime import datetime
from unsloth import FastLanguageModel
from transformers import TextStreamer

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Replace with a secure secret key

# Load the AI model once when the app starts
alpaca_prompt = """Below is an instruction that provides 10 of the most recent messages from a conversation with time stamps that provides context. Write a response that appropriately completes the request, including the current conversation mood, mood of the response, the next response to send and an engagement score.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

max_seq_length = 2048
dtype = None
load_in_4bit = True

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="rohansiva/lora_model",  # Replace with your actual model name
    max_seq_length=max_seq_length,
    dtype=dtype,
    load_in_4bit=load_in_4bit,
)
FastLanguageModel.for_inference(model)  # Enable native 2x faster inference

# Helper functions
def get_session_id(username, password):
    headers = {
        "Host": "i.instagram.com",
        "X-Ig-Connection-Type": "WiFi",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Ig-Capabilities": "36r/Fx8=",
        "User-Agent": "Instagram 159.0.0.28.123 (iPhone8,1; iOS 14_1; en_SA@calendar=gregorian; ar-SA; scale=2.00; 750x1334; 244425769) AppleWebKit/420+",
        "X-Ig-App-Locale": "en",
        "X-Mid": "Ypg64wAAAAGXLOPZjFPNikpr8nJt",
        "Accept-Encoding": "gzip, deflate"
    }
    data = {
        "username": username,
        "reg_login": "0",
        "enc_password": f"#PWD_INSTAGRAM:0:&:{password}",
        "device_id": str(uuid4()),
        "login_attempt_count": "0",
        "phone_id": str(uuid4())
    }
    url = "https://i.instagram.com/api/v1/accounts/login/"
    r = requests.post(url=url, headers=headers, data=data)
    session_id = r.cookies.get("sessionid")
    res = r.json()
    if 'logged_in_user' in res:
        user_id = res['logged_in_user']['pk']
        return session_id, user_id
    else:
        return None, None

def get_threads(session_id):
    headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)'
    }
    cookies = {"sessionid": session_id}
    r = requests.get("https://i.instagram.com/api/v1/direct_v2/inbox/?persistentBadging=true&folder=&thread_message_limit=1&limit=200", headers=headers, cookies=cookies)
    if r.status_code != 200:
        return []
    res = r.json()
    threads = res["inbox"]["threads"]
    threads_list = []
    for thread in threads:
        if thread["is_group"]:
            name = thread.get('thread_title', 'Unnamed Group')
        else:
            users = thread.get("users", [])
            if users:
                name = users[0].get("full_name", "Unknown User")
            else:
                name = "Empty Thread"
        thread_id = thread["thread_id"]
        threads_list.append({'id': thread_id, 'name': name})
    return threads_list

def get_messages_instagram(session_id, thread_id, cursor=""):
    headers = {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        'user-agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)'
    }
    cookies = {"sessionid": session_id}
    url = f"https://i.instagram.com/api/v1/direct_v2/threads/{thread_id}/?cursor={cursor}"
    r = requests.get(url, headers=headers, cookies=cookies)
    if r.status_code != 200:
        return []
    res = r.json()
    items = res["thread"]["items"]
    return items

def process_messages(messages):
    processed_messages = []
    user_id = str(session.get('user_id'))
    for message in reversed(messages):  # Reverse to chronological order
        item_type = message['item_type']
        if item_type == 'text':
            text = message['text']
        else:
            continue  # Skip non-text messages
        sender_id = str(message['user_id'])
        sender = 'user1' if sender_id == user_id else 'user2'
        timestamp_unix = float(message["timestamp"]) / 1000000
        timestamp = datetime.fromtimestamp(timestamp_unix).isoformat() + 'Z'
        processed_messages.append({
            'text': text,
            'sender': sender,
            'timestamp': timestamp
        })
    # Return last 10 messages
    return processed_messages[-10:]

def run_inference(messages):
    conversation = f"Conversation: {messages}"
    inputs = tokenizer(
        [alpaca_prompt.format(conversation, "", "")],
        return_tensors="pt"
    ).to("cuda")  # Change to "cpu" if CUDA is not available

    # Generate text
    output_sequences = model.generate(**inputs, max_new_tokens=128)
    # Decode the generated text
    generated_text = tokenizer.decode(output_sequences[0], skip_special_tokens=True)
    # Here you should parse `generated_text` to extract the required fields
    # For the purpose of this example, we'll simulate the result
    ai_result = {
        "suggestedMessage": "Take it one day at a time. I'm here for you.",
        "mood": "sad",
        "suggestedMood": "empathetic",
        "engagement": 2
    }
    return ai_result

# Routes
@app.route('/')
def welcome():
    return render_template('welcome.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        session_info = get_session_id(username, password)
        if session_info:
            session_id, user_id = session_info
            session['sessionid'] = session_id
            session['user_id'] = user_id
            threads = get_threads(session_id)
            return jsonify({'success': True, 'threads': threads})
        else:
            return jsonify({'success': False})
    else:
        return render_template('login.html')

@app.route('/set_thread', methods=['POST'])
def set_thread():
    data = request.get_json()
    thread_id = data.get('thread_id')
    if thread_id:
        session['threadid'] = thread_id
        return jsonify({'success': True})
    else:
        return jsonify({'success': False})

@app.route('/analyze')
def analyze():
    return render_template('analyzeconvo.html')

@app.route('/get_messages', methods=['GET'])
def get_messages_route():
    session_id = session.get('sessionid')
    thread_id = session.get('threadid')
    if not session_id or not thread_id:
        return jsonify({'success': False, 'error': 'Not logged in or thread not selected'})
    messages = get_messages_instagram(session_id, thread_id)
    processed_messages = process_messages(messages)
    return jsonify({'success': True, 'messages': processed_messages})

@app.route('/analyze', methods=['POST'])
def analyze_message():
    data = request.get_json()
    messages = data.get('messages')
    if not messages:
        return jsonify({'success': False, 'error': 'No messages provided'})
    ai_result = run_inference(messages)
    return jsonify(ai_result)

if __name__ == '__main__':
    app.run(debug=True)
