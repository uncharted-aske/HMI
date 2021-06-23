module.exports = {
  root: true,

  env: {
    browser: true,
    es2020: true,
    mocha: true,
    worker: true,
  },

  extends: [
    '@vue/standard',
  ],

  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      plugins: [
        '@typescript-eslint',
      ],
      extends: [
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'off',
        '@typescript-eslint/no-parameter-properties': 2,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-var-requires': 2,
        '@typescript-eslint/no-non-null-assertion': 2,
        '@typescript-eslint/no-use-before-define': 2,
        '@typescript-eslint/camelcase': 0,
        '@typescript-eslint/no-empty-interface': 2,
        '@typescript-eslint/explicit-function-return-type': 2,
        '@typescript-eslint/ban-ts-ignore': 0,
        '@typescript-eslint/no-inferrable-types': [2, {
          ignoreParameters: true,
          ignoreProperties: true,
        }],
      },
    },

    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      plugins: [
        'vue',
        '@typescript-eslint',
      ],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/essential',
      ],
      rules: {
        indent: 'off',
        'vue/script-indent': ['error', 2, { baseIndent: 1 }],
        '@typescript-eslint/no-parameter-properties': 2,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-var-requires': 2,
        '@typescript-eslint/no-non-null-assertion': 2,
        '@typescript-eslint/no-use-before-define': 2,
        '@typescript-eslint/camelcase': 0,
        '@typescript-eslint/no-empty-interface': 2,
        '@typescript-eslint/ban-ts-ignore': 0,
        '@typescript-eslint/no-inferrable-types': [2, {
          ignoreParameters: true,
          ignoreProperties: true,
        }],
        'new-cap': ['error',
          {
            capIsNewExceptions: [
              'Action',
              'Component',
              'Getter',
              'InjectReactive',
              'Mutation',
              'Prop',
              'PropSync',
              'ProvideReactive',
              'State',
              'Watch',
            ],
          },
        ],
      },
    },
  ],

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'err' : 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'err' : 'warn',
    // TODO: need discussion
    // enforce comma dangle
    'comma-dangle': [2, 'always-multiline'],
    // semicolon stuff
    'no-extra-semi': 2,
    'semi-spacing': [1, { before: false, after: true }],
    semi: [1, 'always'],
  },
};
