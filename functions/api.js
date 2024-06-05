const express = require("express");
const serverless = require("serverless-http");

const app = express();
const router = express.Router();

router.get("/", (request, response) => {
  response.send("App is running..");
});

app.use("/.netlify/functions/api/", router);

module.exports.handler = serverless(app);
