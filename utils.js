const fs = require("fs");
const path = "./syncedTasks.json";

function loadSyncedIds() {
  try {
    if (!fs.existsSync(path)) return new Set();
    const raw = fs.readFileSync(path);
    const ids = JSON.parse(raw);
    return new Set(ids);
  } catch (e) {
    return new Set();
  }
}

function saveSyncedIds(idSet) {
  const ids = Array.from(idSet);
  fs.writeFileSync(path, JSON.stringify(ids, null, 2));
}

module.exports = { loadSyncedIds, saveSyncedIds };
