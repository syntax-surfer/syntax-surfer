import os
import pinecone
import util
import uuid
from fastapi import FastAPI, Response, status

API_KEY = os.environ["PINECONE_API_KEY"]

# Init Pinecone Index instance
pinecone.init(api_key=API_KEY, environment="gcp-starter")
pinecone_index = pinecone.Index("syntax-surfer")

pinecone_index.delete(
    filter={
        "base_url":{"$eq":"mcu.com"}
    }
)
