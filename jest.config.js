module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: [
    "<rootDir>/setup-jest.ts"
  ],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/cypress/",
    "<rootDir>/dist/",
    ],
  collectCoverageFrom: [
    "src/app/**/!(*.module*).ts",
  ],
  moduleNameMapper: {
    "@app/(.*)": "<rootDir>/src/app/\$1",
    "@assets/(.*)": "<rootDir>/src/assets/\$1",
    "@env": "<rootDir>/src/environments/environment",
    "^lodash-es\$": "lodash",
  }
}
