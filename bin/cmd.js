#!/usr/bin/env node
'use strict';

const fs = require('fs')
const assert = require('assert')
const validator = require('../lib/validator')()

let apiDoc = {
  swagger: '2.0',
  info: {
    title: null,
    version: null
  },
  paths: {}
}

const parser = require('../lib/parser')(apiDoc)

let parseFile = (entry, file) => {
    // Only works with js files, for now
    if ((/\.js$/).test(file)) {
      parser.readAnnotations(`${entry}/${file}`, (err, docs) => {
          assert.ifError(err)
          parser.buildDocs(docs)
      })
    }
}

let entry = process.argv.slice(2)[0];
let stat = fs.lstatSync(entry)
let files = []

process.stdout.on('error', process.exit)

if (stat.isDirectory()) {
  files = fs.readdirSync(entry, 'utf-8')
  files.forEach(file => {
    parseFile(entry, file)
  })
} else if (stat.isFile()) {
  parseFile('.', entry)
}




process.stdout.write(JSON.stringify(apiDoc))
// validator.validate(apiDoc)
//   .then((isValid) => {
//     process.stdout.write(JSON.stringify(apiDoc))
//   })
//   .catch((err) => {
//     throw err
//   })
