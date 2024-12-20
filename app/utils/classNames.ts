/**
 * 版权所有 (c) 2018 Jed Watson.
 * 按照 MIT 许可证 (MIT) 授权，见：
 *
 * @link http://jedwatson.github.io/classnames
 */

type ClassNamesArg = undefined | string | Record<string, boolean> | ClassNamesArg[];

/**
 * 一个简单的 JavaScript 工具，用于有条件地连接 classNames。
 *
 * @param args 一系列类名或带有类名作为键和解释为布尔值的对象，以决定
 * 类是否应该包含在最终的类中。
 */
export function classNames(...args: ClassNamesArg[]): string {
  let classes = '';

  for (const arg of args) {
    classes = appendClass(classes, parseValue(arg));
  }

  return classes;
}

function parseValue(arg: ClassNamesArg) {
  if (typeof arg === 'string' || typeof arg === 'number') {
    return arg;
  }

  if (typeof arg !== 'object') {
    return '';
  }

  if (Array.isArray(arg)) {
    return classNames(...arg);
  }

  let classes = '';

  for (const key in arg) {
    if (arg[key]) {
      classes = appendClass(classes, key);
    }
  }

  return classes;
}

function appendClass(value: string, newClass: string | undefined) {
  if (!newClass) {
    return value;
  }

  if (value) {
    return value + ' ' + newClass;
  }

  return value + newClass;
}
