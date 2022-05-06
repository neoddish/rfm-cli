#! /usr/local/bin/node
// TODO #! /usr/bin/env node

/* global require:writable */
/* eslint no-redeclare: ["error", { "builtinGlobals": false }] */
require = require('esm')(module /* , options */);
require('../lib/index.js').main();
