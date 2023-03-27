/*
  This is an example of how to create sub tasks to a main task. You
  can use addSubTask tasks loaded from other files.

  Additionally, if the parent task doesn't offer any functionality,
  you can just pass undefined in place of the function. By default this will just print usage instructions.

  To run this example, run the following command:

      deno run example/cli.ts help
*/
import { main, Task } from "../mod.ts";
import { task as listTask } from "./cli/list.ts";
import { task as catTask } from "./cli/cat.ts";

if (import.meta.main) {
  const t = new Task("Pom", undefined, (t) => {
    t.desc = "A simple example wrapper for Hort CLI";

    t.addSubTask(listTask);
    t.addSubTask(catTask);
  });

  main(t);
}
