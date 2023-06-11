import { readLines } from "https://deno.land/std@0.191.0/io/read_lines.ts";
import { ArgTypes, buildTask } from "../../mod.ts";

interface CatOpts {
  file: Deno.FsFile;
}

// Print the contents of the file at path to console
async function cat({ file }: CatOpts) {
  console.log("catting file", { file });

  const fileInfo = await file.stat();
  if (!fileInfo.isFile) throw new Error("Not a file");

  for await (const line of readLines(file)) {
    console.log(line);
  }

  file.close();
}

const task = buildTask(cat, (t) => {
  t.desc = "This is just a simple task to list things";

  t.addArgument("file", ArgTypes.File, (a) => {
    a.desc = "A required path to a file";
    a.required = true;
  });
});

export default cat;
export { task };
