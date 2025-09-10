module.exports = {
  extends: ['../../.eslintrc.js'],
  parserOptions: {
    project: './tsconfig.json',
  },
  ignorePatterns: [
    'src/generated/**/*',
    '*.js',
    '*.d.ts'
  ],
};