import { assertEquals, assertThrowsAsync } from "./test_deps.ts";
import { ArgTypes, buildTask, Task } from "./modv2.ts";
import { run } from "./runnerv2.ts";
import { buildSpy } from "./test_spy.ts";

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
  },
});