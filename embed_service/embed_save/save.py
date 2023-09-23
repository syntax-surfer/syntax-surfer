import json
import pinecone
import os
import uuid
from sentence_transformers import SentenceTransformer
API_KEY = os.environ["PINECONE_API_KEY"]
model = SentenceTransformer('multi-qa-mpnet-base-dot-v1')

# init index instance
pinecone.init(api_key=API_KEY, environment="gcp-starter")
pinecone_index = pinecone.Index("syntax-surfer")

def lambda_entry(queue_entry):
    # Parse JSON obj
    entry_json = json.loads(queue_entry)

    # convert to vectors
    vectors = convert_to_vector(entry_json["content"])

    # upsert to pinecone
    upsert(entry_json, vectors)


def convert_to_vector(sentence):
    vector = model.encode(sentence).tolist()
    return vector

def upsert(entry_json, content_vectors):
    # get a uuid
    new_uuid = str(uuid.uuid4())

    # upsert
    pinecone_index.upsert([
        (new_uuid, content_vectors, {
            "url": entry_json["url"],
            "baseURL": entry_json["baseURL"],
            "content": entry_json["content"],
            "title": entry_json["title"]
        })
    ])
