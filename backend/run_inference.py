from unsloth import FastLanguageModel
from transformers import TextStreamer

# Define your alpaca_prompt template
alpaca_prompt = """Below is an instruction that provides 10 of the most recent messages from a conversation with time stamps that provides context. Write a response that appropriately completes the request, including the current conversation mood, mood of the response, the next response to send and an engagement score.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

# Set your parameters
max_seq_length = 2048  # Adjust as needed
dtype = None  # Automatically detect
load_in_4bit = True  # Use 4-bit quantization

# Load the model
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="rohansiva/lora_model",  # Replace with your actual model name
    max_seq_length=max_seq_length,
    dtype=dtype,
    load_in_4bit=load_in_4bit,
)
FastLanguageModel.for_inference(model)  # Enable native 2x faster inference

# Prepare the input
conversation = """Conversation: [2024-11-02T12:00:00Z] [user1]: 'Hey, I got some great news today!' [2024-11-02T12:01:00Z] [user2]: 'Oh, that's awesome! What happened?' [2024-11-02T12:02:00Z] [user1]: 'I finally got that job I interviewed for last week.' [2024-11-02T12:03:00Z] [user2]: 'Congratulations! You totally deserve it.' [2024-11-02T12:04:00Z] [user1]: 'Thank you! I was so nervous.' [2024-11-02T12:05:00Z] [user2]: 'I can imagine. It's such a relief, isn't it?' [2024-11-02T12:06:00Z] [user1]: 'Absolutely. Now I just have to figure out the commute.' [2024-11-02T12:07:00Z] [user2]: 'That's a good problem to have though, right?' [2024-11-02T12:08:00Z] [user1]: 'For sure. I'm just so relieved.' [2024-11-02T12:09:00Z] [user2]: 'I'm really happy for you. Let's celebrate soon!'"""

inputs = tokenizer(
    [alpaca_prompt.format(conversation, "", "")],
    return_tensors="pt"
).to("cuda")  # Ensure this matches your device (cuda or cpu)

# Generate text
text_streamer = TextStreamer(tokenizer)
_ = model.generate(**inputs, streamer=text_streamer, max_new_tokens=128)