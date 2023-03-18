import { ArgTypes } from "./shared/types.ts";
import type { CB, InterfaceKeys } from "./shared/types.ts";
import { ensureBoolean, ensureNumber, ensureString } from "./shared/util.ts";

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
  ): string | number | boolean {
    throw new Error("not implemented");
  }
}

class StringOption<TParams> extends Option<TParams> {
  constructor(name: InterfaceKeys<TParams>, proc?: CB<StringOption<TParams>>) {
    super(ArgTypes.String, name);

    if (proc) proc(this);
  }

  materializeAndEnsureValid(
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

  materializeAndEnsureValid(
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

  materializeAndEnsureValid(
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

  materializeAndEnsureValid(
    arg: string | number | boolean,
  ): string {
    const value = ensureString(arg);

    // `Invalid value for option "foo". Expected one of: bar, baz`
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

export { BooleanOption, EnumOption, NumberOption, Option, StringOption };
