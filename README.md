```
cd ~/projects/deno/hort-cli/example
deno run --allow-read=..,../../process-cli --allow-net cli.ts test --quiet true
```

possible path for mounting folders of tasks

```ts
import { mountTasksDir } from "...";

export const task = mountTasksDir("./cli");
```

### Next steps ideas

- [ ] beef up the help text code
- [ ] via a mount-like api, create a path for managing and organizing subtasks.
  - Task could have some way to mount a subtasks dir
- [ ] extract task selection from the runner code. i.e. change it to accept a
  task, via the mount api, generate a task that accepts lots of options, but the
  goal is to delegate to the next task instead.
- [ ] test runner.ts
- [ ] add file path argument type
- [ ] tasks can either ensure all args are accounted for (leaf level tasks) or
  not (grouping of tasks)
- [ ] support a top level stdin full and stdin piped arg type
