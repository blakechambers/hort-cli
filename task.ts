import type { CB } from "./shared/types.ts";
import { ArgTypes } from "./shared/types.ts";
import {
  Argument,
  BooleanArgument,
  EnumArgument,
  NumberArgument,
  StringArgument,
} from "./argument.ts";
import {
  BooleanOption,
  EnumOption,
  NumberOption,
  Option,
  StringOption,
} from "./option.ts";

type BaseFunc = (...args: any) => void;
type FuncParams<TFunc extends BaseFunc> = Parameters<TFunc>[0];

interface Func<TFunc extends BaseFunc> {
  (task: Task<Parameters<TFunc>[0]>): Awaited<ReturnType<TFunc>>;
}

function buildTask<TFunc extends BaseFunc>(
  func: TFunc,
  cb: Func<TFunc>,
): Task<Parameters<TFunc>[0]> {
  return new Task<FuncParams<typeof func>>(func.name, func, cb);
}

class Task<TParams> {
  name: string;
  func: ((args: TParams) => void) | undefined;
  desc?: string;
  arguments: Array<Argument<TParams>>;
  options: Map<keyof TParams, Option<TParams>>;
  subTasks: Map<string, Task<any>>;

  constructor(
    name: string,
    func: ((args: TParams) => void) | undefined,
    proc: CB<Task<TParams>>,
  ) {
    this.name = name;
    this.func = func;
    this.arguments = [];
    this.options = new Map<keyof TParams, Option<TParams>>();
    this.subTasks = new Map<string, Task<any>>();

    proc(this);
  }

  call(args: TParams): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.func) {
          throw new Error("cannot call func when undefined");
        }

        this.func(args);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  // addArgument(name: keyof TParams, proc: CB<Argument<TParams>>) {
  //   this.ensurePriorArgumentsAreRequired();

  //   this.arguments.push(new Argument<TParams>(name, proc));
  // }

  // addArgument similar to above, but using a type flow similar to addOption
  addArgument(
    name: keyof TParams,
    type: ArgTypes.String,
    proc: CB<StringArgument<TParams>>,
  ): void;
  addArgument(
    name: keyof TParams,
    type: ArgTypes.Boolean,
    proc: CB<BooleanArgument<TParams>>,
  ): void;
  addArgument(
    name: keyof TParams,
    type: ArgTypes.Number,
    proc: CB<NumberArgument<TParams>>,
  ): void;
  addArgument(
    name: keyof TParams,
    type: ArgTypes.Enum,
    proc: CB<EnumArgument<TParams>>,
  ): void;
  addArgument(
    name: keyof TParams,
    type: ArgTypes,
    proc: unknown,
  ): void {
    this.ensurePriorArgumentsAreRequired();

    switch (type) {
      case ArgTypes.String:
        this.arguments.push(
          new StringArgument<TParams>(
            name,
            proc as CB<StringArgument<TParams>>,
          ),
        );
        break;
      case ArgTypes.Boolean:
        this.arguments.push(
          new BooleanArgument<TParams>(
            name,
            proc as CB<BooleanArgument<TParams>>,
          ),
        );
        break;
      case ArgTypes.Number:
        this.arguments.push(
          new NumberArgument<TParams>(
            name,
            proc as CB<NumberArgument<TParams>>,
          ),
        );
        break;
      case ArgTypes.Enum:
        this.arguments.push(
          new EnumArgument<TParams>(
            name,
            proc as CB<EnumArgument<TParams>>,
          ),
        );
        break;
      default:
        throw new Error("unknown argument type");
    }
  }

  addOption(
    name: keyof TParams,
    type: ArgTypes.String,
    proc: CB<StringOption<TParams>>,
  ): void;
  addOption(
    name: keyof TParams,
    type: ArgTypes.Boolean,
    proc: CB<BooleanOption<TParams>>,
  ): void;
  addOption(
    name: keyof TParams,
    type: ArgTypes.Number,
    proc: CB<NumberOption<TParams>>,
  ): void;
  addOption(
    name: keyof TParams,
    type: ArgTypes.Enum,
    proc: CB<EnumOption<TParams>>,
  ): void;
  addOption(
    name: keyof TParams,
    type: ArgTypes,
    proc: unknown,
  ): void {
    switch (type) {
      case ArgTypes.String:
        this.options.set(
          name,
          new StringOption<TParams>(name, proc as CB<StringOption<TParams>>),
        );
        break;
      case ArgTypes.Boolean:
        this.options.set(
          name,
          new BooleanOption<TParams>(name, proc as CB<BooleanOption<TParams>>),
        );
        break;
      case ArgTypes.Number:
        this.options.set(
          name,
          new NumberOption<TParams>(name, proc as CB<NumberOption<TParams>>),
        );
        break;
      case ArgTypes.Enum:
        this.options.set(
          name,
          new EnumOption<TParams>(name, [], proc as CB<EnumOption<TParams>>),
        );
        break;
      default:
        throw new Error("invalid type");
    }
  }

  addSubTask<TSubTaskParams>(task: Task<TSubTaskParams>) {
    this.subTasks.set(task.name, task);
  }

  private ensurePriorArgumentsAreRequired() {
    const allPriorArgsAreRequired = this.arguments.every((a) => a.required);

    if (!allPriorArgsAreRequired) {
      throw new Error("all prior args must be required");
    }
  }
}

export { buildTask, Task };
