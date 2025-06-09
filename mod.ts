import { run } from "./runner.ts";
import { parseArgs } from "./deps.ts";

export { ArgTypes } from "./shared/types.ts";
import { buildTask, Task } from "./task.ts";

async function main(task: Task<any>) {
  const { _: args, ...options } = parseArgs(Deno.args);

  await run({ task, args, options });
}

export { buildTask, main, run, Task };
