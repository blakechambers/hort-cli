interface DirectoryConstructOptions {
  path: string;
  ensureExists?: boolean; // default: false
}

class Directory {
  public path: string;
  public ensureExists: boolean; // default: false

  constructor(options: DirectoryConstructOptions) {
    this.path = options.path;
    this.ensureExists = options.ensureExists || false;
  }

  async validate(): Promise<void> {
    // verify the directory exists
    if (this.ensureExists) {
      const exists = await this.exists();
      if (!exists) {
        throw new Error(`directory does not exist: ${this.path}`);
      }
    }

    return;
  }

  // verify the directory exists
  async exists(): Promise<boolean> {
    try {
      const info = await Deno.stat(this.path);
      return info.isDirectory;
    } catch (e) {
      if (e instanceof Deno.errors.NotFound) {
        return false;
      } else {
        throw e;
      }
    }
  }
}

export { Directory };
