from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_cors import CORS
import os
import json
import re
from datetime import datetime
import requests
import jsonify

app = Flask(__name__)
CORS(app)
app.secret_key = 'your_secret_key'  # Replace with a secure secret key

# Instagram API related constants
HEADERS = {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    "pragma": "no-cache",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 105.0.0.11.118 (iPhone11,8; iOS 12_3_1; en_US; en-US; scale=2.00; 828x1792; 165586599)'
}

@app.route('/')
def index():
    return render_template('welcome.html')

valid_username = "hackerman202444"
valid_password = "hacktx2024"

@app.route('/login', methods=['POST'])
def login():
    # Ensure the request is POST and JSON is provided
    data = request.get_json()
    if data is None:
        return jsonify(success=False, error="No JSON data provided"), 400

    usernameinput = data.get('username')
    passwordinput = data.get('password')

    if usernameinput == valid_username and passwordinput == valid_password:
        return jsonify(success=True), 200
    else:
        return jsonify(success=False), 401
    

@app.route('/start_conversation')
def start_conversation():
    return render_template('analyzeconvo.html') 



if __name__ == '__main__':
    app.run(debug=True)