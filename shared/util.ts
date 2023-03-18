import { ArgTypes } from "./types.ts";

function ensureString(arg: string | number | boolean): string {
  if (typeof arg !== "string") {
    throw new Error("Type error – requires a string");
  }

  return arg;
}

function ensureNumber(arg: string | number | boolean): number {
  if (typeof arg === "boolean") {
    throw new Error(
      "Type error – requires a number.",
    );
  } else if (typeof arg === "string") {
    const parsed = parseFloat(arg);
    if (isNaN(parsed)) {
      throw new Error(
        "Type error – requires a number.",
      );
    }

    return parsed;
  } else if (typeof arg === "number") {
    return arg;
  }

  throw new Error(
    "Type error – requires a number.",
  );
}

function ensureBoolean(arg: string | number | boolean): boolean {
  if (typeof arg === "boolean") {
    return arg;
  } else if (typeof arg === "string") {
    switch (arg.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "1": {
        return true;
      }
      case "0": {
        return false;
      }
      default: {
        break;
      }
    }
  } else if (typeof arg === "number") {
    switch (arg) {
      case 1: {
        return true;
      }
      case 0: {
        return false;
      }
      default: {
        break;
      }
    }
  }

  throw new Error(
    "Type error – requires a boolean. Only accepts values 'true', 'false', 1, or 0.",
  );
}

function exhaustiveEnumCheck(input: never): never {
  throw new Error(`Exhaustive check failed.`);
}

function materializeByArgType(
  argType: ArgTypes,
  cliInput: number | string | boolean,
): string | boolean | number {
  switch (argType) {
    case ArgTypes.String:
      return ensureString(cliInput);
    case ArgTypes.Boolean:
      return ensureBoolean(cliInput);
    case ArgTypes.Number:
      return ensureNumber(cliInput);
    case ArgTypes.Enum:
      return ensureString(cliInput);
    default:
      exhaustiveEnumCheck(argType);
  }
}

export { ensureBoolean, ensureNumber, ensureString, materializeByArgType };
