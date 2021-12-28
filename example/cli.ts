import { main, run } from "../mod.ts";
import { task } from "./cli/list.ts";

if (import.meta.main) {
  main(task);
}
