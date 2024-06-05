const express = require("express");
const serverless = require("serverless-http");

const app = express();
const router = express.Router();

router.get("/", (request, response) => {
  response.send("App is running..");
});
router.get("/api", (request, response) => {
  response.send("api path");
});

app.use("/.netlify/functions/api/", router);

module.exports.handler = serverless(app);
