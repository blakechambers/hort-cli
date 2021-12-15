interface cbInt<TParams, TRet> {
  (args: TParams): TRet;
}

class Spyy<TFunc extends cbInt<any, any>> {
  __originalFunc: TFunc;
  fnName: string;
  callArgs: Array<Parameters<TFunc>[0]>;
  callCount: 0;
  callingOriginal: boolean;
  stubResponse: ReturnType<TFunc> | undefined;
  stubResponseDefined: boolean;
  stubResponseVoid: boolean;

  constructor(func: TFunc) {
    this.fnName = func.name;
    this.__originalFunc = func;
    this.callCount = 0;
    this.callArgs = [];
    this.callingOriginal = true;
    this.stubResponse = undefined;
    this.stubResponseDefined = false;
    this.stubResponseVoid = false;

    this.perform = this.perform.bind(this);
  }

  getSpy() {
    let funcs: Record<string, any>;

    const perform = this.perform;

    funcs = {
      [this.fnName]: function (
        args: Parameters<typeof this.func>[0],
      ): ReturnType<typeof this.func> {
        return perform(args);
      },
    };

    return funcs[this.fnName];
  }

  getCallArgs() {
    return this.callArgs;
  }

  perform(
    args: Parameters<TFunc>[0],
  ): ReturnType<TFunc> | undefined {
    this.callArgs.push(args);
    this.callCount += 1;

    if (this.callingOriginal) {
      return this.__originalFunc(args);
    } else if (this.stubResponseVoid) {
      // do nothing
    } else if (this.stubResponseDefined) {
      return this.stubResponse;
    } else {
      throw new Error("stubResponse is undefined");
    }
  }

  andReturn(resp: ReturnType<TFunc>) {
    this.callingOriginal = false;
    this.stubResponse = resp;
    this.stubResponseDefined = true;
    this.stubResponseVoid = false;

    return this;
  }

  andReturnVoid() {
    this.callingOriginal = false;
    this.stubResponseDefined = false;
    this.stubResponseVoid = true;

    return this;
  }

  andCallOriginal() {
    this.callingOriginal = true;
    this.stubResponseDefined = false;
    this.stubResponseVoid = false;

    return this;
  }
}

function mockPropOnGlobal<TObj>(
  globalObj: TObj,
  prop: keyof TObj,
  replacement: cbInt<any, any>,
): [Spyy<cbInt<any, any>>, () => void] {
  const __originalGlobalObj = globalObj[prop];

  const spy = new Spyy(replacement);

  globalObj[prop] = spy.getSpy();

  function reset() {
    const oldSpy = globalObj[prop];

    globalObj[prop] = __originalGlobalObj;
  }

  return [spy, reset];
}

function buildSpy<TFunc extends cbInt<any, any>>(func: TFunc): [
  cbInt<Parameters<typeof func>[0], ReturnType<typeof func>>,
  Array<Parameters<typeof func>[0]>,
] {
  const fnName = func.name;
  let funcs: Record<string, any>;

  const spy = new Spyy<typeof func>(func);

  funcs = {
    [fnName]: function (
      args: Parameters<typeof func>[0],
    ): ReturnType<typeof func> | undefined {
      return spy.perform(args);
    },
  };

  return [funcs[fnName], spy.getCallArgs()];
}

function spy<TFunc extends cbInt<any, any>>(func: TFunc): Spyy<TFunc> {
  return new Spyy<typeof func>(func);
}

export { buildSpy, mockPropOnGlobal, spy };
