import { materializeByArgType } from "./shared/util.ts";
import { formatBlockList } from "./deps.ts";
import type { Task } from "./taskv2.ts";
import type { Option } from "./option.ts";

interface RunOpts<TTask> {
  task: TTask;
  args: (string | number)[];
  options: Record<string, string | number>;
}

interface HelpMessageOpts {
  title: string;
  description?: string;
  usageExamplesList?: Record<string, string>;
  usageDescription?: string;
  subCommandsList?: Record<string, string>;
  optionsList?: Record<string, string>;
}

function buildHelpMessage(
  {
    title,
    description,
    // usageExamplesList,
    // usageDescription,
    // subCommandsList,
    optionsList,
  }: HelpMessageOpts,
): string {
  return [
    title,
    description,
    // usageExamplesList && formatBlockList("Usage", usageExamplesList),
    // usageDescription,
    // subCommandsList && formatBlockList("Commands", subCommandsList),
    optionsList && formatBlockList("Options", optionsList),
  ].filter((x) => x).map((y) => y && y.trim()).join("\n\n");
}

const commands = {
  "list": "list things",
};

async function run<TTask>({ task, args, options }: RunOpts<TTask>) {
  //   // prints command help message
  //   if (options.h || options.help) {
  //     const task: Task<Parameters<typeof config>[0]> = config;

  //     console.log(buildHelpMessage({
  //       title: task.name,
  //       description: task.desc,
  //       optionsList: [...task.options].reduce(
  //         (sum, [name, option]) => ({ ...sum, [name]: option.desc }),
  //         {},
  //       ),
  //     }));
  //     Deno.exit(0);
  //     return;
  //   }

  //   const namedThings: Record<string, unknown> = {};

  //   for (const [index, argument] of config.arguments.entries()) {
  //     namedThings[argument.name] = materializeByArgType(
  //       argument.type,
  //       args[index],
  //     );
  //   }

  //   for (const [name, option] of config.options.entries()) {
  //     namedThings[name] = materializeByArgType(option.type, options[name]);
  //   }

  //   task(namedThings as unknown as Parameters<typeof task>[0]);
}

type CLIInput = number | string;

interface MountOpts {
  args: [CLIInput, ...Array<CLIInput>];
  options: Record<string, CLIInput>;
}

// async function mount({ args, options }: MountOpts) {
//   // prints help message when the command not found
//   if (!(args.length > 0 && args[0] in { ...commands, help: "true" })) {
//     console.log("[main help message]");
//     Deno.exit(0);
//   }

//   const [commandArg, ...remainingArgs] = args;

//   if (commandArg === "help") {
//     await run({
//       task:
//       args: remainingOptions,
//       options: { ...options, help: "true" },
//     });
//     return;
//   }

//   const { default: task, task: config } = await import(
//     `./example/cli/${commandArg}.ts`
//   );
// }

export { run };
