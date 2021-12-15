import { assertEquals, assertThrowsAsync } from "./test_deps.ts";
import { ArgTypes, buildTask, Task } from "./modv2.ts";
import { run } from "./runnerv2.ts";
import { buildSpy, mockPropOnGlobal } from "./test_spy.ts";

const { test } = Deno;

test({
  name: "[V2] runner – happy path with no args",
  fn: async () => {
    interface ListOpts {
    }

    function list({}: ListOpts): void {
    }

    const [listSpy, callArgs] = buildSpy(list);

    const task = buildTask(listSpy, (t) => {
      t.desc = "This is just a simple task to list things";
    });

    const args: string[] = [];
    const options = {};

    await run({ task, args, options });

    assertEquals(callArgs, [{}]);
  },
});

test({
  name: "[V2] runner – errors with unused args",
  fn: () => {
    [
      {
        args: ["foo"],
        _opts: {},
        expectedErrorMsg:
          "Argument error – unexpected argument(s) 'foo' provided",
      },
      {
        args: ["foo", "bar"],
        _opts: {},
        expectedErrorMsg:
          "Argument error – unexpected argument(s) 'foo' and 'bar' provided",
      },
      {
        args: ["foo", "bar", "baz"],
        _opts: {},
        expectedErrorMsg:
          "Argument error – unexpected argument(s) 'foo', 'bar' and 'baz' provided",
      },
      {
        args: [],
        _opts: { foo: "foo" },
        expectedErrorMsg:
          "Argument error – unexpected options(s) 'foo' provided",
      },
      {
        args: [],
        _opts: { foo: "foo", bar: "bar" },
        expectedErrorMsg:
          "Argument error – unexpected options(s) 'foo' and 'bar' provided",
      },
      {
        args: [],
        _opts: { foo: "foo", bar: "bar", baz: "baz" },
        expectedErrorMsg:
          "Argument error – unexpected options(s) 'foo', 'bar' and 'baz' provided",
      },
    ].forEach(
      (
        { args, _opts, expectedErrorMsg },
      ) => {
        // hack the value for the table test
        let options: Record<string, string | boolean | number> =
          _opts as Record<
            string,
            string | boolean | number
          >;

        interface ListOpts {
        }

        function list({}: ListOpts): void {
        }

        const [listSpy, callArgs] = buildSpy(list);

        const task = buildTask(listSpy, (t) => {
          t.desc = "This is just a simple task to list things";
        });

        assertThrowsAsync(
          async () => await run({ task, args, options }),
          Error,
          expectedErrorMsg,
        );

        assertEquals(callArgs, []);
      },
    );
  },
});

test({
  name: "[V2] runner – casts CLI options and arguments to keyword args",
  fn: async () => {
    interface ListOpts {
      foo: boolean;
      bar: string;
      baz: string;
    }

    function list({ foo, bar, baz }: ListOpts): void {
    }

    const [listSpy, callArgs] = buildSpy(list);

    const task = buildTask(listSpy, (t) => {
      t.addOption("foo", (o) => {
        o.type = ArgTypes.Boolean;
        o.required = true;
      });

      t.addOption("bar", (o) => {
        o.type = ArgTypes.String;
        o.required = true;
      });

      t.addArgument("baz", (a) => {
        a.desc = "A required argument";
        a.required = true;

        a.type = ArgTypes.String;
      });
    });

    const args: string[] = ["bazzz"];
    const options = { foo: "true", bar: "hello" };

    await run({ task, args, options });

    assertEquals(callArgs, [{ foo: true, bar: "hello", baz: "bazzz" }]);
  },
});

test({
  name: "[V2] runner – throws exceptions when non required options are omitted",
  fn: () => {
    interface ListOpts {
      foo: boolean;
      bar: string;
    }

    function list({ foo, bar }: ListOpts): void {
    }

    const [listSpy, callArgs] = buildSpy(list);
    const [consoleSpy, resetConsoleSpy] = mockPropOnGlobal(
      console,
      "log",
      console.log,
    );
    consoleSpy.andReturnVoid();

    const task = buildTask(listSpy, (t) => {
      t.addOption("foo", (o) => {
        o.type = ArgTypes.Boolean;
        o.required = true;
      });
    });

    const args: string[] = [];
    const options = {};

    assertThrowsAsync(
      async () => await run({ task, args, options }),
      Error,
      "Type error – requires a boolean.",
    );
    resetConsoleSpy();
  },
});

test({
  name: "[V2] runner – non-required args and options receive 'undefined'",
  fn: async () => {
    interface ListOpts {
      foo: boolean;
      bar: boolean;
    }

    function list({ foo, bar }: ListOpts): void {
    }

    const [listSpy, callArgs] = buildSpy(list);
    const [consoleSpy, resetConsoleSpy] = mockPropOnGlobal(
      console,
      "log",
      console.log,
    );
    consoleSpy.andReturnVoid();

    const task = buildTask(listSpy, (t) => {
      t.addArgument("foo", (a) => {
        a.type = ArgTypes.Boolean;
        a.required = false;
      });

      t.addOption("bar", (o) => {
        o.type = ArgTypes.Boolean;
        o.required = false;
      });
    });

    const args: string[] = [];
    const options = {};

    await run({ task, args, options });

    assertEquals(callArgs, [{ foo: undefined, bar: undefined }]);
    resetConsoleSpy();
  },
});

test({
  name: "[V2] runner - traversing subtasks",
  fn: async () => {
    interface ListOpts {
      quiet: boolean;
    }

    function child({ quiet }: ListOpts): void {
    }

    const [childSpy, childCallArgs] = buildSpy(child);
    const [consoleSpy, resetConsoleSpy] = mockPropOnGlobal(
      console,
      "log",
      console.log,
    );
    consoleSpy.andReturnVoid();

    const childTask = buildTask(
      childSpy,
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

    const args: string[] = ["child"];
    const options = { quiet: "true" };

    await run({ task, args, options });

    assertEquals(childCallArgs, [{ quiet: true }]);
    resetConsoleSpy();
  },
});

test({
  name: "[V2] runner - traversing subtasks when args do not match",
  fn: async () => {
    interface ListOpts {
    }

    function child({}: ListOpts): void {
    }

    const [childSpy, childCallArgs] = buildSpy(child);
    const [consoleSpy, resetConsoleSpy] = mockPropOnGlobal(
      console,
      "log",
      console.log,
    );
    consoleSpy.andReturnVoid();

    const childTask = buildTask(
      childSpy,
      () => {
      },
    );

    const task = new Task<Record<string, unknown>>("parent", undefined, (t) => {
      t.addSubTask(childTask);
    });

    assertEquals(task.name, "parent");

    const subTasks = task.subTasks;
    assertEquals([...subTasks.keys()], ["child"]);

    const args: string[] = ["wrong_name"];
    const options = { quiet: "true" };

    await run({ task, args, options });

    // was not called
    assertEquals(childCallArgs, []);
    assertEquals(consoleSpy.callArgs, ["the help message"]);

    resetConsoleSpy();
  },
});

test({
  name: "[V2] runner – help text formatting",
  fn: async () => {
    interface ListOpts {
      foo: boolean;
      bar: string;
      baz: string;
    }

    function list({ foo, bar, baz }: ListOpts): void {
    }

    const [listSpy, callArgs] = buildSpy(list);
    const [consoleSpy, resetConsoleSpy] = mockPropOnGlobal(
      console,
      "log",
      console.log,
    );
    consoleSpy.andReturnVoid();

    const task = buildTask(listSpy, (t) => {
      t.desc = "a test function named list";
      t.addOption("foo", (o) => {
        o.desc = "foo description";
        o.type = ArgTypes.Boolean;
        o.required = true;
      });

      t.addOption("bar", (o) => {
        o.desc = "foo description";
        o.type = ArgTypes.String;
        o.required = true;
      });

      t.addArgument("baz", (a) => {
        a.desc = "A required argument";
        a.required = true;

        a.type = ArgTypes.String;
      });
    });

    const args: string[] = [];
    const options = { help: true };

    await run({ task, args, options });

    assertEquals(consoleSpy.callArgs, [`list

a test function named list

Options:
    foo    foo description
    bar    foo description
`]);

    resetConsoleSpy();
  },
});
