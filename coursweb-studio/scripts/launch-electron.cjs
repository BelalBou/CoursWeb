const { spawn } = require("node:child_process");
const electronPath = require("electron");

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

if (process.argv[2]) {
  env.VITE_DEV_SERVER_URL = process.argv[2];
}

const child = spawn(electronPath, ["."], {
  cwd: process.cwd(),
  env,
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
