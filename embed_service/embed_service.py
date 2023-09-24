import boto3
import json
import os
import pinecone
import pydantic
import util
import uuid
from fastapi import FastAPI, Response, status

# Init FastAPI
app = FastAPI()

# Init Pinecone Index instance
API_KEY = os.environ["PINECONE_API_KEY"]
pinecone.init(api_key=API_KEY, environment="gcp-starter")
pinecone_index = pinecone.Index("syntax-surfer")

# Init Boto3 client
s3 = boto3.client("s3")


class S3File(pydantic.BaseModel):
    bucket_name: str
    file_path: str


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
    ).to_dict()

    del results["namespace"]

    return json.dumps(results)


@app.post("/save/")
def parse_and_save(s3file: S3File):
    print("POST /save/ hit!")

    s3.download_file(s3file.bucket_name, s3file.file_path, "placeholder.json")

    file_contents = open("placeholder.json").read()
    embed(file_contents)


def embed(queue_entry):
    # Parse JSON obj
    entry_json = json.loads(queue_entry)[0]
    contents = entry_json["contents"]

    # Convert to vectors
    vectors = [util.convert_to_vector(c) for c in contents]

    # Upsert to Pinecone
    upsert(entry_json, vectors, contents)


def upsert(entry_json, content_vectors, contents):
    for i in range(0, len(content_vectors)):
        new_uuid = str(uuid.uuid4())

        pinecone_index.upsert([
            (new_uuid, content_vectors[i], {
                "url": entry_json["url"],
                "base_url": entry_json["base_url"],
                "content": contents[i],
                "title": entry_json["title"]
            })
        ])
        print(f"content {new_uuid} upserted")
    


def test_embed_file(filename):
    file = open(filename)
    lines = file.readlines()

    chunks = [lines[x:x+50] for x in range(0, len(lines), 50)]

    for chunk in chunks:
        portion = ""

        for line in chunk:
            portion += line

        to_json = {
            "url": "https://en.wikipedia.org/wiki/Artificial_neural_network",
            "base_url": "en.wikipedia.org",
            "content": portion,
            "title": "Artificial Neural Network"
        }

        now_json = json.dumps(to_json)

        embed(now_json)
        print("chunk embedded")
