Package.describe({
  summary: "Utils for my app.",
  version: "1.0.0"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.0.1');
  api.addFiles('app:utils.js');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('app:utils');
  api.addFiles('app:utils-tests.js');
});
