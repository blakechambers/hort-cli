import { ArgTypes, buildTask } from "../../mod.ts";

interface ListOpts {
  foo: string;
  quiet: boolean;
}

function list({ foo, quiet }: ListOpts): void {
  if (!quiet) console.log("not being quiet");

  console.log("basically saying this is the command.  Out!");
}

const task = buildTask(list, (t) => {
  t.desc = "This is just a simple task to list things";

  t.addArgument("foo", ArgTypes.String, (a) => {
    a.desc = "A required argument";
    a.required = true;
  });

  t.addOption("quiet", ArgTypes.Boolean, (o) => {
    o.desc = "decrease the output text";
    o.required = false;
  });
});

export default list;
export { task };
