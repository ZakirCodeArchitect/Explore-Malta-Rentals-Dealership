import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const attempts = Number(process.env.PRISMA_MIGRATE_RETRIES ?? 5);
const delayMs = Number(process.env.PRISMA_MIGRATE_RETRY_DELAY_MS ?? 5000);

function runMigrate() {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["prisma", "migrate", "deploy"], {
      cwd: projectRoot,
      shell: true,
      stdio: "inherit",
    });
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
    child.on("error", reject);
  });
}

for (let i = 1; i <= attempts; i++) {
  try {
    await runMigrate();
    process.exit(0);
  } catch {
    console.error(`prisma migrate deploy failed (attempt ${i}/${attempts}). Retrying in ${delayMs}ms…`);
    if (i === attempts) process.exit(1);
    await new Promise((r) => setTimeout(r, delayMs));
  }
}
