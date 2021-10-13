import { expandGlob, resolve } from "./deps.ts";
import { Task } from "./task.ts";

async function subTasksFromDir(
  pathDir: string,
): Promise<Map<string, Task<unknown>>> {
  const taskMap = new Map<string, Task<unknown>>();

  for await (const { path } of expandGlob(resolve(pathDir, "*.ts"))) {
    const { default: taskFunc, task: config } = await import(path);

    if (config) {
      const task: Task<Parameters<typeof config>[0]> = config;

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
