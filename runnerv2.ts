import { materializeByArgType } from "./shared/util.ts";
import { ensureString, formatBlockList } from "./deps.ts";
import type { Task } from "./taskv2.ts";
import type { Option } from "./option.ts";

interface RunOpts {
  task: Task<any>;
  args: (string | number)[];
  options: Record<string, string | number | boolean>;
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
  ].filter((x) => x).map((y) => y && y.trim()).join("\n\n") + "\n";
}

const commands = {
  "list": "list things",
};

function withQuotes<TValue = string>(
  str: TValue,
  index: number,
  arr: Array<TValue>,
): string {
  return `'${str}'`;
}

function commaDelimitedList(arr: Array<string>): string {
  if (arr.length === 0) {
    return "";
  } else if (arr.length === 1) {
    return arr[0];
  } else if (arr.length === 2) {
    return arr.join(" and ");
  } else {
    const leadingValues = arr.slice(0, -1);
    return `${leadingValues.join(", ")} and ${arr.slice(-1)[0]}`;
  }
}

async function run(
  { task, args, options }: RunOpts,
): Promise<void> {
  //   // prints command help message
  if (options.h || options.help || args[0] === "help") {
    console.log(buildHelpMessage({
      title: task.name,
      description: task.desc,
      optionsList: [...task.options].reduce(
        (sum, [name, option]) => ({ ...sum, [name]: option.desc }),
        {},
      ),
    }));

    return;
  }

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
        // Deno.exit(1);
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

  if (args.length > task.arguments.length) {
    const remainingArgs = args.slice(task.arguments.length);
    const formattedList = commaDelimitedList(
      remainingArgs.map(withQuotes),
    );

    throw new Error(
      `Argument error – unexpected argument(s) ${formattedList} provided`,
    );
  }

  const allExpectedKeys = [...task.options.keys()].map(withoutSymbol).map(
    ensureString,
  );
  const allProvidedKeys = Object.keys(options);

  const unexpectedKeys = allProvidedKeys.filter((value) =>
    !allExpectedKeys.includes(value)
  );

  if (unexpectedKeys.length > 0) {
    const formattedList = commaDelimitedList(
      unexpectedKeys.map(withQuotes),
    );

    throw new Error(
      `Argument error – unexpected options(s) ${formattedList} provided`,
    );
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
