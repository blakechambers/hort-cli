import { run } from "./runnerv2.ts";
import { parse } from "./deps.ts";

export { ArgTypes } from "./shared/types.ts";
import { buildTask, Task } from "./taskv2.ts";

async function main() {
  const { _: args, ...options } = parse(Deno.args);

  interface TopLevelOpts {
  }

  function topLevel({}: TopLevelOpts): void {
    console.log("basically saying this is the command.  Out!");
  }

  const task = buildTask(topLevel, () => {});

  await run<typeof task>({ task, args, options });
}

export { buildTask, main, Task };
