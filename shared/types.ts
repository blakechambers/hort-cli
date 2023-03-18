enum ArgTypes {
  String = "String",
  Boolean = "Boolean",
  Number = "Number",
  Enum = "Enum",
}

type InterfaceKeys<T> = keyof T;

interface CB<T> {
  (arg: T): void;
}

export { ArgTypes };
export type { CB, InterfaceKeys };
