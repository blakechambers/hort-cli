interface cbInt<TParams, TRet> {
  (args: TParams): TRet;
}

function buildSpy<TFunc extends cbInt<any, any>>(list: TFunc): [
  cbInt<Parameters<typeof list>[0], ReturnType<typeof list>>,
  Array<Parameters<typeof list>[0]>,
] {
  const callArgs: Array<Parameters<typeof list>[0]> = [];

  const wrapper = function (
    args: Parameters<typeof list>[0],
  ): ReturnType<typeof list> {
    callArgs.push(args);

    return list(args);
  };

  return [wrapper, callArgs];
}

export { buildSpy };
