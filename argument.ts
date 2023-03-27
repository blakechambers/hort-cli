import { ArgTypes } from "./shared/types.ts";
import type { CB, InterfaceKeys } from "./shared/types.ts";
import { ensureBoolean, ensureNumber, ensureString } from "./shared/util.ts";
import { Directory } from "./shared/directory.ts";

class Argument<TParams> {
  name: InterfaceKeys<TParams>;
  type: ArgTypes;
  desc?: string;
  required?: boolean;

  constructor(
    type: ArgTypes,
    name: InterfaceKeys<TParams>,
  ) {
    this.type = type;
    this.name = name;
  }

  materializeAndEnsureValid(
    arg: string | number | boolean,
  ): string | number | boolean | Promise<Deno.FsFile> | Promise<Directory> {
    throw new Error("not implemented");
  }
}

class StringArgument<TParams> extends Argument<TParams> {
  constructor(
    name: InterfaceKeys<TParams>,
    proc?: CB<StringArgument<TParams>>,
  ) {
    super(ArgTypes.String, name);

    if (proc) proc(this);
  }

  materializeAndEnsureValid(
    arg: string | number | boolean,
  ): string {
    return ensureString(arg);
  }
}

class BooleanArgument<TParams> extends Argument<TParams> {
  constructor(
    name: InterfaceKeys<TParams>,
    proc?: CB<BooleanArgument<TParams>>,
  ) {
    super(ArgTypes.Boolean, name);

    if (proc) proc(this);
  }

  materializeAndEnsureValid(
    arg: string | number | boolean,
  ): boolean {
    return ensureBoolean(arg);
  }
}

class NumberArgument<TParams> extends Argument<TParams> {
  constructor(
    name: InterfaceKeys<TParams>,
    proc?: CB<NumberArgument<TParams>>,
  ) {
    super(ArgTypes.Number, name);

    if (proc) proc(this);
  }

  materializeAndEnsureValid(
    arg: string | number | boolean,
  ): number {
    return ensureNumber(arg);
  }
}

class EnumArgument<TParams> extends Argument<TParams> {
  enum: string[];

  constructor(
    name: InterfaceKeys<TParams>,
    proc?: CB<EnumArgument<TParams>>,
  ) {
    super(ArgTypes.Enum, name);
    this.enum = [];

    if (proc) proc(this);
  }

  materializeAndEnsureValid(
    arg: string | number | boolean,
  ): string {
    const argStr = ensureString(arg);
    if (!this.enum.includes(argStr)) {
      throw new Error(`Invalid enum value: ${argStr}`);
    }
    return argStr;
  }
}

class FileArgument<TParams> extends Argument<TParams> {
  allowNew: boolean;
  allowExisting: boolean;

  constructor(
    name: InterfaceKeys<TParams>,
    proc?: CB<FileArgument<TParams>>,
  ) {
    super(ArgTypes.File, name);
    this.allowNew = false;
    this.allowExisting = true;

    if (proc) proc(this);
  }

  async materializeAndEnsureValid(
    arg: string | number | boolean,
  ) {
    const value = ensureString(arg);

    if (!this.allowNew && !this.allowExisting) {
      throw new Error(
        `Invalid file configuration for argument "${String(this.name)}".`,
      );
    } else if (!this.allowNew && !Deno.statSync(value).isFile) {
      throw new Error(
        `Invalid file for argument "${
          String(this.name)
        }". File does not exist.`,
      );
    } else if (!this.allowExisting && Deno.statSync(value).isFile) {
      throw new Error(
        `Invalid file for argument "${
          String(this.name)
        }". File already exists.`,
      );
    }

    return await Deno.open(value);
  }
}

class DirectoryArgument<TParams> extends Argument<TParams> {
  allowNew: boolean;
  allowExisting: boolean;

  constructor(
    name: InterfaceKeys<TParams>,
    proc?: CB<DirectoryArgument<TParams>>,
  ) {
    super(ArgTypes.Directory, name);
    this.allowNew = false;
    this.allowExisting = true;

    if (proc) proc(this);
  }

  async materializeAndEnsureValid(
    arg: string | number | boolean,
  ) {
    const value = ensureString(arg);

    if (!this.allowNew && !this.allowExisting) {
      throw new Error(
        `Invalid directory configuration for argument "${String(this.name)}".`,
      );
    } else if (!this.allowNew && !Deno.statSync(value).isDirectory) {
      throw new Error(
        `Invalid directory for argument "${
          String(this.name)
        }". Directory does not exist.`,
      );
    } else if (!this.allowExisting && Deno.statSync(value).isDirectory) {
      throw new Error(
        `Invalid directory for argument "${
          String(this.name)
        }". Directory already exists.`,
      );
    }

    const ensureExists = this.allowExisting;

    return new Directory({ path: value, ensureExists });
  }
}

export {
  Argument,
  BooleanArgument,
  DirectoryArgument,
  EnumArgument,
  FileArgument,
  NumberArgument,
  StringArgument,
};
