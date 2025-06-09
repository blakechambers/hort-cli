/*
  To run this example, run the following command:

      deno run example/simple.ts help
*/
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

  // adds an option.  this value would be specified as --quiet, --quiet=true,
  // --quiet=1, etc. Since this is `required=false`, it is optional. If you
  // wanted to make it required, you could set `required=true`.
  t.addOption("quiet", (o) => {
    o.desc = "Calms the greeting.  No need for all the spice!";
    o.required = false;
    o.type = ArgTypes.Boolean;
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
