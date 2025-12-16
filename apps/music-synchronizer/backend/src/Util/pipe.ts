export const pipe = <T>(...fns: Array<(arg: T) => T>) =>
        (input: T): T => fns.reduce((acc, fn) => fn(acc), input);