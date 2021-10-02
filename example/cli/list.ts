import { Task } from "../../mod.ts";
import { ArgTypes } from "../../mod.ts";

interface ListOpts {
  foo: string;
  quiet: boolean;
}

function list({ foo, quiet }: ListOpts): void {
  if (!quiet) console.log("not being quiet");

  console.log("basically saying this is the command.  Out!");
}

const task = new Task<Parameters<typeof list>[0]>("list", (t) => {
  t.desc = "This is just a simple task to list things";

  t.addArgument("foo", (a) => {
    a.desc = "A required argument";
    a.required = true;

    a.type = ArgTypes.String;
  });

  t.addOption("quiet", (o) => {
    o.desc = "A required option";

    o.type = ArgTypes.Boolean;
    o.required = true;
  });
});

export default list;
export { task };
