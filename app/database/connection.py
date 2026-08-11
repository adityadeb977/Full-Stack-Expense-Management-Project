from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))

db = client["expense_db"]

user_collection = db["users"]
expense_collection = db["expenses"]
registration_request_collection = db["registration_requests"]
registration_request_collection = db["registration_requests"]