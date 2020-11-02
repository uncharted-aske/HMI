'use strict';
const path = require('path');
const typescript = require('rollup-plugin-typescript2');
const sourceMaps = require('rollup-plugin-sourcemaps');
const vue = require('rollup-plugin-vue');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve').nodeResolve;
const replace = require('@rollup/plugin-replace');
const json = require('@rollup/plugin-json');
const image = require('@rollup/plugin-image');
const globby = require('globby');
const server = require('live-server');
const copy = require('rollup-plugin-copy');
const alias = require('@rollup/plugin-alias');

const buildDir = path.resolve(__dirname, 'build');
const distDir = path.resolve(__dirname, 'dist');

const extensions = [
  '.js', '.jsx', '.ts', '.tsx',
];

// Environments configuration is being generated for
const environments = {
  DEV: 'development',
  PROD: 'production',
};

// Types of configurations to generate
const types = {
  BUILD: 'build',
  DIST: 'dist',
  TEST: 'test',
};

function liveServer (options = {}) {
  const defaultParams = {
    file: 'index.html',
    host: '0.0.0.0',
    logLevel: 2,
    open: false,
    port: 8080,
    root: '.',
    wait: 200,
  };

  const params = Object.assign({}, defaultParams, options);

  server.start(params);
  return {
    name: 'liveServer',
    generateBundle () {
      console.log(`live-server running on ${params.port}`);
    },
  };
}

function inputForType (type) {
  if (type === types.TEST) {
    return undefined;
  }

  const input = {};

  if (type === types.DIST) {
    input['js/main'] = 'build/js/main.js';
  } else if (type === types.BUILD) {
    globby.sync([
      path.join('src/', '/**/*.{ts,js}'),
      `!${path.join('src/', '/**/*.d.ts')}`,
      path.join('src/', '/**/*.vue'),
    ]).forEach(file => {
      const parsed = path.parse(file);
      input[path.join('js', parsed.dir.substr('src/'.length), parsed.ext === '.vue' ? parsed.base : parsed.name)] = file;
    });
  }

  return { input };
}

function outputForType (type) {
  if (type === types.TEST) {
    return {
      output: {
        format: 'iife',
        name: 'HMI',
        sourcemap: 'inline',
      },
    };
  }

  return {
    output: {
      dir: type === types.DIST ? distDir : buildDir,
      format: 'esm',
      sourcemap: type !== types.DIST,
      chunkFileNames: 'web_modules/[name].js',
      // paths: id => console.log(id),
    },
  };
}

function pluginsForType (type, env) {
  if (type === types.DIST) {
    return {
      plugins: [
        copy({
          targets: [
            { src: 'src/static/*', dest: 'dist' },
          ],
        }),
      ],
    };
  }

  return {
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.BASE_URL': JSON.stringify(process.env.BASE_URL),
      }),
      alias({
        entries: [
          { find: /^@\/(.*)$/, replacement: path.join(__dirname, 'src/', '$1') },
        ],
      }),
      resolve({
        extensions,
        jsnext: true,
        browser: true,
        preferBuiltins: false,
      }),
      commonjs(),
      typescript({
        typescript: require('typescript'),
        cacheRoot: path.resolve(__dirname, '.rts2_cache'),
      }),
      vue({
        needMap: false,
        style: {
          preprocessOptions: {
            scss: {
              includePaths: env === environments.DEV ? ['../node_modules'] : ['./node_modules'],
            },
          },
        },
      }),
      json(),
      image(),
    ],
  };
}

function chunksForType (type) {
  if (type === types.BUILD) {
    return {
      manualChunks: function (id) {
        if (id.includes('tslib.js')) {
          return 'tslib';
        }

        if (id.includes('node_modules/')) {
          const parsed = path.parse(id);
          const folders = parsed.dir.split('/');
          while (folders.shift() !== 'node_modules') {}
          if (folders.length > 1 && folders[0].startsWith('@')) {
            return path.join(folders[0], folders[1]);
          }
          return folders[0];
        }

        if (!path.isAbsolute(id)) {
          return id;
        }
      },
    };
  }

  return undefined;
}

function generateClientConfig (type, env, startDevServer = false) {
  const config = Object.assign(
    {
      treeshake: true,
      watch: {
        clearScreen: false,
      },
    },
    inputForType(type),
    outputForType(type),
    pluginsForType(type, env),
    chunksForType(type),
  );

  if (startDevServer) {
    config.plugins.push(sourceMaps());
    config.plugins.push(liveServer({
      port: 8090,
      host: '0.0.0.0',
      root: path.resolve(__dirname, 'src/static'),
      file: 'index.html',
      open: false,
      wait: 500,
      // proxy: [['/api', 'http://127.0.0.1:8080']], // not needed for now, used to proxy to the server API
      watch: [path.resolve(__dirname, 'build/js')],
      mount: [
        ['/js', path.resolve(__dirname, 'build/js')],
        ['/web_modules', path.resolve(__dirname, 'build/web_modules')],
      ],
    }));
  }

  return config;
}

module.exports = function generator (args) {
  const config = [];

  let type;
  if (args['config-dist']) {
    type = types.DIST;
  } else if (args['config-test']) {
    type = types.TEST;
  } else {
    type = types.BUILD;
  }

  let env;
  if (process.env.NODE_ENV === environments.PROD) {
    env = environments.PROD;
  } else {
    env = environments.DEV;
  }

  config.push(generateClientConfig(type, env, args['config-dev-server']));

  return config;
};
