import { ensureString } from "./shared/util.ts";
import { Block, MultiColumnLayoutBlock } from "./deps.ts";
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

// function displayTwoColumnList(
//   list: Record<string, string>,
//   spacing = "    ",
// ): string {
//   const longestKey = Object.keys(list).reduce(
//     (acc, current) => acc >= current.length ? acc : current.length,
//     0,
//   );

//   return Object.entries(list).map(([name, desc]) => {
//     return `${spacing}${name.padEnd(longestKey)}${spacing}${desc}`;
//   })
//     .join("\n");
// }

// function formatBlockList(
//   title: string,
//   list: Record<string, string>,
// ): string {
//   return `${title}:
// ${displayTwoColumnList(list)}
// `;
// }

// function buildHelpMessage(
//   {
//     title,
//     description,
//     // usageExamplesList,
//     usageDescription,
//     subCommandsList,
//     optionsList,
//   }: HelpMessageOpts,
// ): string {
//   return [
//     title,
//     description,
//     // usageExamplesList && formatBlockList("Usage", usageExamplesList),
//     usageDescription,
//     subCommandsList && Object.values(subCommandsList).length > 0 &&
//     formatBlockList("Sub commands", subCommandsList),
//     optionsList && Object.values(optionsList).length > 0 &&
//     formatBlockList("Options", optionsList),
//   ].filter((x) => x).map((y) => y && y.trim()).join("\n\n") + "\n";
// }

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
  const paddingX = 2;
  const paddingY = 1;

  const titleBlock = new Block(title, {
    paddingLeft: paddingX,
    paddingRight: paddingX,
    paddingTop: paddingY,
    // paddingBottom: paddingY, // let next block handle this
  });

  const descriptionBlock = new Block(description, {
    paddingLeft: paddingX,
    paddingRight: paddingX,
    paddingTop: paddingY,
    // paddingBottom: paddingY, // let next block handle this
  });

  const usageDescriptionBlock = new Block(usageDescription, {
    paddingLeft: paddingX,
    paddingRight: paddingX,
    paddingTop: paddingY,
    // paddingBottom: paddingY, // let next block handle this
  });

  const subCommandsBlock = new MultiColumnLayoutBlock(
    Object.entries(subCommandsList ?? {}).map(([name, desc]) => {
      return [name, desc];
    }),
    {
      paddingLeft: paddingX,
      paddingRight: paddingX,
      paddingTop: paddingY,
      // paddingBottom: paddingY, // let next block handle this
    },
  );

  const optionsBlock = new MultiColumnLayoutBlock(
    Object.entries(optionsList ?? {}).map(([name, desc]) => {
      return [name, desc];
    }),
    {
      paddingLeft: paddingX,
      paddingRight: paddingX,
      paddingTop: paddingY,
      // paddingBottom: paddingY, // let next block handle this
    },
  );

  const blocks = [
    titleBlock,
    descriptionBlock,
    usageDescriptionBlock,
    subCommandsBlock,
    optionsBlock,
  ];

  const { columns: width, rows: height } = Deno.consoleSize();

  blocks.forEach((block) => {
    console.log(block.render(width));
  });
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
        displayHelpForTask(task);
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

  for (const [index, argument] of task.arguments.entries()) {
    const nonSymbolName = withoutSymbol(argument.name);

    if (args[index] || argument.required) {
      const val = argument.materializeAndEnsureValid(
        args[index],
      );

      namedThings[nonSymbolName] = await val;
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

  // load options into namedThings based on the task's options list and requirement.
  for (const [name, option] of task.options.entries()) {
    const nonSymbolName = withoutSymbol(name);

    if (
      Object.prototype.hasOwnProperty.call(options, nonSymbolName) ||
      option.required
    ) {
      const val = option.materializeAndEnsureValid(
        options[nonSymbolName],
      );

      // await val if its a promise
      namedThings[nonSymbolName] = await val;
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
