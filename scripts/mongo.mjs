// Zero-install local MongoDB for development.
// Runs a real mongod (downloaded & cached on first run) on a fixed port,
// persisting data to ./.mongo-data so it survives restarts.
// Leave this running in its own terminal, or use `npm run dev:all`.
import { MongoMemoryServer } from "mongodb-memory-server";
import { mkdirSync } from "node:fs";
import path from "node:path";

const PORT = 27017;
const dbPath = path.resolve(process.cwd(), ".mongo-data");
mkdirSync(dbPath, { recursive: true });

const mongod = await MongoMemoryServer.create({
  instance: { port: PORT, dbPath, storageEngine: "wiredTiger" },
});

console.log(`\n🍃 MongoDB ready at mongodb://127.0.0.1:${PORT}`);
console.log(`   Data persists in ${dbPath}`);
console.log("   Leave this terminal open. Press Ctrl+C to stop.\n");

const shutdown = async () => {
  console.log("\nStopping MongoDB…");
  await mongod.stop({ doCleanup: false, force: false });
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
