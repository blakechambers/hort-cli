import { assertEquals } from "./test_deps.ts";
import { ArgTypes, buildTask, Task } from "./modv2.ts";

const { test } = Deno;

test({
  name: "[V2] new Task() – valid arguments",
  fn: () => {
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

    assertEquals(task.name, "list");

    const taskArguments = task.arguments;
    assertEquals(taskArguments.length, 1);

    const fooArg = taskArguments[0];
    assertEquals(fooArg.name, "foo");
    assertEquals(fooArg.required, true);
    assertEquals(fooArg.type, ArgTypes.String);

    const taskOptions = task.options;
    // returns an iterator instead
    assertEquals([...taskOptions.keys()], ["quiet"]);

    const quietOpt = taskOptions.get("quiet");
    if (quietOpt === undefined) throw new Error("panic");

    assertEquals(quietOpt.name, "quiet");
  },
});

test({
  name: "[V2] runner",
  fn: () => {
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
  },
});
