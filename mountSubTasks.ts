import { expandGlob, resolve } from "./deps.ts";
import { Task } from "./task.ts";

const TASK_EXPORT_NAME = "task";

async function subTasksFromDir(
  pathDir: string,
): Promise<Map<string, Task<unknown>>> {
  const taskMap = new Map<string, Task<unknown>>();

  for await (const { path } of expandGlob("*.ts", { root: resolve(pathDir) })) {
    const { default: taskFunc, [TASK_EXPORT_NAME]: config } = await import(
      path
    );

    if (config) {
      taskMap.set(taskFunc.name, config);
    }
  }

  return taskMap;
}

export { subTasksFromDir };
