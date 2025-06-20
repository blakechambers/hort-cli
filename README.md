# hort-cli

A lightweight Deno command-line interface builder for creating custom CLI tools.

hort-cli is a Deno command-line tool interface tool. Similar to
[thor](http://whatisthor.com), hort's goal is to provide a small wrapper around
existing Deno functions – to make them accessible via the command line.

## Table of Contents

- [Introduction](#hort-cli)
- [Example](#example)
- [Motivation](#motivation)
- [Local Testing](#local-testing)
- [Roadmap](#roadmap)
  - [0.2.x Work Remaining](#02x-work-remaining)
  - [Ideas for the Future](#ideas-for-the-future)

## Example

```typescript
import { ArgTypes, buildTask, main } from "../mod.ts";

interface HelloOpts {
  name: string;
  quiet?: boolean;
}

// the function we are going to build a cli task for. In general, you would
// want to put this in a separate file, but this is just an example.  Note:
// this function uses named parameters which is what hort is built to support.
function helloWorld({ name, quiet }: HelloOpts): void {
  const punctuation = quiet ? "." : "!!!";

  console.log(`Hello, ${name}${punctuation}`);
}

// build the task
const task = buildTask(helloWorld, (t) => {
  // add the plain text description of what the task does.
  t.desc = "A simple hello world task. Nothing fancy here.";

  // an argument in this case is a required text param passed after the
  // command.  In this case, the name of the person to greet. Because this
  // is trying to demonstrate the functionality of the tool, this is
  // required.  If you wanted to make it optional, you could instead use
  // addOption.  See the next block for that.
  t.addArgument("name", ArgTypes.String, (a) => {
    a.desc = "Who should we say hello to?";
    a.required = true;
  });

  // adds an option.  this value would be specified as --quiet, --quiet=true,
  // --quiet=1, etc. Since this is `required=false`, it is optional. If you
  // wanted to make it required, you could set `required=true`.
  t.addOption("quiet", ArgTypes.Boolean, (o) => {
    o.desc = "Calms the greeting.  No need for all the spice!";
    o.required = false;
  });
});

export default helloWorld;
export { task };

// if this is the main module, run the task.  Ideally you wouldn't do this
// in a single file, but this is just an example.  Here, `main` is the function
// that bootstraps the cli processing.  It takes a task and runs it based on
// the parameters.  If the values specified are invalid, it will print out the
// help text (also can be found using `--help`). If the values are valid, it
// will run the task.
if (import.meta.main) {
  main(task);
}
```

This example lives in `example/simple.ts`. From the repository root you can run:

```
% deno run example/simple.ts Person
Hello, Person!!!
% deno run example/simple.ts Person --quiet
Hello, Person.
% deno run example/simple.ts
error: Uncaught (in promise) Error: Type error – requires a string
    throw new Error("Type error – requires a string");
          ^ [...]
```

Additionally, hort supports help text output:

```
% deno run example/simple.ts --help
helloWorld

A simple hello world task. Nothing fancy here.

Arguments

    <name>  Who should we say hello to?

Options

    --quiet  Calms the greeting.  No need for all the spice!
```

Beyond what's shown in this example, hort supports nesting tasks and building
tasks from a directory. The `example/cli.ts` script demonstrates subcommands:

```typescript
import { main, Task } from "../mod.ts";
import { task as listTask } from "./cli/list.ts";
import { task as catTask } from "./cli/cat.ts";

if (import.meta.main) {
  const t = new Task("Pom", undefined, (t) => {
    t.desc = "A simple example wrapper for Hort CLI";
    t.addSubTask(listTask);
    t.addSubTask(catTask);
  });

  main(t);
}
```

Try it out with:

```bash
deno run example/cli.ts list foo
deno run --allow-read example/cli.ts cat example/cli/cat.ts
```

## Motivation

I created hort-cli to simplify my local tooling while exploring Deno. It's
likely not what you're looking for (maybe [cliffy](https://cliffy.io) would be
better and more stable for now).

As mentioned above, thor's ability to build and support more complex CLI use
cases is something that I've enjoyed. This tool hopefully helps to support that.

## Local testing

```
deno test
```

