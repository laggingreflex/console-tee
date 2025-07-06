import { formatWithOptions } from "util";
import consoleInterceptor from "console-interceptor";
import File from "./file.js";

const originalStdoutWrite = process.stdout.write;
const originalStderrWrite = process.stderr.write;

const sync = !(
  process.argv.includes("--no-sync") ||
  String(process.env["CONSOLE_TEE_SYNC"]).toLowerCase() === "false"
);
const logFile = new File(process.argv[2] || process.env["CONSOLE_TEE"] || "output.log", { sync });
const errFile = new File(process.argv[3] || process.env["CONSOLE_TEE_ERR"] || logFile.filename, {
  sync,
});

// // Patch process.stdout/stderr.write to tee output to files
// process.stdout.write = function writeTee() {
//   originalStdoutWrite.apply(process.stdout, arguments);
//   logFile.write(arguments);
// };

// process.stderr.write = function writeTee() {
//   originalStderrWrite.apply(process.stderr, arguments);
//   errFile.write(arguments);
// };

// Use console-interceptor to tee all console methods to files
consoleInterceptor((method, args, {swallow}) => {
  const msg = formatWithOptions({ depth: 10 }, ...args) + "\n";
  if (method === "error") {
    errFile.write(msg);
  } else {
    logFile.write(msg);
  }
  return swallow;
});

if (logFile.filename === errFile.filename) {
  console.log("console-tee:", logFile.filename);
} else {
  console.log("console-tee:", logFile.filename);
  console.log("console-tee (err):", errFile.filename);
}

process.on("beforeExit", () => {
  errFile.sync();
  logFile.sync();
});
