const axios = require("axios");
const moment = require("moment-timezone");
require("dotenv").config();

const headers = {
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

// Convert UTC to your local timezone (e.g., Asia/Karachi)
function getLocalDueTime(utcTime) {
  if (!utcTime) return null;
  return moment(utcTime).tz("Asia/Karachi").format(); // Use your timezone
}

async function updateNotionTask(pageId, googleTask) {
  const updates = {
    properties: {
      Name: {
        title: [
          {
            text: { content: googleTask.title || "(No Title)" },
          },
        ],
      },
      Status: {
        select: {
          name: googleTask.status === "completed" ? "Done" : "Pending",
        },
      },
      Due: googleTask.due
        ? {
            date: {
              start: getLocalDueTime(googleTask.due), // with time
            },
          }
        : undefined,
      Notes: googleTask.notes
        ? {
            rich_text: [
              {
                text: { content: googleTask.notes },
              },
            ],
          }
        : undefined,
      TaskList: googleTask.listName
        ? {
            rich_text: [
              {
                text: { content: googleTask.listName },
              },
            ],
          }
        : undefined,
    },
  };

  try {
    await axios.patch(`${process.env.NOTION_API}/pages/${pageId}`, updates, {
      headers,
    });
    console.log(` Updated: ${googleTask.title}`);
  } catch (error) {
    console.error(" Update failed:", error.response?.data || error.message);
  }
}

module.exports = { updateNotionTask };
