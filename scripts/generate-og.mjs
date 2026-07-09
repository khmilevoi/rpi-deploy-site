import { spawn } from "node:child_process";

const PORT = 8091;
const URL = `http://localhost:${PORT}`;
const OUT = "src/assets/og.png";

const useShell = process.platform === "win32";

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: useShell });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`))
    );
  });
}

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // server not up yet, keep polling
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server at ${url} did not respond within ${timeoutMs}ms`);
}

const server = spawn("serve", ["-l", String(PORT), "src"], {
  stdio: "ignore",
  shell: useShell,
});

try {
  await waitForServer(URL);
  await run("playwright", ["screenshot", "--viewport-size", "1200,630", URL, OUT]);
  console.log(`Wrote ${OUT}`);
} finally {
  server.kill();
}
