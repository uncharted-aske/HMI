// Resolve `@/components/example` imports found in `lang='ts'` files relative to the ./client directory, rather than
//  from the root directory.
// This is helpful if you want to open the root directory in VS code
//  without all .vue file imports throwing errors.
// Read more here:
// https://vuejs.github.io/vetur/guide/setup.html#advanced
// https://vuejs.github.io/vetur/reference/
/** @type {import('vls').VeturConfig} */
module.exports = {
  projects: ['./client']
};
