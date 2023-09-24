const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
app.use(bodyParser.json());
const map = new Map();

//Default Gateway
app.get('/', (req, res) =>
{
    res.send("HackMidWest");
});

//Creates a new job and sends it to respective services.
app.post('/search', async (req, res) =>
{
    const baseURL = req.query.baseURL;
    const query = req.query.query;

    if(!baseURL || !query)
    {
        return res.status(400).json({error: 'Domain and query are required parameters.'});
    }
    console.log(baseURL + " " + query);

    map.set(req.query.baseURL, 
        {
            'base_url': `${baseURL}`,
            'query': `${query}`,
            'status': 'pending',
            'message': '',
            'origin': '',
            'content': '',
        });

    //Call embed api to see if the URL is in database.
    //IF in database
    //Send query and url to embed API
    //IF NOT in Database
    //Send to Scraper API
    //Wait for Scraper API to put data into map.


    //Map PK = domain
    //  values = {
     /*
        status: pending,
        message: DEFAULT_MESSAGE,
        content: "",
        update_time: TIME
    }
     */
    //

    try {
        const data = await scrapeContent(baseURL);
        if(data.status !== '200')
        {
            return res.status(data.status).json({error: `Web Scraper returned ${data.status}`});
        }
    }
    catch(error){
        console.log(error);
    }
    return res.status(200).json({message: "Success"});
});

//Check what the status of a job is.
app.get('/getUpdate', async (req, res) =>
{
    const baseURL = req.query.baseURL;
    if(!baseURL)
    {
        return res.status(400).json({error: 'Request must contain baseURL.'});
    }
    if(!map.get(baseURL))
    {
        return res.status(500).json({error: `baseURL is not in the map.`});
    }

    return res.status(200).json(map.get(baseURL));
});

//Update the map with status
app.put('/update', async (req, res) =>
{
    if (req.get('Content-Type') !== 'application/json') {
        return res.status(400).json({ error: 'Request must have "Content-Type: application/json" header.' });
    }
    
    const requestBody = req.body;

    if (typeof requestBody !== 'object' || Array.isArray(requestBody)) {
        return res.status(400).json({ error: 'Invalid JSON format. Request body must be an object.' });
    }
    
    const requiredProperties = ['base_url', 'status', 'message', 'content', 'query', 'origin'];

    for (const prop of requiredProperties) { //Ensure Request has the correct properties.
        if (!(prop in requestBody)) {
            return res.status(400).json({ error: `Missing property: "${prop}"` });
        }
    }

    

    const base_url = requestBody.base_url;
    if(!map.get(base_url))
    {
        return res.status(404).json({error: `Object is not in the map`});
    }
    const query = map.get(base_url).query;


    map.set(base_url, 
        {
            'base_url': `${base_url}`,
            'query': `${query}`,
            'status': `${requestBody.status}`,
            'message': `${requestBody.message}`,
            'origin': `${requestBody.origin}`,
            'content': `${requestBody.content}`,
        });

    if(requestBody.origin === 'embed'){ //Sent from webscraper.
        //Create GET request to EMBED.
        startEmbed(query, base_url);
    }
    
    return res.status(200).json({ message: 'Update successful' });
});

async function scrapeContent(baseURL){
    try{
        const response = await axios.post(`http://192.168.199.42:8000/web-scraper`, 
        {
            'url': `${baseURL}`
        });
        return response.status;
    }
    catch(error)
    {
        throw error;
    }
}

//
async function startEmbed()
{
    try
    {
        //Call Embed API.

    }   
    catch(error)
    {
        console.log(error);
    }
}


app.listen(port, ()=>
{
    console.log(`Server is running on port ${port}`);
});

