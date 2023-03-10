import { ensureString, materializeByArgType } from "./shared/util.ts";
import type { Task } from "./task.ts";
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

function displayTwoColumnList(
  list: Record<string, string>,
  spacing = "    ",
): string {
  const longestKey = Object.keys(list).reduce(
    (acc, current) => acc >= current.length ? acc : current.length,
    0,
  );

  return Object.entries(list).map(([name, desc]) => {
    return `${spacing}${name.padEnd(longestKey)}${spacing}${desc}`;
  })
    .join("\n");
}

function formatBlockList(
  title: string,
  list: Record<string, string>,
): string {
  return `${title}:
${displayTwoColumnList(list)}
`;
}

function buildHelpMessage(
  {
    title,
    description,
    // usageExamplesList,
    usageDescription,
    subCommandsList,
    optionsList,
  }: HelpMessageOpts,
): string {
  return [
    title,
    description,
    // usageExamplesList && formatBlockList("Usage", usageExamplesList),
    usageDescription,
    subCommandsList && Object.values(subCommandsList).length > 0 &&
    formatBlockList("Sub commands", subCommandsList),
    optionsList && Object.values(optionsList).length > 0 &&
    formatBlockList("Options", optionsList),
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

function displayHelpForTask(task: Task<unknown>): void {
  console.log(buildHelpMessage({
    title: task.name,
    description: task.desc,
    optionsList: [...task.options].reduce(
      (sum, [name, option]) => ({ ...sum, [name]: option.desc }),
      {},
    ),
    subCommandsList: [...task.subTasks].reduce(
      (sum, [name, option]) => ({ ...sum, [name]: option.desc }),
      {},
    ),
  }));
}

async function run(
  { task, args, options }: RunOpts,
): Promise<void> {
  if (task.subTasks.size > 0 && args.length > 0) {
    const [firstArg, ...remainingArgs] = args;

    if (args[0] === "help") {
      const [firstArg, ...remainingArgs] = args;

      return run({
        task,
        args: remainingArgs,
        options: {
          ...options,
          "h": true,
        },
      });
    }

    if (typeof (firstArg) === "string") {
      const matchingSubtask = task.subTasks.get(firstArg);

      if (matchingSubtask) {
        return run({
          task: matchingSubtask,
          args: remainingArgs,
          options,
        });
      } else {
        // console.log("the help message");
        displayHelpForTask(task);
        // Deno.exit(1);
        return;
      }
    } else {
      throw new Error("panic");
    }
  }

  //   // prints command help message
  if (options.h || options.help) {
    displayHelpForTask(task);

    return;
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
      `Argument error ??? unexpected argument(s) ${formattedList} provided`,
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
      `Argument error ??? unexpected options(s) ${formattedList} provided`,
    );
  }

  for (const [name, option] of task.options.entries()) {
    const nonSymbolName = withoutSymbol(name);

    if (
      Object.prototype.hasOwnProperty.call(options, nonSymbolName) ||
      option.required
    ) {
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

export { run };
