const express    = require("express");
const bodyParser = require("body-parser");
const cors       = require("cors");
const app        = express();
require("dotenv").config();
const port       = process.env.PORT;
app.use(bodyParser.json());

// Add CORS Later
// const allowedOrigins = ['http://localhost:3000', 'https://your-frontend-app.com'];

// const corsOptions = {
//     origin: function (origin, callback) {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
// };
// app.use(cors(corsOptions));

app.use(
  cors({
    origin: "*",
  })
);

const apiKeys = [
  process.env.FRONT_END_API_KEY,
  process.env.EMBED_API_KEY,
  process.env.SCRAPER_API_KEY,
];

// Import route files
const searchRouter              = require("./routes/search");
const checkDocumentStatusRouter = require("./routes/checkDocumentStatus");
const checkUpdateRouter         = require("./routes/update");

function authenicateAPIKey(req, res, next) {
  const apiKey = req.header("Authorization");
  if (!apiKey || !apiKeys.includes(apiKey)) {
    return res.sendStatus(401);
  }
  next();
}

app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});
//Creates a new job and sends it to respective services.
app.use("/search", authenicateAPIKey, searchRouter);
//Check what the status of a job is.
app.use("/checkDocumentStatus", authenicateAPIKey, checkDocumentStatusRouter);
//Update the map with status
app.use("/update", authenicateAPIKey, checkUpdateRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
