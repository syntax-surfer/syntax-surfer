const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
app.use(bodyParser.json());

//Default Gateway
app.get('/', (req, res) =>
{
    res.send("HackMidWest");
});

//Called from front end
app.post('/search', async (req, res) =>
{
    const baseURL = req.query.baseURL;
    const query = req.query.query;

    if(!baseURL || !query)
    {
        return res.status(400).json({error: 'Domain and query are required parameters.'});
    }

    //Add new pending entry to Job status cache
    //Map PK = domain
    //  values = {
     /*
        status: pending,
        message: DEFAULT_MESSAGE,
        content: "",
        update_time: TIME
    }
     */

//Call Embed MS to see if data already exists.
        //GET /search/{domain}
        //Response
        //if not In database
        //send to scraper MS
        try{
           const data = await scrapeContent(baseURL);
           if(data.status != '200')
           {
                return res.status(data.status).json({error: `Web Scraper returned ${data.status}`});
           }
        }
        catch(error){
            console.log(error);
        }
        //POST /scaper/{domain}
        //

    return res.status(200);
});

app.get('/getUpdate', async (req, res) =>
{
    const baseURL = req.query.baseURL;

    //return map.get(domain);
});

app.put('/update', async (req, res) =>
{
    if (req.get('Content-Type') !== 'application/json') {
        return res.status(400).json({ error: 'Request must have "Content-Type: application/json" header.' });
    }
    
    const requestBody = req.body;

    if (typeof requestBody !== 'object' || Array.isArray(requestBody)) {
        return res.status(400).json({ error: 'Invalid JSON format. Request body must be an object.' });
    }
    
    const requiredProperties = ['base_url', 'status', 'message', 'context'];

    for (const prop of requiredProperties) { //Ensure Request has the correct properties.
        if (!(prop in requestBody)) {
            return res.status(400).json({ error: `Missing property: "${prop}"` });
        }
    }

    //Take Data from Embed or scaper and update MAP.


    
    res.status(200).json({ message: 'Update successful' });
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


app.listen(port, ()=>
{
    console.log(`Server is running on port ${port}`);
});

