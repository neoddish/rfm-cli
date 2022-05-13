#! /usr/local/bin/node

/* global require:writable */
/* eslint no-redeclare: ["error", { "builtinGlobals": false }] */
require = require('esm')(module /* , options */);
require('../lib/index.js').main();
