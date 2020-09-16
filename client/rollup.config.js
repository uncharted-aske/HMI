'use strict';
const path = require('path');
const typescript = require('rollup-plugin-typescript2');
const sourceMaps = require('rollup-plugin-sourcemaps');
const vue = require('rollup-plugin-vue');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve').nodeResolve;
const replace = require('@rollup/plugin-replace');
const globby = require('globby');
const server = require('live-server');
const copy = require('rollup-plugin-copy');

const buildDir = path.resolve(__dirname, 'dist');
const clientDir = path.resolve(buildDir, 'scripts');

const extensions = [
  '.js', '.jsx', '.ts', '.tsx',
];

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

function generateClientConfig (startDevServer = false) {
  const input = {};
  globby.sync([
    path.join('src/', '/**/*.ts'),
    `!${path.join('src/', '/**/*.d.ts')}`,
    path.join('src/', '/**/*.vue'),
  ]).forEach(file => {
    const parsed = path.parse(file);
    input[path.join(parsed.dir.substr('src/'.length), parsed.ext === '.vue' ? parsed.base : parsed.name)] = file;
  });

  const config = {
    input: input,
    treeshake: true,

    output: {
      dir: clientDir,
      format: 'esm',
      sourcemap: startDevServer,
      chunkFileNames: 'dependencies/[name].js',
      // paths: id => console.log(id),
    },

    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
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
      }),
      copy({
        targets: [
          { src: 'src/static/*', dest: 'dist' },
        ],
      }),
    ],

    watch: {
      clearScreen: false,
    },

    manualChunks (id) {
      if (id.includes('tslib.js')) {
        return 'tslib';
      }

      if (id.includes('node_modules/')) {
        const parsed = path.parse(id);
        const folders = parsed.dir.split('/');
        while (folders.shift() !== 'node_modules') {}
        if (folders.length > 1 && folders[0].startsWith('@')) {
          return `${folders[0]}/${folders[1]}`;
        }
        return folders[0];
      }

      if (!path.isAbsolute(id)) {
        return id;
      }
    },
  };

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
      watch: [path.resolve(__dirname, 'dist/scripts')],
      mount: [
        ['/scripts', path.resolve(__dirname, 'dist/scripts')],
      ],
    }));
  }

  return config;
}

module.exports = function generator (args) {
  const config = [];
  config.push(generateClientConfig(args['config-dev-server']));

  return config;
};
