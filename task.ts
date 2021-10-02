import type { CB } from "./shared/types.ts";
import { Argument } from "./argument.ts";
import { Option } from "./option.ts";

class Task<TParams> {
  name: string;
  desc?: string;
  arguments: Array<Argument<TParams>>;
  options: Map<keyof TParams, Option<TParams>>;

  constructor(name: string, proc: CB<Task<TParams>>) {
    this.name = name;
    this.arguments = [];
    this.options = new Map<keyof TParams, Option<TParams>>();

    proc(this);
  }

  addArgument(name: keyof TParams, proc: CB<Argument<TParams>>) {
    this.ensurePriorArgumentsAreRequired();

    this.arguments.push(new Argument<TParams>(name, proc));
  }

  addOption(name: keyof TParams, proc: CB<Option<TParams>>) {
    this.options.set(name, new Option<TParams>(name, proc));
  }

  private ensurePriorArgumentsAreRequired() {
    const allPriorArgsAreRequired = this.arguments.every((a) => a.required);

    if (!allPriorArgsAreRequired) {
      throw new Error("all prior args must be required");
    }
  }
}

export { Task };
