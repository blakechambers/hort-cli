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
  argumentsList?: Record<string, string>;
}

enum SystemMessages {
  DescriptionNotProvided = "[No description provided]",
}

// adds a block at the top for title then rows of 2 columns blocks
function titledList(
  title: string,
  list: Record<string, string>,
  paddingX: number,
  paddingY: number,
): Block[] {
  const blocks: Block[] = [];

  const indentSize = paddingX * 2;

  blocks.push(
    new Block(title, {
      paddingLeft: paddingX,
      paddingRight: paddingX,
      paddingTop: paddingY,
      paddingBottom: paddingY,
    }),
  );

  // find largest key length and use that as the fixed width for the left column
  const fixedLeftColumnWidth = Math.max(
    ...Object.keys(list).map((key) => key.length),
  );

  Object.entries(list).forEach(([name, desc]) => {
    const keyBlock = new Block(name, {
      width: fixedLeftColumnWidth,
    });

    const valueBlock = new Block(desc);

    blocks.push(
      new MultiColumnLayoutBlock(
        {
          blocks: [keyBlock, valueBlock],
          marginX: paddingX,
          paddingLeft: paddingX + indentSize,
          paddingRight: paddingX,
          // paddingBottom: paddingY, // let next block handle this
        },
      ),
    );
  });

  return blocks;
}

function outputHelpMessage(
  {
    title,
    description,
    usageDescription,
    subCommandsList,
    optionsList,
    argumentsList,
  }: HelpMessageOpts,
): void {
  const paddingX = 2;
  const paddingY = 1;

  let blocks: Block[] = [];

  blocks.push(
    new Block(title, {
      paddingLeft: paddingX,
      paddingRight: paddingX,
      paddingTop: paddingY,
      // paddingBottom: paddingY, // let next block handle this
    }),
  );

  if (description) {
    blocks.push(
      new Block(description, {
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        // paddingBottom: paddingY, // let next block handle this
      }),
    );
  }

  if (usageDescription) {
    blocks.push(
      new Block(usageDescription, {
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        // paddingBottom: paddingY, // let next block handle this
      }),
    );
  }

  if (subCommandsList && Object.values(subCommandsList).length > 0) {
    blocks = blocks.concat(titledList(
      "Sub commands",
      subCommandsList,
      paddingX,
      paddingY,
    ));
  }

  if (argumentsList && Object.values(argumentsList).length > 0) {
    blocks = blocks.concat(titledList(
      "Arguments",
      argumentsList,
      paddingX,
      paddingY,
    ));
  }

  if (optionsList && Object.values(optionsList).length > 0) {
    blocks = blocks.concat(titledList(
      "Options",
      optionsList,
      paddingX,
      paddingY,
    ));
  }

  let width: number = 120;

  // some terminals or runtimes don't provide this, so consoleSize errors.  In those cases, default to the width above.
  try {
    const { columns } = Deno.consoleSize();
    width = columns;
  } catch (e) {
    // ignore
  }

  let lines: string[] = [];
  blocks.forEach((block) => {
    const iter = block.render(width);

    for (const line of iter) {
      lines.push(line.trimEnd());
    }
  });

  // add a blank line at the end.  later this is fixed by a Stack component in the format package.
  lines.push("");

  console.log(lines.join("\n"));
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
  const title = task.name;
  const description = task.desc;

  const optionsList: Record<string, string> = [...task.options].reduce<
    Record<string, string>
  >(
    (sum, [name, option]) => ({
      ...sum,
      [`--${name}`]: option.desc || SystemMessages.DescriptionNotProvided,
    }),
    {},
  );

  const argumentsList: Record<string, string> = [...task.arguments].reduce<
    Record<string, string>
  >(
    (sum, argument) => ({
      ...sum,
      [`<${argument.name}>`]: argument.desc ||
        SystemMessages.DescriptionNotProvided,
    }),
    {},
  );

  const subCommandsList: Record<string, string> = [...task.subTasks].reduce<
    Record<string, string>
  >(
    (sum, [name, option]) => ({
      ...sum,
      [name]: option.desc || SystemMessages.DescriptionNotProvided,
    }),
    {},
  );

  outputHelpMessage({
    title,
    description,
    optionsList,
    subCommandsList,
    argumentsList,
  });
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
      try {
        namedThings[nonSymbolName] = await argument.materializeAndEnsureValid(
          args[index],
        );
      } catch (error) {
        throw error;
      }
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
      try {
        namedThings[nonSymbolName] = await option.materializeAndEnsureValid(
          options[nonSymbolName],
        );
      } catch (error) {
        throw error;
      }
    } else {
      namedThings[nonSymbolName] = undefined;
    }
  }

  try {
    await task.call(namedThings);
  } catch (error) {
    throw error;
  }

  return;
}

function withoutSymbol(item: string | number | symbol): string | number {
  if (typeof (item) === "symbol") {
    return String(item);
  } else {
    return item;
  }
}

export { run, SystemMessages };
