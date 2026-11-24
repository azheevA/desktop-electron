const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const standaloneDirectory = path.join(projectRoot, ".next", "standalone");
const serverFile = path.join(standaloneDirectory, "server.js");

if (!fs.existsSync(serverFile)) {
  console.error("Next.js standalone server was not found. Run `bun run build` first.");
  process.exit(1);
}

function copyDirectoryIfPresent(source, destination) {
  if (!fs.existsSync(source)) return;
  fs.cpSync(source, destination, { recursive: true, force: true });
}

copyDirectoryIfPresent(
  path.join(projectRoot, "public"),
  path.join(standaloneDirectory, "public"),
);
copyDirectoryIfPresent(
  path.join(projectRoot, ".next", "static"),
  path.join(standaloneDirectory, ".next", "static"),
);

process.env.NODE_ENV = "production";
process.env.HOSTNAME = process.env.HOSTNAME || "127.0.0.1";
process.env.PORT = process.env.PORT || "3100";

process.chdir(standaloneDirectory);
require(serverFile);
