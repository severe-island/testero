module.exports = function(config) {
  config.set({
    testRunner: "mocha",
    mutator: "javascript",
    transpilers: [],
    reporter: ["html", "clear-text", "progress"],
    testFramework: "mocha",
    coverageAnalysis: "perTest",
    mutate: [
      "modules/**/*.js",
      "!modules/**/tests/api/*.js",
      "!modules/**/tests/unit/*.js"
    ],
    mochaOptions: {
      files: [
        'modules/**/tests/unit/*.js',
        'modules/**/tests/api/*.js'
      ],
      ui: 'bdd',
      timeout: 3000,
      require: [ "should" ],
      asyncOnly: false
  }
  });
};
