import { Directory } from "./directory.ts";
import { assertEquals } from "../test_deps.ts";

const { test } = Deno;

/**
 * Represents a directory on the file system.
 *
 * @example
 * const dirPath = "/path/to/directory";
 * const dir = new Directory(dirPath);
 * const dirExists = await dir.exists();
 * if (!dirExists) {
 *   await dir.create();
 * }
 *
 * @scenario Validate the presence of an existing directory
 * @scenario Handle errors that occur when checking for a directory
 * @scenario Handle file-based and URL-based path names correctly on different platforms
 * @scenario Use the `async` and `await` keywords to ensure that directory operations are performed asynchronously
 * @scenario Allow the `ensureExists` option to create the directory if it does not exist
 * @scenario Throw an error if `ensureExists` is `true` but the directory does not exist
 */

test({
  name: "Directory - Validate the presence of an existing directory",
  fn: async () => {
    const dir = new Directory({ path: "./testdata/existing_directory" });

    const dirExists = await dir.exists();
    assertEquals(dirExists, true);
  },
});

test({
  name: "Directory - Validate the absence of a nonexistent directory",
  fn: async () => {
    const dir = new Directory({ path: "./testdata/nonexistent_directory" });

    const dirExists = await dir.exists();
    assertEquals(dirExists, false);
  },
});

test({
  name:
    "Directory - Expect exists() to return false when checking for a directory that does not exist",
  fn: async () => {
    const dir = new Directory({ path: "./testdata/nonexistent_directory" });

    const result = await dir.exists();

    assertEquals(result, false);
  },
});

test({
  name:
    "Directory - Handle file-based and URL-based path names correctly on different platforms",
  fn: () => {
    const dir = new Directory({ path: "./testdata/existing_directory" });

    assertEquals(dir.path, "./testdata/existing_directory");
  },
});
