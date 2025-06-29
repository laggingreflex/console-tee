import fs, { createWriteStream } from "fs";
import { formatWithOptions } from "util";

const originalStdoutWrite = process.stdout.write;
const originalStderrWrite = process.stderr.write;

const logFile = new File(process.argv[2] || process.env["CONSOLE_TEE"] || "output.log");
const errFile = new File(process.argv[3] || process.env["CONSOLE_TEE_ERR"] || logFile.filename);

process.stdout.write = function writeTee() {
  originalStdoutWrite.apply(process.stdout, arguments);
  originalStderrWrite.apply(process.stderr, arguments);
  logFile.write(arguments);
};

process.stderr.write = function writeTee() {
  originalStderrWrite.apply(process.stderr, arguments);
  originalStdoutWrite.apply(process.stdout, arguments);
  logFile.write(arguments);
};

const simpleLoggers = ["log", "info", "warn", "error", "debug"];
simpleLoggers.forEach((method) => {
  const originalMethod = console[method];
  console[method] = function consoleTee(...args) {
    const msg = formatWithOptions({ depth: 10 }, ...args) + "\n";
    originalMethod.apply(console, args);
    if (method === "error") {
      errFile.write(msg);
    } else {
      logFile.write(msg);
    }
  };
});

if (logFile.filename === errFile.filename) {
  console.log("console-tee:", logFile.filename);
} else {
  console.log("console-tee:", logFile.filename);
  console.log("console-tee (err):", errFile.filename);
}

class File {
  constructor(filename) {
    this.filename = filename;
    this.fd = fs.openSync(this.filename, "a");
    this.file = createWriteStream(null, { fd: this.fd, flags: "a" });
  }
  write(args) {
    if (!args?.length) return;
    try {
      this.file.write.apply(this.file, [File.join(args)]);
    } catch (error) {
      console.error("Error writing to file:", error.message);
    }
    try {
      fs.fsyncSync(this.fd); // blocks until write hits disk
    } catch (error) {
      console.error("Error syncing file:", error.message);
    }
  }
  writeSync(args) {
    if (!args?.length) return;
    try {
      this.file.write.apply(this.file, [File.join(args)]);
    } catch (error) {
      console.error("Error writing to file:", error.message);
    }
    try {
      fs.fsyncSync(this.fd); // blocks until write hits disk
    } catch (error) {
      console.error("Error syncing file:", error.message);
    }
  }
  static join(array) {
    return Array.from(array)
      .flat(Infinity)
      .map((item) => formatWithOptions({ depth: 10 }, item))
      .join("");
  }
}
