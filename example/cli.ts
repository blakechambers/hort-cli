import { main, subTasksFromDir, Task } from "../mod.ts";

if (import.meta.main) {
  // loads all subtasks from the ./cli directory.  the assumption is that
  // each file in the directory also exports a `task`.
  const subtasks = await subTasksFromDir("./cli");

  const t = new Task("Pom", undefined, (t) => {
    t.desc = "A simple time tracker / logger";

    Array.from(subtasks.values()).forEach((subtask) => {
      t.addSubTask(subtask);
    });
  });

  main(t);
}
