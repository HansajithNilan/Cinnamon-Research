def get_chat_response(user_message: str):
    message = user_message.lower()
    
    if "give me" in message or "2026" in message:
        return "Here is the analysis:\n\n• Vacant Area Size: 131.30 sqm\n• Plants Count: 121\n• Estimated Cost: Rs 14,520.00"
    
    return "Thanks for sharing. Based on your input, I recommend monitoring the moisture levels in that area."