import { ArgTypes } from "./shared/types.ts";
import type { CB, InterfaceKeys } from "./shared/types.ts";

class Argument<TParams> {
  name: InterfaceKeys<TParams>;
  type: ArgTypes;
  desc?: string;
  required?: boolean;

  constructor(name: InterfaceKeys<TParams>, proc?: CB<Argument<TParams>>) {
    this.name = name;
    this.type = ArgTypes.String;

    if (proc) proc(this);
  }
}

export { Argument };
