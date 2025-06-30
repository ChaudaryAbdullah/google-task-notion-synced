const axios = require("axios");
require("dotenv").config();
const moment = require("moment-timezone");

const headers = {
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

function getLocalDueTime(utcTime) {
  if (!utcTime) return null;
  return moment(utcTime).tz("Asia/Karachi").format(); // your timezone
}

//  Fetch all Notion tasks mapped by GoogleTaskId
async function getNotionTaskMap() {
  const url = `${process.env.NOTION_API}/databases/${process.env.NOTION_DATABASE_ID}/query`;

  try {
    const response = await axios.post(url, {}, { headers });
    const pages = response.data.results;

    const taskMap = {};
    for (let page of pages) {
      const googleTaskId =
        page.properties.GoogleTaskId?.rich_text?.[0]?.plain_text;
      if (googleTaskId) {
        taskMap[googleTaskId] = {
          pageId: page.id,
          notionData: page,
        };
      }
    }

    return taskMap;
  } catch (err) {
    console.error(
      " Failed to fetch Notion tasks:",
      err.response?.data || err.message
    );
    return {};
  }
}

//  Add new task to Notion
async function addTaskToNotion(task) {
  const body = {
    parent: {
      database_id: process.env.NOTION_DATABASE_ID,
    },
    properties: {
      Name: {
        title: [
          {
            text: { content: task.title || "(No Title)" },
          },
        ],
      },
      GoogleTaskId: {
        rich_text: [
          {
            text: { content: task.id },
          },
        ],
      },
      Status: {
        select: {
          name: task.status === "completed" ? "Done" : "Pending",
        },
      },
      Due: task.due
        ? {
            date: {
              start: getLocalDueTime(task.due),
            },
          }
        : undefined,
      Notes: task.notes
        ? {
            rich_text: [
              {
                text: { content: task.notes },
              },
            ],
          }
        : undefined,
      TaskList: task.listName
        ? {
            rich_text: [
              {
                text: { content: task.listName },
              },
            ],
          }
        : undefined,
    },
  };

  try {
    await axios.post(`${process.env.NOTION_API}/pages`, body, { headers });
    console.log(` Added: ${task.title}`);
  } catch (err) {
    console.error(" Add error:", err.response?.data || err.message);
  }
}

// 🗑️ Archive task in Notion
async function deleteTaskFromNotion(pageId, title) {
  try {
    await axios.patch(
      `${process.env.NOTION_API}/pages/${pageId}`,
      { archived: true },
      { headers }
    );
    console.log(` Deleted from Notion: ${title}`);
  } catch (err) {
    console.error(" Delete error:", err.response?.data || err.message);
  }
}

module.exports = {
  getNotionTaskMap,
  addTaskToNotion,
  deleteTaskFromNotion,
};
