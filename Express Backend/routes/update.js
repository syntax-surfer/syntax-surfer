const express = require('express');
const router = express.Router();
const { queryDynamoDB, startEmbed, updateDynamoDB } = require('../util');

router.put('/', async (req, res) =>
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
    
    try{
        const oldBody = await queryDynamoDB(jobId);
        const newBody = {
            'base_url': `${oldBody.base_url}`,
            'query': `${oldBody.query}`,
            'status': `${requestBody.status}`,
            'message': `${requestBody.message}`,
            'origin': `${requestBody.origin}`,
            'content': `${requestBody.content}`,
        };
        await updateDynamoDB(jobId, newBody);
        if(requestBody.origin === 'embed')
        {
            startEmbed(newBody.query, newBody.base_url, jobId);
            return res.status(200).json({status:"success"});
        }
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({error: 'Could not read dynamoDB'});
    }
});

module.exports = router;