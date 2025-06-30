const { google } = require("googleapis");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const tasks = google.tasks({ version: "v1", auth: oauth2Client });

//  Fetch all tasks from all lists
async function getAllGoogleTasks() {
  const taskListsRes = await tasks.tasklists.list();
  const taskLists = taskListsRes.data.items || [];

  const allTasks = [];

  for (const list of taskLists) {
    const taskRes = await tasks.tasks.list({
      tasklist: list.id,
      showCompleted: false,
      maxResults: 100,
    });

    const tasksInList = taskRes.data.items || [];

    for (const task of tasksInList) {
      allTasks.push({
        ...task,
        listName: list.title,
        listId: list.id,
      });
    }
  }

  return allTasks;
}

//  Mark task as completed
async function completeGoogleTask(taskId, listId) {
  try {
    const task = await tasks.tasks.get({
      tasklist: listId,
      task: taskId,
    });

    task.data.status = "completed";

    await tasks.tasks.update({
      tasklist: listId,
      task: taskId,
      requestBody: task.data,
    });

    console.log(` Marked as completed: ${task.data.title}`);
  } catch (err) {
    console.error(" Could not complete:", err.response?.data || err.message);
  }
}

module.exports = {
  getAllGoogleTasks,
  completeGoogleTask,
};
