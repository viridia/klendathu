module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      'tsConfig': '<rootDir>/tsconfig.json'
    }
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)$',
  testEnvironment: 'node',
  roots: [
    './src',
    './tests'
  ],
  setupFilesAfterEnv: [
    'expect-more-jest'
  ],
  moduleFileExtensions: [
    'ts',
    'js',
  ],
  reporters: [
    'default',
    'jest-junit',
  ],
}
