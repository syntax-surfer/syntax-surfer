import json
import os
import pinecone
import util
import uuid

API_KEY = os.environ["PINECONE_API_KEY"]

# Init Pinecone Index instance
pinecone.init(api_key=API_KEY, environment="gcp-starter")
pinecone_index = pinecone.Index("syntax-surfer")


def lambda_entry(queue_entry, _):
    # Parse JSON obj
    entry_json = json.loads(queue_entry)

    # Convert to vectors
    vectors = util.convert_to_vector(entry_json["content"])

    # Upsert to Pinecone
    upsert(entry_json, vectors)


def upsert(entry_json, content_vectors):
    new_uuid = str(uuid.uuid4())

    pinecone_index.upsert([
        (new_uuid, content_vectors, {
            "url": entry_json["url"],
            "base_url": entry_json["base_url"],
            "content": entry_json["content"],
            "title": entry_json["title"]
        })
    ])
