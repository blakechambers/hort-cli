import { ArgTypes } from "./shared/types.ts";
import type { CB, InterfaceKeys } from "./shared/types.ts";
import { ensureBoolean, ensureNumber, ensureString } from "./shared/util.ts";
import { Directory } from "./shared/directory.ts";

class Option<TParams> {
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

class StringOption<TParams> extends Option<TParams> {
  constructor(name: InterfaceKeys<TParams>, proc?: CB<StringOption<TParams>>) {
    super(ArgTypes.String, name);

    if (proc) proc(this);
  }

  override materializeAndEnsureValid(
    arg: string | number | boolean,
  ): string {
    return ensureString(arg);
  }
}

class BooleanOption<TParams> extends Option<TParams> {
  constructor(name: InterfaceKeys<TParams>, proc?: CB<BooleanOption<TParams>>) {
    super(ArgTypes.Boolean, name);

    if (proc) proc(this);
  }

  override materializeAndEnsureValid(
    arg: string | number | boolean,
  ): boolean {
    return ensureBoolean(arg);
  }
}

class NumberOption<TParams> extends Option<TParams> {
  constructor(name: InterfaceKeys<TParams>, proc?: CB<NumberOption<TParams>>) {
    super(ArgTypes.Number, name);

    if (proc) proc(this);
  }

  override materializeAndEnsureValid(
    arg: string | number | boolean,
  ): number {
    return ensureNumber(arg);
  }
}

class EnumOption<TParams> extends Option<TParams> {
  values: string[];

  constructor(
    name: InterfaceKeys<TParams>,
    values: string[],
    proc?: CB<EnumOption<TParams>>,
  ) {
    super(ArgTypes.Enum, name);
    this.values = values;
    this.type = ArgTypes.Enum;

    if (proc) proc(this);
  }

  override materializeAndEnsureValid(
    arg: string | number | boolean,
  ): string {
    const value = ensureString(arg);

    if (!this.values.includes(value as string)) {
      throw new Error(
        `Invalid value for option "${String(this.name)}". Expected one of: ${
          this.values.join(", ")
        }`,
      );
    }

    return value;
  }
}

class FileOption<TParams> extends Option<TParams> {
  allowNew: boolean;
  allowExisting: boolean;

  constructor(
    name: InterfaceKeys<TParams>,
    proc?: CB<FileOption<TParams>>,
  ) {
    super(ArgTypes.File, name);
    this.allowNew = false;
    this.allowExisting = true;

    if (proc) proc(this);
  }

  override async materializeAndEnsureValid(
    arg: string | number | boolean,
  ) {
    const value = ensureString(arg);

    if (!this.allowNew && !this.allowExisting) {
      throw new Error(
        `Invalid file configuration for option "${String(this.name)}".`,
      );
    } else if (!this.allowNew && !Deno.statSync(value).isFile) {
      throw new Error(
        `Invalid file for option "${String(this.name)}". File does not exist.`,
      );
    } else if (!this.allowExisting && Deno.statSync(value).isFile) {
      throw new Error(
        `Invalid file for option "${String(this.name)}". File already exists.`,
      );
    }

    return await Deno.open(value);
  }
}

class DirectoryOption<TParams> extends Option<TParams> {
  // allowNew: boolean;
  allowExisting: boolean;

  constructor(
    name: InterfaceKeys<TParams>,
    proc?: CB<DirectoryOption<TParams>>,
  ) {
    super(ArgTypes.Directory, name);
    // this.allowNew = false;
    this.allowExisting = true;

    if (proc) proc(this);
  }

  override async materializeAndEnsureValid(
    arg: string | number | boolean,
  ) {
    const value = ensureString(arg);

    if (!this.allowExisting) {
      throw new Error(
        `Invalid directory configuration for option "${String(this.name)}".`,
      );
    } else if (!Deno.statSync(value).isDirectory) {
      throw new Error(
        `Invalid directory for option "${
          String(this.name)
        }". Directory does not exist.`,
      );
    }

    const ensureExists = this.allowExisting;

    return new Directory({ path: value, ensureExists });
  }
}

export {
  BooleanOption,
  DirectoryOption,
  EnumOption,
  FileOption,
  NumberOption,
  Option,
  StringOption,
};
