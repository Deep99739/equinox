# Simple in-memory user token store for demo purposes
# In production, use a database!

user_tokens_store = {}

def save_user_tokens(user_id, tokens):
    user_tokens_store[user_id] = tokens

def get_user_tokens(user_id):
    return user_tokens_store.get(user_id)
