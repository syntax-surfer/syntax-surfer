from fastapi import FastAPI, BackgroundTasks
import uvicorn
from pydantic import BaseModel, HttpUrl

from scrape import background_scrape

app = FastAPI()


class Request(BaseModel):
    url: HttpUrl
    jobId: str


@app.post("/web-scraper")
def web_scraper(request: Request, background_tasks: BackgroundTasks):
    print(f"received following data from request: {request.url}, {request.jobId}")
    url = str(request.url)
    
    background_tasks.add_task(background_scrape, url, request.jobId)
    return {"status_code": 200}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
