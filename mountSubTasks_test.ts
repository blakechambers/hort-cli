// this file tests the subTasksFromDir function.
import { assertEquals, assertThrowsAsync } from "./test_deps.ts";
import { subTasksFromDir } from "./mountSubTasks.ts";

const { test } = Deno;

test({
  name: "subTasksFromDir – happy path with no args",
  fn: async () => {
    const subTasksMap = await subTasksFromDir("./example/cli");

    assertEquals(subTasksMap.size, 1);
  },
});
