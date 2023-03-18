# hort-cli

hort-cli is a deno commandline tool interface tool. Similar to
[thor](http://whatisthor.com), hort's goal is to provide a small wrapper around
existing deno functions – to make them accessible via the commandline.

Here's a simple example:

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
  t.addArgument("name", (a) => {
    a.desc = "Who should we say hello to?";
    a.required = true;
    a.type = ArgTypes.String;
  });

  // adds an option.  this value would be specificed as --quiet, --quiet=true,
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

Assuming this is stored in `simple.ts`, from cli you can run:

```
% deno run simple.ts Person
Hello, Person!!!
% deno run simple.ts Person --quiet
Hello, Person.
% deno run simple.ts
error: Uncaught (in promise) Error: Type error – requires a string
    throw new Error("Type error – requires a string");
          ^ [...]
```

Additionally, hort supports help text output:

```
% deno run simple.ts --help
helloWorld

A simple hello world task. Nothing fancy here.

Options:
    quiet    Calms the greeting.  No need for all the spice!
```

Beyond what's shown in this example, hort supports nesting tasks and building
tasks from a directory (see [examples](./examples)).

### Why

I made hort tool to help similify my local tooling as I was exploring deno. It's
likely not what you're looking for (maybe [cliffy](https://cliffy.io) would be
better and more stable for now).

As mentioned above, thors ability to build and support more complex CLI use
cases is something that I've enjoyed. This tool hopefully helps to support that.

### Local testing

```
deno test
```

### Ideas for the future

- In addition to `ArgTypes.String` and `ArgTypes.Boolean`, add:
  - a file based path. This would be similar to string, but would validate the
    files presence.
- better formatting for arguments. Currently, the output doesn't display them.
- aliasing of options.
- testing around help text output scenarios.
- support a top level stdin full and stdin piped arg type
- support both async and non async functions
- support adding aliases for option params
- refactor the help message formatting to be a separate repo
- create an alternate DSL that uses typescript decorators and a class based API
- formalize error classes
