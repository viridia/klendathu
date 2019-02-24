module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    "^.+\\.(css|png|jpg)$": "jest-transform-stub",
  },
  globals: {
    'ts-jest': {
      'tsConfig': '<rootDir>/tsconfig.json'
    }
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  testEnvironment: 'node',
  roots: [
    './src',
  ],
  setupFilesAfterEnv: [
    'expect-more-jest',
    '<rootDir>/src/tests/setup.ts',
    '../node_modules/jest-enzyme/lib/index.js'
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
  ]
}
