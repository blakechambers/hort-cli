import type { CB } from "./shared/types.ts";
import { Argument } from "./argument.ts";
import { Option } from "./option.ts";

type BaseFunc = (...args: any) => void;
type FuncParams<TFunc extends BaseFunc> = Parameters<TFunc>[0];

interface Func<TFunc extends BaseFunc> {
  (task: Task<Parameters<TFunc>[0]>): ReturnType<TFunc>;
}

function buildTask<TFunc extends BaseFunc>(
  func: TFunc,
  cb: Func<TFunc>,
): Task<Parameters<TFunc>[0]> {
  return new Task<FuncParams<typeof func>>(func.name, cb);
}

class Task<TParams> {
  name: string;
  desc?: string;
  arguments: Array<Argument<TParams>>;
  options: Map<keyof TParams, Option<TParams>>;
  subTasks: Map<string, Task<any>>;

  constructor(name: string, proc: CB<Task<TParams>>) {
    this.name = name;
    this.arguments = [];
    this.options = new Map<keyof TParams, Option<TParams>>();
    this.subTasks = new Map<string, Task<any>>();

    proc(this);
  }

  addArgument(name: keyof TParams, proc: CB<Argument<TParams>>) {
    this.ensurePriorArgumentsAreRequired();

    this.arguments.push(new Argument<TParams>(name, proc));
  }

  addOption(name: keyof TParams, proc: CB<Option<TParams>>) {
    this.options.set(name, new Option<TParams>(name, proc));
  }

  addSubTask(task: Task<any>) {
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
