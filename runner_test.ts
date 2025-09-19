import { assertEquals, assertRejects, assertThrows } from "./test_deps.ts";
import { ArgTypes, buildTask, Task } from "./mod.ts";
import { run, SystemMessages } from "./runner.ts";
import { buildSpy, mockPropOnGlobal } from "./test_spy.ts";
import { Directory } from "./shared/directory.ts";

const { test } = Deno;

test({
  name: "runner – happy path with no args",
  fn: async () => {
    // deno-lint-ignore no-empty-interface
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
        // deno-lint-ignore no-empty-interface
        interface ListOpts {
        }

        function list({}: ListOpts): void {
        }

        const [listSpy, callArgs] = buildSpy(list);

        const task = buildTask(listSpy, (t) => {
          t.desc = "This is just a simple task to list things";
        });

        assertRejects(
          async () => {
            await run({ task, args, options });
          },
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

    // deno-lint-ignore no-unused-vars
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

      t.addArgument("baz", ArgTypes.String, (a) => {
        a.desc = "A required argument";
        a.required = true;
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
      aBool: boolean;
    }

    // deno-lint-ignore no-unused-vars
    function list({ aBool }: ListOpts): void {
    }
    interface Case {
      cliInput: string | number | boolean;
      runOutput?: boolean;
      errorMsg?: string;
      fieldRequired: boolean;
    }
    const cases: Array<Case> = [
      {
        cliInput: "true",
        runOutput: true,
        fieldRequired: true,
      },
      {
        cliInput: "1",
        runOutput: true,
        fieldRequired: true,
      },
      {
        cliInput: 1,
        runOutput: true,
        fieldRequired: true,
      },
      {
        cliInput: "TRUE",
        runOutput: true,
        fieldRequired: true,
      },
      {
        cliInput: "True",
        runOutput: true,
        fieldRequired: true,
      },
      {
        cliInput: "false",
        runOutput: false,
        fieldRequired: true,
      },
      {
        cliInput: "False",
        runOutput: false,
        fieldRequired: true,
      },
      {
        cliInput: "FALSE",
        runOutput: false,
        fieldRequired: true,
      },
      {
        cliInput: "0",
        runOutput: false,
        fieldRequired: true,
      },
      {
        cliInput: "0",
        runOutput: false,
        fieldRequired: false,
      },
      {
        cliInput: 0,
        runOutput: false,
        fieldRequired: true,
      },
      {
        cliInput: 0,
        runOutput: false,
        fieldRequired: false,
      },
      // {
      //   cliInput: "A STRING",
      //   fieldRequired: true,
      //   errorMsg:
      //     "Type error – requires a boolean. Only accepts values 'true', 'false', 1, or 0.",
      // },
      // {
      //   cliInput: 123456,
      //   fieldRequired: true,
      //   errorMsg:
      //     "Type error – requires a boolean. Only accepts values 'true', 'false', 1, or 0.",
      // },
    ];

    for (let i = 0; i < cases.length; i++) {
      const { cliInput, runOutput, fieldRequired, errorMsg } = cases[i];
      const [listSpy, callArgs] = buildSpy(list);

      const task = buildTask(listSpy, (t) => {
        t.addOption("aBool", ArgTypes.Boolean, (o) => {
          o.required = fieldRequired;
        });
      });

      const args: string[] = [];
      const options = { aBool: cliInput };

      if (errorMsg) {
        await assertThrows(
          async () => {
            await run({ task, args, options });
          },
        );
      } else {
        await run({ task, args, options });

        assertEquals(callArgs, [{ aBool: runOutput }]);
      }
    }
  },
});

test({
  name: "runner – casts CLI number options based on specified arg types",
  fn: async () => {
    interface ListOpts {
      aNumber: number;
    }

    // deno-lint-ignore no-unused-vars
    function list({ aNumber }: ListOpts): void {
    }
    interface Case {
      cliInput: string | number | boolean;
      runOutput?: number;
      errorMsg?: string;
      fieldRequired: boolean;
    }
    const cases: Array<Case> = [
      {
        cliInput: "123",
        runOutput: 123,
        fieldRequired: true,
      },
      {
        cliInput: "123.45",
        runOutput: 123.45,
        fieldRequired: true,
      },
      // {
      //   cliInput: "NaN",
      //   fieldRequired: true,
      //   errorMsg: "Type error – requires a number",
      // },
      // {
      //   cliInput: "not a number",
      //   fieldRequired: true,
      //   errorMsg: "Type error – requires a number",
      // },
    ];

    for (let i = 0; i < cases.length; i++) {
      const { cliInput, runOutput, fieldRequired, errorMsg } = cases[i];
      const [listSpy, callArgs] = buildSpy(list);

      const task = buildTask(listSpy, (t) => {
        t.addOption("aNumber", ArgTypes.Number, (o) => {
          o.required = fieldRequired;
        });
      });

      const args: string[] = [];
      const options = { aNumber: cliInput };

      if (errorMsg) {
        await assertThrows(
          async () => await run({ task, args, options }),
        );
      } else {
        await run({ task, args, options });

        assertEquals(callArgs, [{ aNumber: runOutput }]);
      }
    }
  },
});

test({
  name: "runner – casts CLI string options based on specified arg types",
  fn: async () => {
    interface ListOpts {
      aStr: string;
    }

    // deno-lint-ignore no-unused-vars
    function list({ aStr }: ListOpts): void {
    }
    interface Case {
      cliInput: string | number | boolean;
      runOutput?: string;
      errorMsg?: string;
      fieldRequired: boolean;
    }
    const cases: Array<Case> = [
      {
        cliInput: "blah",
        runOutput: "blah",
        fieldRequired: true,
      },
      // {
      //   cliInput: 1234,
      //   fieldRequired: true,
      //   errorMsg: "Type error – requires a string",
      // },
      {
        cliInput: "blah",
        runOutput: "blah",
        fieldRequired: false,
      },
    ];

    for (let i = 0; i < cases.length; i++) {
      const { cliInput, runOutput, fieldRequired, errorMsg } = cases[i];
      const [listSpy, callArgs] = buildSpy(list);

      const task = buildTask(listSpy, (t) => {
        t.addOption("aStr", ArgTypes.String, (o) => {
          o.required = fieldRequired;
        });
      });

      const args: string[] = [];
      const options = { aStr: cliInput };

      if (errorMsg) {
        await assertThrows(
          async () => await run({ task, args, options }),
        );
      } else {
        await run({ task, args, options });

        assertEquals(callArgs, [{ aStr: runOutput }]);
      }
    }
  },
});

// test({
//   name: "runner – throws exceptions when non required options are omitted",
//   fn: () => {
//     interface ListOpts {
//       foo: boolean;
//       bar: string;
//     }

//     function list({ foo, bar }: ListOpts): void {
//     }

//     const [listSpy, callArgs] = buildSpy(list);
//     const [consoleSpy, resetConsoleSpy] = mockPropOnGlobal(
//       console,
//       "log",
//       console.log,
//     );
//     consoleSpy.andReturnVoid();

//     const task = buildTask(listSpy, (t) => {
//       t.addOption("foo", ArgTypes.Boolean, (o) => {
//         o.required = true;
//       });
//     });

//     const args: string[] = [];
//     const options = {};

//     assertThrows(
//       async () => { await run({ task, args, options }) },
//       Error,
//       "Type error – requires a boolean.",
//     );
//     resetConsoleSpy();
//   },
// });

test({
  name: "runner – non-required args and options receive 'undefined'",
  fn: async () => {
    interface ListOpts {
      foo?: boolean;
      bar?: boolean;
    }

    // deno-lint-ignore no-unused-vars
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
      t.addArgument("foo", ArgTypes.Boolean, (a) => {
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

    // deno-lint-ignore no-unused-vars
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
    // deno-lint-ignore no-empty-interface
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
    assertEquals(
      consoleSpy.callArgs.join(),
      [
        `
  parent

  Sub commands

      child  ${SystemMessages.DescriptionNotProvided}
`,
      ].join(),
    );

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

    // deno-lint-ignore no-unused-vars
    function list({ foo, bar, baz }: ListOpts): void {
    }

    // deno-lint-ignore no-unused-vars
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

      t.addArgument("baz", ArgTypes.String, (a) => {
        a.desc = "A required argument";
        a.required = true;
      });
    });

    const args: string[] = [];
    const options = { help: true };

    await run({ task, args, options });

    // ignoring whitespace differences
    assertEquals(
      consoleSpy.callArgs[0].replace(/\s+/g, " ").trim(),
      `
  list

  a test function named list

  Arguments

      <baz>  A required argument

  Options

      --foo  foo description
      --bar  foo description
`.replace(/\s+/g, " ").trim(),
    );
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

    // deno-lint-ignore no-unused-vars
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

test({
  name: "runner – enum option with invalid value",
  fn: () => {
    enum Foo {
      Bar = "bar",
      Baz = "baz",
    }

    interface ListOpts {
      foo: Foo;
    }

    // deno-lint-ignore no-unused-vars
    function list({ foo }: ListOpts): void {
    }

    const [listSpy, _] = buildSpy(list);
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
        o.values = [Foo.Bar, Foo.Baz];
      });
    });

    const args: string[] = [];
    const options = { foo: "wrong_value" };

    assertRejects(
      async () => {
        await run({ task, args, options });
      },
    );
    resetConsoleSpy();
  },
});

test({
  name: "runner – directory option",
  fn: async () => {
    interface ListOpts {
      foo: Directory;
    }

    // deno-lint-ignore no-unused-vars
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
      t.addOption("foo", ArgTypes.Directory, (o) => {
        o.desc = "foo description";
        o.required = true;

        o.allowExisting = true;
      });
    });

    const args: string[] = [];
    const options = { foo: "/tmp" };

    await run({ task, args, options });

    assertEquals(callArgs, [{
      foo: new Directory({ path: "/tmp", ensureExists: true }),
    }]);
    resetConsoleSpy();
  },
});
