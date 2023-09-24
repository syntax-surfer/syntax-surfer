const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const {v4: uuidv4} = require('uuid');
require('dotenv').config();
const app = express();
const port = 5000;

const cors = require('cors');
app.use(bodyParser.json());
const map = new Map();

ACCESS_KEY = process.env.accessKeyId;
SECRET_ACCESS_KEY = process.env.secretAccessKey;
SESSION_TOKEN = process.env.sessionToken;

const client = new AWS.DynamoDB.DocumentClient({region: 'us-east-1',
accessKeyId: ACCESS_KEY,
secretAccessKey: SECRET_ACCESS_KEY,
sessionToken: SESSION_TOKEN
});
const tableName = 'Jobs';

app.use(cors({
    origin: "*"
}));

//Creates a new job and sends it to respective services.
app.post('/search', async (req, res) =>
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
    console.log('Check database status code: ' + statusCode);
    if(statusCode === 200) //Already in Database.
    {
        console.log("DB already has this URL");
        startEmbed(query, baseURL, jobId, res);
        return res.status(200).json({jobId: `${jobId}`});
    }

    //Need to webscrape the data.
    try {
        console.log("Sending to webscraper");
        const data = await scrapeContent(baseURL, jobId);
        console.log(data);
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

//Check what the status of a job is.
app.get('/checkDocumentStatus', async (req, res) =>
{
    const jobId = req.query.jobId;
    if(!jobId || jobId === undefined)
    {
        return res.status(400).json({error: 'Request must contain jobId.'});
    }

    var result = await queryDynamoDB(jobId,res);
    console.log(result);
    return res.status(200).json(result);
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
    
    const requiredProperties = ['base_url', 'status', 'message', 'content', 'query', 'origin', 'jobId'];

    for (const prop of requiredProperties) { //Ensure Request has the correct properties.
        if (!(prop in requestBody)) {
            return res.status(400).json({ error: `Missing property: "${prop}"` });
        }
    }
    const jobId = requestBody.jobId;
    const oldBody = await queryDynamoDB(jobId,res);
    console.log(oldBody.query);
    console.log(oldBody.base_url);
    try{
        const newBody = {
            'base_url': `${oldBody.base_url}`,
            'query': `${oldBody.query}`,
            'status': `${requestBody.status}`,
            'message': `${requestBody.message}`,
            'origin': `${requestBody.origin}`,
            'content': `${requestBody.content}`,
        };
        await updateDynamoDB(jobId, newBody, res);
        if(requestBody.origin === 'embed')
        {
            console.log("Embed ready, sending data over to cody");
            await startEmbed(newBody.query, newBody.base_url, jobId, res);
            
            
        }
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: 'Could not read dynamoDB'});
    }
});

async function scrapeContent(baseURL, jobId){
    try{
        const response = await axios.post(`http://192.168.199.42:8000/web-scraper`, 
        {
            'url': `${baseURL}`,
            'jobId': `${jobId}`,

        });
        return response.status;
    }
    catch(error)
    {
        throw error;
    }
}

async function checkDatabase(query, url)
{
    const endpoint = `http://192.168.199.72:5000/check/?base_url=${url}`;
    try{
        const response = await axios.get(endpoint);
        return response.status;
    }
    catch(error)
    {
        throw error;
    }
}

async function startEmbed(query, url, jobId, res)
{
    const endpoint = `http://192.168.199.72:5000/query/?base_url=${url}&query=${query}`;
    try
    {
        const response = await axios.post(endpoint);
        console.log(response.data);
        const newBody = {
            'base_url': `${url}`,
            'query': `${query}`,
            'status': 'Complete',
            'message': `Success`,
            'origin': `Embed`,
            'content': `${response.data}`,
        };
        await updateDynamoDB(jobId, newBody, res);
    }   
    catch(error)
    {
        console.log(error);
    }
}

async function updateDynamoDB(jobId, newBody, res)
{
    try{
        var params = {
            Key: {
                jobId: jobId
            },
            UpdateExpression: 'set metadata = :metadata',
            ExpressionAttributeValues: {
                ':metadata': newBody
            },
            TableName: 'Jobs',
        };
        var result = await client.update(params).promise();
        if(!result)
        {
            return res.status(404).json({error: `Object is not in DynamoDB`});
        }
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: 'Could not read dynamoDB'});
    }
}

async function queryDynamoDB(jobId, res)
{
    try{
        console.log(jobId);
        var params = {
            KeyConditionExpression: 'jobId = :jobId',
            ExpressionAttributeValues: {
                ':jobId': jobId,
            },
            TableName: 'Jobs'
        };
        var result = await client.query(params).promise();
        if(!result)
        {
            return res.status(500).json({error: `${jobId} is not in the map.`});
        }
       // console.log(result);
        return JSON.parse(JSON.stringify(result)).Items[0].metadata);
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: 'Could not read dynamoDB'});
    }
}

app.listen(port, ()=>
{
    console.log(`Server is running on port ${port}`);
});

