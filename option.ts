import { ArgTypes } from "./shared/types.ts";
import type { CB, InterfaceKeys } from "./shared/types.ts";
import { materializeByArgType } from "./shared/util.ts";

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
    return materializeByArgType(this.type, arg);
  }
}

class StringOption<TParams> extends Option<TParams> {
  constructor(name: InterfaceKeys<TParams>, proc?: CB<StringOption<TParams>>) {
    super(ArgTypes.String, name);

    if (proc) proc(this);
  }
}

class BooleanOption<TParams> extends Option<TParams> {
  constructor(name: InterfaceKeys<TParams>, proc?: CB<BooleanOption<TParams>>) {
    super(ArgTypes.Boolean, name);

    if (proc) proc(this);
  }
}

class NumberOption<TParams> extends Option<TParams> {
  constructor(name: InterfaceKeys<TParams>, proc?: CB<NumberOption<TParams>>) {
    super(ArgTypes.Number, name);

    if (proc) proc(this);
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
  ): string | number | boolean {
    super.materializeAndEnsureValid(arg);

    if (!this.values.includes(arg as string)) {
      throw new Error(
        `Invalid value for option ${String(this.name)}. Valid values are: ${
          this.values.join(", ")
        }`,
      );
    }

    return arg;
  }
}

export { BooleanOption, EnumOption, NumberOption, Option, StringOption };
