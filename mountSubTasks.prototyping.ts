import { expandGlob, resolve } from "./deps.ts";
import { buildTask, Task } from "./taskv2.ts";

const TASK_EXPORT_NAME = "task";

async function subTasksFromDir(
  pathDir: string,
): Promise<Map<string, Task<unknown>>> {
  const taskMap = new Map<string, Task<unknown>>();

  for await (const { path } of expandGlob(resolve(pathDir, "*.ts"))) {
    const { default: taskFunc, [TASK_EXPORT_NAME]: config } = await import(
      path
    );

    if (config) {
      const task = buildTask(taskFunc, config);

      taskMap.set(taskFunc.name, task);
    }
  }

  return taskMap;
}

// if (import.meta.main) {
//   console.log(await subTasksFromDir("./example/cli"));
// }

// async function mount(dirPath) :

export { subTasksFromDir };
