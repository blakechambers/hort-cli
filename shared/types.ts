enum ArgTypes {
  String = "String",
  Boolean = "Boolean",
  Number = "Number",
}

type InterfaceKeys<T> = keyof T;

interface CB<T> {
  (arg: T): void;
}

export { ArgTypes };
export type { CB, InterfaceKeys };
