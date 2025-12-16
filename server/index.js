import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdtemp, writeFile, readFile, rm, mkdir } from "node:fs/promises";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "1mb" }));

const STATIC_DIR = path.join(__dirname, "..", "dist");
const INDEX_HTML = path.join(STATIC_DIR, "index.html");
const JAR_DIR = process.env.JSLT_JAR_DIR || path.join(__dirname, "..", "java-lib");
const CLASSPATH = process.env.JSLT_CLASSPATH || path.join(JAR_DIR, "*");

async function ensureJarDir() {
  await mkdir(JAR_DIR, { recursive: true });
}

async function runJslt(transform, input) {
  await ensureJarDir();

  const tempDir = await mkdtemp(path.join(os.tmpdir(), "jslt-"));
  const transformPath = path.join(tempDir, "transform.jslt");
  const inputPath = path.join(tempDir, "input.json");

  try {
    await Promise.all([
      writeFile(transformPath, transform, "utf8"),
      writeFile(inputPath, JSON.stringify(input), "utf8")
    ]);

    const { stdout } = await execFileAsync(
      "java",
      ["-cp", CLASSPATH, "com.schibsted.spt.data.jslt.cli.JSLT", transformPath, inputPath],
      { maxBuffer: 5 * 1024 * 1024 }
    );

    return stdout;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

app.post("/api/transform", async (req, res) => {
  const { input, jslt } = req.body || {};

  if (typeof jslt !== "string") {
    return res.status(400).json({ error: "Body must include 'jslt' string" });
  }

  if (input === undefined) {
    return res.status(400).json({ error: "Body must include 'input' JSON value" });
  }

  try {
    const rawResult = await runJslt(jslt, input);

    try {
      const parsed = JSON.parse(rawResult);
      return res.json(parsed);
    } catch (parseErr) {
      return res.status(500).json({
        error: "Engine returned invalid JSON",
        details: (rawResult || "").toString().trim() || parseErr.message || String(parseErr)
      });
    }
  } catch (err) {
    console.error("JSLT execution failed", err);

    if (err.stdout || err.stderr) {
      const stdout = err.stdout ? err.stdout.toString() : "";
      const stderr = err.stderr ? err.stderr.toString() : "";
      return res.status(500).json({
        error: "JSLT execution failed",
        details: (stdout + stderr).trim() || String(err.message || err)
      });
    }

    if (err.code === "ENOENT") {
      return res.status(500).json({
        error: "Java runtime or JSLT classpath not found",
        details: "Ensure Java is installed and JSLT jars are available"
      });
    }

    return res.status(500).json({ error: "Unexpected server error", details: err.message || String(err) });
  }
});

app.use(express.static(STATIC_DIR));

app.get("*", async (_req, res) => {
  try {
    const html = await readFile(INDEX_HTML, "utf8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    res.status(500).send("Build not found. Please run npm run build.");
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`JSLT Studio listening on port ${port}`);
});
