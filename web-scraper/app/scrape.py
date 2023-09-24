from typing import List
from pprint import pprint
import json
import boto3

import requests
from bs4 import BeautifulSoup


def scrape(start_url: str | List[str], start=False):
    response = requests.get(start_url)
    soup = BeautifulSoup(response.content, "html.parser")

    return_object = {}

    return_object["title"] = soup.title.string
    return_object["contents"] = []
    return_object["url"] = start_url

    links = []
    if start:
        links = _get_links(soup, start_url)

    paragraphs = soup.find_all("p")

    for paragraph in paragraphs:
        return_object["contents"].append(paragraph.get_text())

    return return_object, links


def _get_links(soup: BeautifulSoup, url: str) -> List:
    """Get all links from soup that are from the same url

    Args:
        soup (BeautifulSoup): _description_

    Returns:
        List: _description_
    """
    links = []

    for link in soup.find_all("a"):
        if link.get("href") is not None:
            if not (link.get("href").startswith("http") or "/en/" in link.get("href")):
                links.append(link.get("href"))

    return links


def crawl(start_url: str):
    if start_url.endswith(".html"):
        base_url = "/".join(start_url.split("/")[:-1])
    else:
        raise ValueError(f"start_url ({start_url}) must end with .html")

    all_objects = []
    return_objects, links = scrape(start_url, start=True)
    all_objects.append(return_objects)
    links = set(links)

    for link in links:
        return_objects, _ = scrape(f"{base_url}/{link}")
        all_objects.append(return_objects)

    for obj in all_objects:
        obj["base_url"] = start_url

    return all_objects


def background_scrape(base_url: str, job_id: str):
    objects = crawl(base_url)
    s3 = boto3.client("s3")

    bucket = "hackmidwest23-test-bucket"
    key = f"web-scraper/{base_url.replace('/', '-')}.json"
    s3.put_object(
        Body=json.dumps(objects),
        Bucket=bucket,
        Key=key
    )

    response = requests.post(
        "http://192.168.199.72:5000/save",
        json={"bucket_name": bucket, "file_path": key, "job_id": job_id},
    )
    print(response.status_code)
    print(response.content)

    payload = {
        "base_url": base_url,
        "status": "Pending",
        "origin": "scraper",
        "message": "from scraper",
        "content": "",
        "query": "",
        "job_id": job_id
    }
    requests.put(
        "http://192.168.199.97:5000/update",
        json=payload,
        headers={"Content-Type": "application/json"},
    )


if __name__ == "__main__":
    objs = crawl("https://docs.scrapy.org/en/latest/index.html")
    pprint(objs)
