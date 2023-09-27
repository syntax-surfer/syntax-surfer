const axios = require('axios');
const AWS   = require('aws-sdk');
require('dotenv').config();
ACCESS_KEY        = process.env.ACCESS_KEY_ID;
SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
SESSION_TOKEN     = process.env.SESSION_TOKEN;
SCRAPER_ENDPOINT  = process.env.SCRAPER_ENDPOINT;
EMBED_ENDPOINT    = process.env.EMBED_ENDPOINT;

const client = new AWS.DynamoDB.DocumentClient({region: 'us-east-1',
accessKeyId: ACCESS_KEY,
secretAccessKey: SECRET_ACCESS_KEY,
sessionToken: SESSION_TOKEN
});

async function updateDynamoDB(jobId, newBody)
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
        await client.update(params).promise();
    }
    catch(error) {
        console.log(error);
    }
}

async function queryDynamoDB(jobId)
{
    try{
        var params = {
            KeyConditionExpression: 'jobId = :jobId',
            ExpressionAttributeValues: {
                ':jobId': jobId,
            },
            TableName: 'Jobs'
        };
        var result = await client.query(params).promise();
        return JSON.parse(JSON.stringify(result)).Items[0].metadata;
    }
    catch(error) {
        console.log(error);
    }
}

async function checkDatabase(query, url)
{
    const endpoint = EMBED_ENDPOINT + `check/?base_url=${url}`;
    try{
        const response = await axios.get(endpoint);
        return response.status;
    }
    catch(error)
    {
        console.log(error);
    }
}

async function startEmbed(query, url, jobId, res)
{
    const endpoint = EMBED_ENDPOINT + `query/?base_url=${url}&query=${query}`;
    try
    {
        const response = await axios.post(endpoint);
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

async function scrapeContent(baseURL, jobId){
    try{
        const response = await axios.post(SCRAPER_ENDPOINT + `web-scraper`, 
        {
            'url': `${baseURL}`,
            'jobId': `${jobId}`,

        });
        return response.status;
    }
    catch(error)
    {
        console.log(error);
    }
}

module.exports = {
    updateDynamoDB,
    queryDynamoDB,
    checkDatabase,
    startEmbed,
    scrapeContent,
};