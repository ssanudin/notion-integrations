require("dotenv").config();
const express = require("express");
const { Client } = require("@notionhq/client");

const app = express();
const notion = new Client({ auth: process.env.NOTION_API_KEY });

app.use(express.static("public"));
app.use(express.json());

// Index
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

// Send Wedding Messages
app.post("/wedding-msg", async function (request, response) {
  const dbID = process.env.NOTION_PAGE_ID_WEDDING_MSG;
  const { name, msg } = request.body;

  try {
    const wedMsg = await notion.pages.create({
      parent: {
        type: "database_id",
        database_id: dbID,
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: name,
              },
            },
          ],
        },
        Message: {
          rich_text: [
            {
              text: {
                content: msg,
              },
            },
          ],
        },
      },
      children: [
        {
          object: "block",
          heading_2: {
            rich_text: [
              {
                text: {
                  content: msg,
                },
              },
            ],
          },
        },
      ],
    });
    response.json({ message: "success!", data: wedMsg.properties });
  } catch (error) {
    response.json({ message: "error", error });
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${listener.address().port}`);
});
