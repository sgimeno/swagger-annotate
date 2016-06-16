#!/usr/bin/env node
'use strict';

const fs = require('fs');
const assert = require('assert');

let apiDoc = {
  swagger: '2.0',
  info: {
    title: null,
    version: null
  },
  paths: {}
}

const parser = require('../lib/parser')(apiDoc);

let entry = process.argv.slice(2)[0];
let files = fs.readdirSync(entry, 'utf-8');

process.stdout.on('error', process.exit);

files.forEach(file => {
    // Only works with js files, for now
    if ((/\.js$/).test(file)) {
      parser.readAnnotations(`${entry}/${file}`, (err, docs) => {
          assert.ifError(err);
          parser.buildDocs(docs);
      });
    }
});

const validator = require('../lib/validator')()

validator.validate(apiDoc)
  .then((isValid) => {
    process.stdout.write(JSON.stringify(apiDoc))
  })
  .catch((err) => {
    throw err
  })
