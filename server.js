require("dotenv").config();
const express = require("express");
const { Client } = require("@notionhq/client");

const app = express();
const notion = new Client({ auth: process.env.NOTION_API_KEY });

app.use(express.static("public"));
app.use(express.json());

// Set the Access-Control-Allow-Origin header to allow access from any domain
app.use((request, response, next) => {
  if (process.env.NODE_ENV === "development") {
    response.setHeader("Access-Control-Allow-Origin", "*");
  } else {
    let allowedOrigins = process.env.ALLOWED_ORIGINS;
    if (typeof allowedOrigins !== "undefined") {
      allowedOrigins = allowedOrigins.split(",");
      const origin = request.headers.origin;
      if (allowedOrigins.includes(origin)) {
        response.setHeader("Access-Control-Allow-Origin", origin);
      }
    } else {
      response.setHeader("Access-Control-Allow-Origin", "*");
    }
  }

  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

const router = express.Router();

// Index
router.get("/", function (request, response) {
  if (process.env.NODE_ENV === "development") {
    response.sendFile(__dirname + "/views/index.html");
  } else {
    response.send("App is running..");
  }
});
// Send Wedding Messages
router.post("/wedding-msg", async function (request, response) {
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
// Get Wedding Message
router.post("/get-wedding-msg", async function (request, response) {
  const dbID = process.env.NOTION_PAGE_ID_WEDDING_MSG;
  const { name } = request.body;

  try {
    const wedMsg = await notion.databases.query({
      database_id: dbID,
      filter: {
        and: [
          {
            property: "Name",
            rich_text: {
              is_not_empty: true,
            },
          },
          {
            property: "Message",
            rich_text: {
              is_not_empty: true,
            },
          },
        ],
      },
      sorts: [
        {
          timestamp: "created_time",
          direction: "descending",
        },
      ],
    });

    const results = wedMsg.results.map((res) => {
      return {
        Name: res.properties["Name"].title[0].text.content,
        Message: res.properties["Message"].rich_text[0].text.content,
        "Created time": res.properties["Created time"].created_time,
      };
    });
    response.json({ message: "success!", data: results });
  } catch (error) {
    response.json({ message: "error", error });
  }
});

app.use("/", router);

if (process.env.NODE_ENV === "development") {
  const listener = app.listen(process.env.PORT || 1001, () => {
    console.log(`Server started on port ${listener.address().port}`);
  });
}

module.exports = {
  app: app,
};
