const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) =>
{
    res.send("HackMidWest");
});

app.get('/api/search', async (req, res) =>
{

    const url = req.query.url;
    //URL can be blank.
    const query = req.query.query;
    if(url) { // URL was given send to Webscraper.

        //Check if the url exists within the Database.
        try{
            const data = await checkDatabase(url);

            //If the Data does not exist send to webscraper.
            if(!data)
            {
                //Returns the location of where it is stored.
                const res = await scrapeContent(url);

                //Send that location to the Embed 
               


            }

        }
        catch(error)
        {
            console.error(error);
            res.status(500).json({error: 'An error occurred while check the Database.'});
        }
        console.log("Send to Webscraper");
    }
    else{ //Searching the entire Database with No set DOCs.
        //
        console.log("Search Database.");
    }

    res.send("HackMidWest api");
});

async function checkDatabase(url){

    try
    {
        
    }
    catch(error)
    {
        throw error;
    }

}

async function scarpeContent(url){
    try{

    }
    catch(error)
    {
        throw error;
    }
}

async function putInDatabase(data)
{

}

app.listen(port, ()=>
{
    console.log(`Server is running on port ${port}`);
});

