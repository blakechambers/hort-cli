import { parse } from "./deps.ts";
import { materializeByArgType } from "./shared/util.ts";
import { formatBlockList } from "./deps.ts";
import type { Task } from "./task.ts";
import type { Option } from "./option.ts";

interface RunOpts {
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

interface TasklikeThing<TParams> {
  task: Task<TParams>;
}

const commands = {
  "list": "list things",
};

async function run({ args, options }: RunOpts) {
  // prints help message when the command not found
  if (!(args.length > 0 && args[0] in { ...commands, help: "true" })) {
    console.log("[main help message]");
    Deno.exit(0);
  }

  const [commandArg, ...remainingOptions] = args;

  if (commandArg === "help") {
    await run({
      args: remainingOptions,
      options: { ...options, help: "true" },
    });
    return;
  }

  const { default: task, task: config } = await import(
    `./example/cli/${commandArg}.ts`
  );

  const namedThings: Record<string, unknown> = {};

  // prints command help message
  if (options.h || options.help) {
    const task: Task<Parameters<typeof config>[0]> = config;

    console.log(buildHelpMessage({
      title: task.name,
      description: task.desc,
      optionsList: [...task.options].reduce(
        (sum, [name, option]) => ({ ...sum, [name]: option.desc }),
        {},
      ),
    }));
    Deno.exit(0);
    return;
  }

  for (const [index, argument] of config.arguments.entries()) {
    namedThings[argument.name] = materializeByArgType(
      argument.type,
      args[index],
    );
  }

  for (const [name, option] of config.options.entries()) {
    namedThings[name] = materializeByArgType(option.type, options[name]);
  }

  task(namedThings as unknown as Parameters<typeof task>[0]);
}

async function main() {
  const { _: args, ...options } = parse(Deno.args);

  await run({ args, options });
}

export { main };
