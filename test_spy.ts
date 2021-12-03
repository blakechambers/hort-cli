interface cbInt<TParams, TRet> {
  (args: TParams): TRet;
}

function buildSpy<TFunc extends cbInt<any, any>>(list: TFunc): [
  cbInt<Parameters<typeof list>[0], ReturnType<typeof list>>,
  Array<Parameters<typeof list>[0]>,
] {
  const callArgs: Array<Parameters<typeof list>[0]> = [];
  const fnName = list.name;
  let funcs: Record<string, any>;

  funcs = {
    [fnName]: function (
      args: Parameters<typeof list>[0],
    ): ReturnType<typeof list> {
      callArgs.push(args);

      return list(args);
    },
  };

  return [funcs[fnName], callArgs];
}

let __originalConsoleLog: ((...data: any[]) => void) | null;

function mockConsoleLog() {
  const __originalConsoleLog = console.log;

  const [childSpy, childCallArgs] = buildSpy<cbInt<any[], void>>(
    __originalConsoleLog,
  );

  console.log = childSpy;

  return [childSpy, childCallArgs];
}

function resetConsoleLogMock() {
  if (__originalConsoleLog) {
    console.log = __originalConsoleLog;
    __originalConsoleLog = null;
  }
}

export { buildSpy, mockConsoleLog, resetConsoleLogMock };
