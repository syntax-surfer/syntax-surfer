const express = require('express');
const router = express.Router();
const { queryDynamoDB, deleteDynamoDB } = require('../util');

router.get('/', async (req, res) =>
{
    const jobId = req.query.jobId;
    if(!jobId || jobId === undefined)
    {
        return res.status(400).json({error: 'Request must contain jobId.'});
    }

    try{
        const result = await queryDynamoDB(jobId);
        console.log(result);
        if(!result)
        {
            return res.status(400).json({error: `${jobId} was not found in the Database`});
        }
        
        if(result.status === 'Complete')
        {
            console.log('is complete deleting');
            await deleteDynamoDB(jobId);
        }
        return res.status(200).json(result);
    }
    catch(error)
    {
        console.log(error);
        return res.status(400).json({error: 'Could not connect to DynamoDB'});
    }
});

module.exports = router;