import os
import pinecone
import json
import util as util
from typing import Union
from fastapi import FastAPI, Response, status

# Init FastAPI
app = FastAPI()

# Init Pinecone Index instance
API_KEY = os.environ["PINECONE_API_KEY"]
pinecone.init(api_key=API_KEY, environment="gcp-starter")
pinecone_index = pinecone.Index("syntax-surfer")


@app.get("/")
def read_root():
    return {"Hello! Embed Search is running!"}


@app.get("/check/{base_url}", status_code=200)
def check_index(base_url: str, response: Response):
    results = pinecone_index.query(
        vector=util.template_vector(),
        filter={
            "base_url": {"$eq": base_url}
        },
        top_k=5,
        include_metadata=True
    )

    matches = results.to_dict()["matches"]

    if len(matches) == 0:
        response.status_code = status.HTTP_204_NO_CONTENT

    return json.dumps(matches)
