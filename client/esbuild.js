const esbuild = require('esbuild');
const yargs = require('yargs');
const dotenv = require('dotenv');

const options = yargs(process.argv).argv;

// Load environment file config
const dotenvOptions = {};
if (options.dev) {
  dotenvOptions.path = process.cwd() + '/.env.local';
}
const dotenvConfig = dotenv.config(dotenvOptions);
if (dotenvConfig.error) {
  throw dotenvConfig.error;
}

// defineGlobalVarsFromDotEnvConfig produces an object that is compatible with esbuild.BuildOptions.define
//  and converts each dot environment `[KEY]` to a `process.env.[KEY]`
function defineGlobalVarsFromDotEnvConfig (dotenvConfig) {
  const result = {};
  Object.keys(dotenvConfig.parsed).map(key => {
    result[`process.env.${key}`] = JSON.stringify(dotenvConfig.parsed[key]);
  });
  return result;
}

function getDistBuildOptions () {
  return {
    entryPoints: ['./build/js/main.js'],
    minify: true,
    bundle: true,
    sourcemap: false,
    target: 'es2020',
    outfile: './dist/js/main.js',
    define: Object.assign({
      'process.env.BASE_URL': '"/"',
      'process.env.NODE_ENV': '"production"',
      global: 'window',
    }, defineGlobalVarsFromDotEnvConfig(dotenvConfig)),
  };
}

function getDevBuildOptions () {
  return {
    entryPoints: ['./build/js/main.js'],
    bundle: true,
    sourcemap: true,
    target: 'es2020',
    outfile: './dev/js/main.js',
    define: Object.assign({
      'process.env.BASE_URL': '"/"',
      'process.env.NODE_ENV': '"development"',
      global: 'window',
    }, defineGlobalVarsFromDotEnvConfig(dotenvConfig)),
  };
}

function getDevServeOptions () {
  return {
    port: 8090,
    servedir: './dev/',
  };
}

async function main (options) {
  const promises = [];

  try {
    if (options.dev) {
      promises.push(esbuild.serve(getDevServeOptions(), getDevBuildOptions()));
    } else if (options.dist) {
      promises.push(esbuild.build(getDistBuildOptions()));
    }

    await Promise.all(promises);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
}

main(options);
