const express = require('express');
const router = express.Router();
const {v4: uuidv4} = require('uuid');
const { checkDatabase, startEmbed, scrapeContent} = require('../util');

router.post('/', async (req, res) =>
{
    const baseURL = req.query.baseURL;
    const query = req.query.query;

    if(!baseURL || !query)
    {
        return res.status(400).json({error: 'Domain and query are required parameters.'});
    }

    const metadata = {
        'base_url': `${baseURL}`,
        'query': `${query}`,
        'status': 'pending',
        'message': '',
        'origin': '',
        'content': '',
    }

    //Generates a unique ID.
    const jobId = uuidv4();

    var params = {
        TableName: 'Jobs',
        Item: {
            "jobId": jobId,
            "metadata": metadata,
        }
    };
   
    await client.put(params, (err, data) => {
        if (err) {
            console.error("Unable to add item.");
        }
    });


    const statusCode = await checkDatabase(query, baseURL);
    if(statusCode === 200) //Already in Database.
    {
        startEmbed(query, baseURL, jobId, res);
        return res.status(200).json({jobId: `${jobId}`});
    }

    //Need to webscrape the data.
    try {
        const data = await scrapeContent(baseURL, jobId);
        if(data !== 200)
        {
            return res.status(data).json({error: `Web Scraper returned ${data}`});
        }
    }
    catch(error){
        console.log(error);
    }
    return res.status(200).json({jobId: `${jobId}`});
});

module.exports = router;