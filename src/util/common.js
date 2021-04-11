const { compareTwoStrings } = require('string-similarity');

/**
 * Pauses execution for given amount of seconds
 * @param sec - amount of seconds
 */
function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

/**
 * Checks whether given number is in range of base plus/minus step
 * @param number - number to check
 * @param base - base number to compare with
 * @param step - range for a number
 */
function isNumberInRage(number, base, step = 1) {
  return number >= base - step && number <= base + step;
}

/**
 * Lowercases strings and checks whether string 1 is equal to string 2 or
 * whether string 1 contains string 2 or
 * whether string similarity is more than 80%
 * @param a - string to compare
 * @param b - string to compare
 */
function checkStringSimilarity(a, b) {
  const first = a.toLocaleLowerCase();
  const second = b.toLocaleLowerCase();

  if (first === second) return true;

  return compareTwoStrings(first, second) >= 0.75;
}

module.exports = {
  sleep,
  isNumberInRage,
  checkStringSimilarity,
}
