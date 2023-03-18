import { assertEquals, assertThrowsAsync } from "./test_deps.ts";
import { ArgTypes, buildTask, Task } from "./mod.ts";
import { run } from "./runner.ts";
import { buildSpy, mockPropOnGlobal } from "./test_spy.ts";

const { test } = Deno;

test({
  name: "runner – happy path with no args",
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
  name: "runner – errors with unused args",
  fn: () => {
    const cases: Array<{
      args: Array<string>;
      options: Record<string, string | boolean | number>;
      expectedErrorMsg: string;
    }> = [
      {
        args: ["foo"],
        options: {},
        expectedErrorMsg:
          "Argument error – unexpected argument(s) 'foo' provided",
      },
      {
        args: ["foo", "bar"],
        options: {},
        expectedErrorMsg:
          "Argument error – unexpected argument(s) 'foo' and 'bar' provided",
      },
      {
        args: ["foo", "bar", "baz"],
        options: {},
        expectedErrorMsg:
          "Argument error – unexpected argument(s) 'foo', 'bar' and 'baz' provided",
      },
      {
        args: [],
        options: { foo: "foo" },
        expectedErrorMsg:
          "Argument error – unexpected options(s) 'foo' provided",
      },
      {
        args: [],
        options: { foo: "foo", bar: "bar" },
        expectedErrorMsg:
          "Argument error – unexpected options(s) 'foo' and 'bar' provided",
      },
      {
        args: [],
        options: { foo: "foo", bar: "bar", baz: "baz" },
        expectedErrorMsg:
          "Argument error – unexpected options(s) 'foo', 'bar' and 'baz' provided",
      },
    ];

    cases.forEach(
      (
        { args, options, expectedErrorMsg },
      ) => {
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
  name: "runner – casts CLI options and arguments to keyword args",
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
      t.addOption("foo", ArgTypes.Boolean, (o) => {
        o.required = true;
      });

      t.addOption("bar", ArgTypes.String, (o) => {
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
  name: "runner – casts CLI boolean options based on specified arg types",
  fn: async () => {
    interface ListOpts {
      aStr: string;
      aBool: boolean;
      aNumber: number;
      aEnum: string;
    }

    function list({ aStr, aBool, aNumber }: ListOpts): void {
    }
    interface Case {
      cliInput: any;
      runOutput?: any;
      errorMsg?: string;
      fieldRequired: boolean;
      fieldType: ArgTypes;
    }
    const cases: Array<Case> = [
      {
        cliInput: "true",
        runOutput: true,
        fieldRequired: true,
        fieldType: ArgTypes.Boolean,
      },
      {
        cliInput: "1",
        runOutput: true,
        fieldRequired: true,
        fieldType: ArgTypes.Boolean,
      },
      {
        cliInput: 1,
        runOutput: true,
        fieldRequired: true,
        fieldType: ArgTypes.Boolean,
      },
      {
        cliInput: "TRUE",
        runOutput: true,
        fieldRequired: true,
        fieldType: ArgTypes.Boolean,
      },
      {
        cliInput: "True",
        runOutput: true,
        fieldRequired: true,
        fieldType: ArgTypes.Boolean,
      },
      {
        cliInput: "false",
        runOutput: false,
        fieldRequired: true,
        fieldType: ArgTypes.Boolean,
      },
      {
        cliInput: "False",
        runOutput: false,
        fieldRequired: true,
        fieldType: ArgTypes.Boolean,
      },
      {
        cliInput: "FALSE",
        runOutput: false,
        fieldRequired: true,
        fieldType: ArgTypes.Boolean,
      },
      {
        cliInput: "0",
        runOutput: false,
        fieldRequired: true,
        fieldType: ArgTypes.Boolean,
      },
      {
        cliInput: "0",
        runOutput: false,
        fieldRequired: false,
        fieldType: ArgTypes.Boolean,
      },
      {
        cliInput: 0,
        runOutput: false,
        fieldRequired: true,
        fieldType: ArgTypes.Boolean,
      },
      {
        cliInput: 0,
        runOutput: false,
        fieldRequired: false,
        fieldType: ArgTypes.Boolean,
      },
      {
        cliInput: "A STRING",
        fieldRequired: true,
        fieldType: ArgTypes.Boolean,
        errorMsg:
          "Type error – requires a boolean. Only accepts values 'true', 'false', 1, or 0.",
      },
      {
        cliInput: 123456,
        fieldRequired: true,
        fieldType: ArgTypes.Boolean,
        errorMsg:
          "Type error – requires a boolean. Only accepts values 'true', 'false', 1, or 0.",
      },
      {
        cliInput: "blah",
        runOutput: "blah",
        fieldRequired: true,
        fieldType: ArgTypes.String,
      },
      {
        cliInput: 1234,
        fieldRequired: true,
        fieldType: ArgTypes.String,
        errorMsg: "Type error – requires a string",
      },
      {
        cliInput: "blah",
        runOutput: "blah",
        fieldRequired: false,
        fieldType: ArgTypes.String,
      },
      {
        cliInput: "123",
        runOutput: 123,
        fieldRequired: true,
        fieldType: ArgTypes.Number,
      },
      {
        cliInput: "123.45",
        runOutput: 123.45,
        fieldRequired: true,
        fieldType: ArgTypes.Number,
      },
      {
        cliInput: "NaN",
        fieldRequired: true,
        fieldType: ArgTypes.Number,
        errorMsg: "Type error – requires a number",
      },
      {
        cliInput: "not a number",
        fieldRequired: true,
        fieldType: ArgTypes.Number,
        errorMsg: "Type error – requires a number",
      },
    ];

    for (let i = 0; i < cases.length; i++) {
      const { cliInput, runOutput, fieldType, fieldRequired, errorMsg } =
        cases[i];
      const [listSpy, callArgs] = buildSpy(list);
      let optionName: keyof ListOpts;

      switch (fieldType) {
        case ArgTypes.Boolean:
          optionName = "aBool";
          break;
        case ArgTypes.String:
          optionName = "aStr";
          break;
        case ArgTypes.Number:
          optionName = "aNumber";
          break;
        case ArgTypes.Enum:
          optionName = "aEnum";
          break;
        default:
          throw new Error("panic – unhandled ArgType");
      }

      const task = buildTask(listSpy, (t) => {
        switch (fieldType) {
          case ArgTypes.Boolean:
            t.addOption(optionName, ArgTypes.Boolean, (o) => {
              o.required = fieldRequired;
            });
            break;
          case ArgTypes.String:
            t.addOption(optionName, ArgTypes.String, (o) => {
              o.required = fieldRequired;
            });
            break;
          case ArgTypes.Number:
            t.addOption(optionName, ArgTypes.Number, (o) => {
              o.required = fieldRequired;
            });
            break;
          case ArgTypes.Enum:
            t.addOption(optionName, ArgTypes.Enum, (o) => {
              o.required = fieldRequired;
              o.values = ["foo", "bar"];
            });
            break;
          default:
            throw new Error("panic – unhandled ArgType");
        }
      });

      const args: string[] = [];
      const options = { [optionName]: cliInput };

      if (errorMsg) {
        assertThrowsAsync(
          async () => await run({ task, args, options }),
          Error,
          errorMsg,
        );
      } else {
        await run({ task, args, options });

        assertEquals(callArgs, [{ [optionName]: runOutput }]);
      }
    }
  },
});

test({
  name: "runner – throws exceptions when non required options are omitted",
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
      t.addOption("foo", ArgTypes.Boolean, (o) => {
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
  name: "runner – non-required args and options receive 'undefined'",
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

      t.addOption("bar", ArgTypes.Boolean, (o) => {
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
  name: "runner - traversing subtasks",
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
        t.addOption("quiet", ArgTypes.Boolean, (o) => {
          o.desc = "A required option";
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
  name: "runner - traversing subtasks when args do not match",
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
    assertEquals(consoleSpy.callArgs, [`parent

Sub commands:
    child    undefined
`]);

    resetConsoleSpy();
  },
});

test({
  name: "runner – help text formatting",
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
      t.addOption("foo", ArgTypes.Boolean, (o) => {
        o.desc = "foo description";
        o.required = true;
      });

      t.addOption("bar", ArgTypes.String, (o) => {
        o.desc = "foo description";
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

// enum option
test({
  name: "runner – enum option",
  fn: async () => {
    enum Foo {
      Bar = "bar",
      Baz = "baz",
    }

    interface ListOpts {
      foo: Foo;
    }

    function list({ foo }: ListOpts): void {
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
      t.addOption("foo", ArgTypes.Enum, (o) => {
        o.desc = "foo description";
        o.required = true;
        o.values = ["bar", "baz"];
      });
    });

    const args: string[] = [];
    const options = { foo: "bar" };

    await run({ task, args, options });

    assertEquals(callArgs, [{ foo: "bar" }]);
    resetConsoleSpy();
  },
});
