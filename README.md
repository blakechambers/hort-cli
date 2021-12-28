```
cd ~/projects/deno/hort-cli/example
deno run --allow-read=..,../../process-cli --allow-net cli.ts test --quiet true
```

### Next steps ideas

- [x] refactor spy to not return console out
- [x] passing extra arguments raises an error
- [x] passing extra options raises an error
- [x] working example
- [x] remove all the v1 stuff
- [ ] test `help list` subtask like param managment changes added in `e0866c`
- [ ] formalize error classes
- [ ] better wording on too many / too few args error message
- [ ] add enum type
- [ ] add file path argument type, source dir
- [ ] add tests for help text formatting rules
  - prints help text any time -h or --help is received
- [ ] beef up the help text code
- [ ] via a mount-like api, create a path for managing and organizing subtasks.
  - Task could have some way to mount a subtasks dir
- [x] extract task selection from the runner code. i.e. change it to accept a
      task, via the mount api, generate a task that accepts lots of options, but
      the goal is to delegate to the next task instead.
- [x] tasks can either ensure all args are accounted for (leaf level tasks) or
      not (grouping of tasks)
- [ ] support a top level stdin full and stdin piped arg type
- [ ] support both async and non async functions
- [ ] support adding aliases for option params
- [ ] refactor the help message formatting to be a separate repo
- [ ] create an alternate DSL that uses typescript decorators and a class based
      API
