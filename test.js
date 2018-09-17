const compose = (...fns) => arg =>
    fns.reduceRight((result, fn) => fn(result), arg);

const curry = fn => {
  const nextCurried = prevArgs => nextArg => {
    const args = prevArgs.concat([nextArg]);                        // Don't need brackets
    if (args.length >= fn.length) {
      return fn(...args);
    } else {
      return nextCurried(args);
    }
  };

  return nextCurried([]);
};

const transduce = (transducer, combineFn, initialValue, list) => {
  const reducer = transducer(combineFn);
  return list.reduce(reducer, initialValue);
};

const mapReducer = mappingFn => combineFn => (list, i) => combineFn(list, mappingFn(i)); 
const filterReducer = predicate => combineFn => (list, i) => predicate(i) ? combineFn(list, i) : list;

const inc = n => n + 1;
const isOdd = n => n % 2 == 1;
const sum = (total, n) => total + n;

const list = [2, 5, 8, 11, 14, 17, 20];

list
  .map(inc)
  .filter(isOdd)
  .reduce(sum);

// Standardise to all use reduce
list
  .reduce((acc, n) => acc.concat(inc(n)), [])
  .reduce((acc, n) => isOdd(n) ? acc.concat(n) : acc, [])
  .reduce((acc, n) => sum(acc, n));

// Use curried map and filter reducers, with a listCombination
const listCombination = (list, i) => list.concat(i);
list
  .reduce((acc, n) => mapReducer(inc)(listCombination)(acc, n), [])
  .reduce((acc, n) => filterReducer(isOdd)(listCombination)(acc, n), [])
  .reduce((acc, n) => sum(acc, n));

// Combine map and filter using compose - as they now have the same 'shape'
const transducer = compose(mapReducer(inc), filterReducer(isOdd));
list
  .reduce((acc, n) => transducer(listCombination)(acc, n), [])
  .reduce((acc, n) => sum(acc, n));

// Use sum as the listCombination after making point free
let test = list.reduce(transducer(sum), 0);
console.log(test);

test = transduce(transducer, sum, 0, list);
console.log(test);
