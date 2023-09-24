from fastapi import FastAPI, BackgroundTasks
import uvicorn
from pydantic import BaseModel, HttpUrl

from scrape import background_scrape

app = FastAPI()


class Request(BaseModel):
    url: HttpUrl


@app.post("/web-scraper")
def web_scraper(request: Request, background_tasks: BackgroundTasks):
    url = str(request.url)
    
    background_tasks.add_task(background_scrape, url)
    return {"status_code": 200}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
