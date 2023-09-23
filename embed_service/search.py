import os
import pinecone
import json
import util as util
from typing import Union
from fastapi import FastAPI

# Init FastAPI
app = FastAPI()

# Init Pinecone Index instance
API_KEY = os.environ["PINECONE_API_KEY"]
pinecone.init(api_key=API_KEY, environment="gcp-starter")
pinecone_index = pinecone.Index("syntax-surfer")


@app.get("/")
def read_root():
    return {"Hello! Embed Search is running!"}


@app.get("/check/{base_url}")
def check_index(base_url: str):
    results = pinecone_index.query(
        vector=util.template_vector(),
        filter={
            "base_url": {"$eq": base_url}
        },
        top_k=5,
        include_metadata=True
    )

    return json.dumps(results.to_dict()["matches"])
