// Exports a file's text as a string. Used inline by remark-examples, with `!!` so no other
// loader compiles the file first: the code shown under an example is the file exactly as written.
module.exports = function rawSourceLoader(source) {
  return `export default ${JSON.stringify(source)};`;
};
