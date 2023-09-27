const axios = require('axios');
//const AWS   = require('aws-sdk');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");


require('dotenv').config();
ACCESS_KEY        = process.env.ACCESS_KEY_ID;
SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
SESSION_TOKEN     = process.env.SESSION_TOKEN;
SCRAPER_ENDPOINT  = process.env.SCRAPER_ENDPOINT;
EMBED_ENDPOINT    = process.env.EMBED_ENDPOINT;

const client = new DynamoDBClient({region: 'us-east-1',
credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
    sessionToken: SESSION_TOKEN
},
});
const docClient = DynamoDBDocumentClient.from(client);

async function updateDynamoDB(jobId, newBody)
{
    try{
        const command = new UpdateCommand({
            TableName: 'Jobs',
            Key: {
                jobId: jobId,
            },
            UpdateExpression: 'set metadata = :metadata',
            ExpressionAttributeValues: {
                ':metadata': newBody,
            },
        });
        const result = await docClient.send(command);
    }
    catch(error){
        console.log(error);
    }
}

async function queryDynamoDB(jobId)
{
    try{
        const command = new GetCommand({
            TableName: "Jobs",
            Key: {
                jobId: jobId,
            },
        });

        const result = await docClient.send(command);
        return JSON.parse(JSON.stringify(result)).Item.metadata;
    }
    catch(error){
        console.log(error);
    }
}

async function deleteDynamoDB(jobId)
{
    try {
        const command = new DeleteCommand({
            TableName: 'Jobs',
            Key: {
                jobId: jobId,
            },
        });
        await client.send(command);
    }
    catch(error){
        console.log(error);
    }
}

async function checkDatabase(url)
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

async function startEmbed(query, url, jobId)
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
        await updateDynamoDB(jobId, newBody);
        
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
    deleteDynamoDB,
};