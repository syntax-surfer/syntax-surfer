from typing import Dict, List

import requests
from bs4 import BeautifulSoup

def _get_links(soup: BeautifulSoup, url: str) -> List:
    """Get all links from soup that are from the same url

    Args:
        soup (BeautifulSoup): _description_

    Returns:
        List: _description_
    """
    links = []

    for link in soup.find_all('a'):
        if link.get('href') is not None:
            if link.get('href').startswith(url):
                links.append(link.get('href'))

    return links
    

def scrape_base_page(url: str) -> Dict:
    """Scrape the given URL and return the title."""
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")

    return_object = {}

    return_object['title'] = soup.title.string
    return_object['contents'] = []
    return_object['links'] = _get_links(soup, url)

    paragraphs = soup.find_all('p')

    for paragraph in paragraphs:
        return_object['contents'].append(paragraph.get_text())

    return return_object

def background_scrape():
    pass