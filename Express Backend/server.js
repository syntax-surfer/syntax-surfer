const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) =>
{
    res.send("HackMidWest Test");
});

app.get('/api/', (req, res) =>
{
    res.send("HackMidWest api");
});

app.listen(port, ()=>
{
    console.log(`Server is running on port ${port}`);
})