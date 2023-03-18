import { ArgTypes } from "./shared/types.ts";
import type { CB, InterfaceKeys } from "./shared/types.ts";
import { ensureBoolean, ensureNumber, ensureString } from "./shared/util.ts";

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
  ): string | number | boolean {
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

export {
  Argument,
  BooleanArgument,
  EnumArgument,
  NumberArgument,
  StringArgument,
};
