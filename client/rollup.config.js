'use strict';
const path = require('path');
const pkg = require('./package.json');
const typescript = require('rollup-plugin-typescript2');
const vue = require('rollup-plugin-vue');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve').nodeResolve;
const json = require('@rollup/plugin-json');
const image = require('@rollup/plugin-image');
const globby = require('globby');
const copy = require('rollup-plugin-copy');
const alias = require('@rollup/plugin-alias');

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
  DEV: 'dev',
};

const outputDirs = {
  [types.BUILD]: path.resolve(__dirname, 'build'),
  [types.DIST]: path.resolve(__dirname, 'dist'),
  [types.DEV]: path.resolve(__dirname, 'build'),
};

function inputForType (type) {
  if (type === types.TEST) {
    return undefined;
  }

  const input = {};

  if (type === types.DIST) {
    input['js/main'] = 'build/js/main.js';
  } else if (type === types.BUILD || type === types.DEV) {
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
      dir: outputDirs[type],
      format: 'esm',
      sourcemap: type !== types.DIST,
      chunkFileNames: 'web_modules/[name].js',
      // paths: id => console.log(id),
    },
    external: type === types.BUILD || type === types.DEV ? Object.keys(pkg.dependencies).map(mod => new RegExp(`^${mod}`)) : null,
  };
}

function pluginsForType (type, env) {
  if (type === types.DIST) {
    return {
      plugins: [
        resolve({
          extensions,
          jsnext: true,
          browser: true,
          preferBuiltins: false,
        }),
        commonjs(),
        json(),
      ],
    };
  }

  return {
    plugins: [
      alias({
        entries: [
          {
            find: '@',
            replacement: path.resolve(__dirname, 'src'),
          },
        ],
      }),
      typescript({
        typescript: require('typescript'),
        cacheRoot: path.resolve(__dirname, '.rts2_cache'),
      }),
      vue({
        needMap: false,
        style: {
          preprocessOptions: {
            scss: {
              importer: [
                function (url) {
                  return {
                    file: url
                      .replace(/^~/, `${env === environments.DEV ? '../node_modules' : './node_modules'}/`)
                      .replace(/^@/, 'src'),
                  };
                },
              ],
            },
          },
        },
      }),
      json(),
      image(),
      // Copy files and folders, with glob support.
      copy({
        targets: [
          { src: 'src/static/*', dest: type === types.DEV ? 'dev' : 'dist' },
          { src: 'src/styles/*.css', dest: type === types.DEV ? 'dev/styles' : 'dist/styles' },
        ],
      }),
    ],
  };
}

function chunksForType (type) {
  if (type === types.BUILD || type === types.DEV) {
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

function generateClientConfig (type, env) {
  return Object.assign(
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
}

module.exports = function generator (args) {
  const config = [];

  let env = environments.DEV;
  if (process.env.NODE_ENV === environments.PROD) {
    env = environments.PROD;
  }

  let type = types.BUILD;
  if (args['config-dist']) {
    type = types.DIST;
  } else if (args['config-test']) {
    type = types.TEST;
  } else if (args['config-dev']) {
    type = types.DEV;
  }

  config.push(generateClientConfig(type, env));

  return config;
};
