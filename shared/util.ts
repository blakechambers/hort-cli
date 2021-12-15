import { ensureString } from "../deps.ts";
import { ArgTypes } from "./types.ts";

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

function materializeByArgType(
  argType: ArgTypes,
  cliInput: number | string | boolean,
): string | boolean {
  switch (argType) {
    case ArgTypes.String:
      return ensureString(cliInput);
    case ArgTypes.Boolean:
      return ensureBoolean(cliInput);
    default:
      throw new Error(`unexpected ArgType=${argType}`);
  }
}

export { ensureBoolean, materializeByArgType };
