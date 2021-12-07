```
cd ~/projects/deno/hort-cli/example
deno run --allow-read=..,../../process-cli --allow-net cli.ts test --quiet true
```

possible path for mounting folders of tasks

```ts
import { mountTasksDir } from "...";

export const task = mountTasksDir("./cli");
```

### runner v2 psuedo code

```ts
function run({task, args, options}) {
  if (task.hasSubTasks) {
    const firstArg, ...remainingArgs == args;

    if firstArg == "help" {
      // rerun with help flag added
    }

    if(firstArg valid subTask name for task) {
      // load subtask
      // run({task: subtask, args: remainingArgs, options})
    } else {
      //error - not sub task 'name', did you mean instead?
    }

  } else {
    if (args and opts match task) {
      // run the task with args
    } else {
      // error - args didn't match expectation
    }

  }


}
```

### Next steps ideas

- [ ] passing extra arguments or options raises an error
- [ ] add enum type
- [ ] add file path argument type
- [ ] add tests for help text formatting rules
  - prints help text any time -h or --help is received
- [ ] beef up the help text code
- [ ] via a mount-like api, create a path for managing and organizing subtasks.
  - Task could have some way to mount a subtasks dir
- [ ] extract task selection from the runner code. i.e. change it to accept a
      task, via the mount api, generate a task that accepts lots of options, but
      the goal is to delegate to the next task instead.
- [ ] tasks can either ensure all args are accounted for (leaf level tasks) or
      not (grouping of tasks)
- [ ] support a top level stdin full and stdin piped arg type
- [ ] support both async and non async functions
