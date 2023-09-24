import os
import pinecone
import json
import util as util
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


@app.get("/check/", status_code=200)
def check_index(base_url: str = "", response: Response = status.HTTP_200_OK):
    results = pinecone_index.query(
        vector=util.template_vector(),
        filter={
            "base_url": {"$eq": base_url}
        },
        top_k=1,
        include_metadata=True
    )

    matches = results.to_dict()["matches"]

    if len(matches) == 0:
        response.status_code = status.HTTP_204_NO_CONTENT

    return json.dumps(matches)


@app.post("/query/")
def query_index(base_url: str = "", query: str = ""):
    results = pinecone_index.query(
        vector=util.convert_to_vector(query),
        filter={
            "base_url": {"$eq": base_url}
        },
        top_k=8,
        include_metadata=True
    ).to_dict()["matches"]

    return json.dumps(results)
