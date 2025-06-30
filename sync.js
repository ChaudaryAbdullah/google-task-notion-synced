const { getAllGoogleTasks, completeGoogleTask } = require("./google");
const {
  getNotionTaskMap,
  addTaskToNotion,
  deleteTaskFromNotion,
} = require("./notion");
const { updateNotionTask } = require("./updateNotionTask");

async function syncTasks() {
  console.log(" Syncing all Google Tasks to Notion...");

  const googleTasks = await getAllGoogleTasks();
  const notionTaskMap = await getNotionTaskMap();

  const currentGoogleIds = new Set(googleTasks.map((t) => t.id));

  for (const task of googleTasks) {
    const existing = notionTaskMap[task.id];

    if (!existing) {
      await addTaskToNotion(task);

      if (task.status === "completed") {
        await completeGoogleTask(task.id, task.listId);
      }
    } else {
      await updateNotionTask(existing.pageId, task);
    }
  }

  for (const notionGoogleId in notionTaskMap) {
    if (!currentGoogleIds.has(notionGoogleId)) {
      const { pageId, notionData } = notionTaskMap[notionGoogleId];
      const title =
        notionData.properties?.Name?.title?.[0]?.plain_text || "Untitled";
      await deleteTaskFromNotion(pageId, title);
    }
  }

  console.log(" Sync complete.");
}

module.exports = { syncTasks };
