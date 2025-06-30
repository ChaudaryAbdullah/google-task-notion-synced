require("dotenv").config();
const cron = require("node-cron");
const { syncTasks } = require("./sync");

console.log(" Starting sync service...");

syncTasks(); // Initial run

// Every 1 minutes
cron.schedule("*/1 * * * *", () => {
  console.log("\n Scheduled Sync:", new Date().toLocaleString());
  syncTasks();
});
