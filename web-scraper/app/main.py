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
    
    background_tasks.add_task(background_scrape)
    return {"status_code": 200}


if __name__ == "__main__":
    #     payload = {
    #     'base_url': 'https://example.com/',
    #     'status': 'success',
    #     'message': 'Update successful',
    #     'context': 'Some context data'
    # }
    #     response = requests.put(
    #         "http://192.168.199.97:5000/update",
    #         json=payload,
    #         headers={"Content-Type": "application/json"},
    #     )
    #     print(response.json())
    uvicorn.run(app, host="0.0.0.0", port=8000)
