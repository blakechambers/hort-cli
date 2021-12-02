import { run } from "./runnerv2.ts";
import { parse } from "./deps.ts";

export { ArgTypes } from "./shared/types.ts";
import { buildTask, Task } from "./taskv2.ts";

async function main() {
  const { _: args, ...options } = parse(Deno.args);

  // const task = buildTask(topLevel, () => {});

  // await run({ task, args, options });
}

export { buildTask, main, Task };
