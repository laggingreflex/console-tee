import fs, { createWriteStream } from "fs";
import { formatWithOptions } from "util";

export default class File {
  constructor(filename, { sync = false } = {}) {
    this.filename = filename;
    this.fd = fs.openSync(this.filename, "a");
    this.file = createWriteStream(null, { fd: this.fd, flags: "a" });
    this.forceSync = sync;
  }
  write(args) {
    if (!args?.length) return;
    try {
      this.file.write.apply(this.file, [File.join(args)]);
    } catch (error) {
      console.error("Error writing to file:", error.message);
    }
    if (this.forceSync) {
      this.sync();
    }
  }
  writeSync(args) {
    if (!args?.length) return;
    try {
      this.file.write.apply(this.file, [File.join(args)]);
    } catch (error) {
      console.error("Error writing to file:", error.message);
    }
    this.sync();
  }
  sync() {
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
  get size() {
    return fs.fstatSync(this.fd).size;
  }
  noop() {}
}
