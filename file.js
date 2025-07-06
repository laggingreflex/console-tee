import fs, { createWriteStream } from "fs";
import { formatWithOptions } from "util";

export default class File {
  constructor(filename, { sync = false } = {}) {
    this.filename = filename;
    try {
      this.fd = fs.openSync(this.filename, "a");
      this.file = createWriteStream(null, { fd: this.fd, flags: "a" });
    } catch (error) {
      console.error("Error opening file:", error.message);
      this.disabled = true;
    }
    this.forceSync = sync;
  }
  write(args) {
    if (this.disabled) return;
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
    if (this.disabled) return;
    if (!args?.length) return;
    try {
      this.file.write.apply(this.file, [File.join(args)]);
    } catch (error) {
      console.error("Error writing to file:", error.message);
    }
    this.sync();
  }
  sync() {
    if (this.disabled) return;
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
    if (this.disabled) return -Infinity;
    return fs.fstatSync(this.fd).size;
  }
  noop() {}
}
