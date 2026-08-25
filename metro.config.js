const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// These workspace-mounted directories are not application source files. Metro's
// fallback watcher cannot subscribe to them, so exclude them from discovery.
config.resolver.blockList = [
  ...config.resolver.blockList,
  /[/\\]\.agents(?:[/\\].*)?$/,
  /[/\\]\.codex(?:[/\\].*)?$/,
];

module.exports = config;
