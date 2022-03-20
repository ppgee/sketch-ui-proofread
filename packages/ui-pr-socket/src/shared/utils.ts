export function printLog(title: string, ...arg: any[]) {
  console.log(`%c 【socket ${title} 事件】 `, 'color: white; background-color: #6068d2;', ...arg)
}

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
          derivedCtor.prototype[name] = baseCtor.prototype[name];
      })
  });
}