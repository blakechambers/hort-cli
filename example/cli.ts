import { main, subTasksFromDir, Task } from "../mod.ts";

if (import.meta.main) {
  const subtasks = await subTasksFromDir("./cli");

  const t = new Task("Pom", undefined, (t) => {
    t.desc = "A simple time tracker / logger";

    [...subtasks.values()].forEach((subtask) => {
      t.addSubTask(subtask);
    });
  });

  main(t);
}
