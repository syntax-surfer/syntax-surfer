import json

from fastapi import FastAPI, BackgroundTasks
import uvicorn
from pydantic import BaseModel, HttpUrl
import requests

from scrape import scrape_base_page, background_scrape
from load import send_sqs_message

app = FastAPI()


class Request(BaseModel):
    url: HttpUrl


@app.post("/web-scraper")
def web_scraper(request: Request, background_tasks: BackgroundTasks):
    url = str(request.url)

    base_page_data = scrape_base_page(url)
    send_sqs_message(
        url,
        url,
        base_page_data["contents"],
        base_page_data["title"],
    )
    
    background_tasks.add_task(background_scrape, url)
    return {"status_code": 200}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
