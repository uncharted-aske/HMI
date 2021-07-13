const esbuild = require('esbuild');
const yargs = require('yargs');
const dotenv = require('dotenv');

const options = yargs(process.argv).argv;

// Load environment file config
const dotenvOptions = {};
if (options.dev) {
  dotenvOptions.path = process.cwd() + '/.env.local';
} else if (options.dist) {
  dotenvOptions.path = process.cwd() + '/.env.dist';
}
const dotenvConfig = dotenv.config(dotenvOptions);
if (dotenvConfig.error && dotenvConfig.error.code === 'ENOENT') {
  // eslint-disable-next-line no-console
  console.warn('WARNING: No environment file found. Default environment variables will be used.');
} else if (dotenvConfig.error) {
  throw dotenvConfig.error;
}

const DEFAULT_ENV_VARS = {
  'process.env.COSMOS_API_KEY': undefined,
  'process.env.S3_ACCESS_KEY_ID': undefined,
  'process.env.S3_SECRET_ACCESS_KEY': undefined,
  'process.env.S3_ENDPOINT': undefined,
  'process.env.S3_BUCKET': undefined,
  'process.env.DONU_ENDPOINT': undefined,
  'process.env.S3_GRAFER_KNOWLEDGE_GRAPHS': undefined,
  'process.env.S3_BGRAPH_KNOWLEDGE_GRAPHS': undefined,
  'process.env.S3_BGRAPH_MODELS': undefined,
};

// defineGlobalVarsFromDotEnvConfig produces an object that is compatible with esbuild.BuildOptions.define
//  and converts each dot environment `[KEY]` to a `process.env.[KEY]`
function defineGlobalVarsFromDotEnvConfig (dotenvConfig) {
  if (!dotenvConfig.parsed) return {};
  let result = {};
  Object.keys(dotenvConfig.parsed).map(key => {
    result[`process.env.${key}`] = JSON.stringify(dotenvConfig.parsed[key]);
  });
  result = Object.assign(DEFAULT_ENV_VARS, result);
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
