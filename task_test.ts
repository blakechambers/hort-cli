import { assertEquals, assertThrows } from "./test_deps.ts";
import { buildTask, Task } from "./task.ts";
import { ArgTypes } from "./mod.ts";

const { test } = Deno;

test({
  name: "buildTask() – valid arguments",
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
    assertEquals(Array.from(taskOptions.keys()), ["quiet"]);

    const quietOpt = taskOptions.get("quiet");
    if (quietOpt === undefined) throw new Error("panic");

    assertEquals(quietOpt.name, "quiet");
  },
});

test({
  name: "new Task() – valid arguments",
  fn: () => {
    interface ListOpts {
      foo: string;
      quiet: boolean;
    }

    function list({ foo, quiet }: ListOpts): void {
      if (!quiet) console.log("not being quiet");

      console.log("basically saying this is the command.  Out!");
    }

    const task = new Task<Parameters<typeof list>[0]>(list.name, list, (t) => {
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
    assertEquals(Array.from(taskOptions.keys()), ["quiet"]);

    const quietOpt = taskOptions.get("quiet");
    if (quietOpt === undefined) throw new Error("panic");

    assertEquals(quietOpt.name, "quiet");
  },
});

test({
  name: "new Task() – subTasks",
  fn: () => {
    interface ListOpts {
      quiet: boolean;
    }

    function child({ quiet }: ListOpts): void {
    }

    const childTask = new Task<Parameters<typeof child>[0]>(
      child.name,
      child,
      (t) => {
        t.addOption("quiet", (o) => {
          o.desc = "A required option";

          o.type = ArgTypes.Boolean;
          o.required = true;
        });
      },
    );

    const task = new Task<Record<string, unknown>>("parent", undefined, (t) => {
      t.addSubTask(childTask);
    });

    assertEquals(task.name, "parent");

    const subTasks = task.subTasks;
    assertEquals([...subTasks.keys()], ["child"]);

    const childSubTask = subTasks.get("child");
    if (childSubTask === undefined) throw new Error("panic");

    assertEquals(childSubTask.name, "child");

    const childOptions = childSubTask.options;
    // returns an iterator instead
    assertEquals(Array.from(childOptions.keys()), ["quiet"]);

    const quietOpt = childOptions.get("quiet");
    if (quietOpt === undefined) throw new Error("panic");

    assertEquals(quietOpt.name, "quiet");
  },
});

test({
  name: "Task() – arguments required: false must come at the end",
  fn: () => {
    interface ListOpts {
      foo: string;
      bar: string;
    }

    function list({ foo, bar }: ListOpts): void {
    }

    buildTask(list, (t) => {
      assertThrows(
        () => {
          t.desc = "This is just a simple task to list things";

          t.addArgument("foo", (a) => {
            a.desc = "A required argument";
            a.required = false;

            a.type = ArgTypes.String;
          });

          t.addArgument("foo", (a) => {
            a.desc = "A required argument";
            a.required = true;

            a.type = ArgTypes.String;
          });
        },
        Error,
        "all prior args must be required",
      );
    });
  },
});
