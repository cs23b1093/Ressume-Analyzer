export default {
  testEnvironment: "node",
  transform: {
    '^.+\.js$': 'babel-jest',
  },
  testMatch: ["**/src/tests/**/*.test.js"],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};