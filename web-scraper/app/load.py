import json

import boto3

def send_sqs_message(url: str, base_url: str, content: str, title: str) -> None:
    """Send a message to Amazon SQS queue

    Args:
        url (str): The URL of the page that was scraped
        base_url (str): The domain of the page that was scraped
        content (str): The content of the page that was scraped
        title (str): The title of the page that was scraped
    """
    sqs = boto3.client("sqs")
    queue_url = "https://sqs.us-east-1.amazonaws.com/596108273960/scraped-data"

    body = json.dumps(
        {
            "url": url,
            "base_url": url,
            "content": content,
            "title": title,
        }
    )

    sqs.send_message(
        QueueUrl=queue_url,
        DelaySeconds=10,
        MessageBody=body
    )