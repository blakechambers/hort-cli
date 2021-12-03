import { materializeByArgType } from "./shared/util.ts";
import { formatBlockList } from "./deps.ts";
import type { Task } from "./taskv2.ts";
import type { Option } from "./option.ts";

interface RunOpts {
  task: Task<any>;
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

async function run(
  { task, args, options }: RunOpts,
): Promise<void> {
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

  if (task.subTasks.size > 0 && args.length > 0) {
    const [firstArg, ...remainingArgs] = args;

    if (typeof (firstArg) === "string") {
      const matchingSubtask = task.subTasks.get(firstArg);

      if (matchingSubtask) {
        return run({
          task: matchingSubtask,
          args: remainingArgs,
          options,
        });
      } else {
        console.log("the help message");
        // Deno.exit(0);
        return;
      }
    } else {
      throw new Error("panic");
    }
  }

  const namedThings: Record<string, unknown> = {};

  // await new Promise((resolve) => resolve(null));

  for (const [index, argument] of task.arguments.entries()) {
    const nonSymbolName = withoutSymbol(argument.name);

    if (args[index] || argument.required) {
      namedThings[nonSymbolName] = materializeByArgType(
        argument.type,
        args[index],
      );
    } else {
      namedThings[nonSymbolName] = undefined;
    }
  }

  for (const [name, option] of task.options.entries()) {
    const nonSymbolName = withoutSymbol(name);

    if (options[nonSymbolName] || option.required) {
      namedThings[nonSymbolName] = materializeByArgType(
        option.type,
        options[nonSymbolName],
      );
    } else {
      namedThings[nonSymbolName] = undefined;
    }
  }

  await task.call(namedThings);

  return;
}

function withoutSymbol(item: string | number | symbol): string | number {
  if (typeof (item) === "symbol") {
    return String(item);
  } else {
    return item;
  }
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
