#!/usr/bin/env node

'use strict';
const fs = require('fs');
const assert = require('assert');
const doctrine = require('doctrine');
const yaml = require('js-yaml');
const merge = require('merge');

let config = Object.assign({}, require('../config'));
let apiDoc = Object.assign({}, config.apiDoc);

let parser = {
      parseSwaggerHeader: function (data) {
          merge(apiDoc, data);
      },

      parseSwaggerTag: function (data) {
          let tags;

          if (!apiDoc.tags || !apiDoc.tags.length) {
              apiDoc.tags = [];
          }
          tags = apiDoc.tags;

          Object.keys(data).forEach(function (tagName) {
              let hasTag,
                  newTag;

              hasTag = tags.some(function (item) {
                  return (tagName === item.name);
              });

              if (!hasTag) {
                  newTag = data[tagName];
                  newTag.name = tagName;
                  tags.push(newTag);
              }
          });
      },
      parseSwaggerPath: function (data) {
          merge.recursive(apiDoc.paths, data);
      },
      parseSwaggerDefinitions: function (data) {
          if (!apiDoc.definitions) {
              apiDoc.definitions = {};
          }
          merge(apiDoc.definitions, data);
      }
  };



let readAnnotations = (filePath, fn) => {
  let file = fs.readFileSync(filePath, 'utf8');
  let js = file.toString(),
  regex = /\/\*\*([\s\S]*?)\*\//gm,
  fragments = js.match(regex),
  docs = [],
  i,
  fragment,
  doc;

  if (!fragments) {
    fn(null, docs);
    return;
  }

  for (i = 0; i < fragments.length; i += 1) {
    fragment = fragments[i];
    doc = doctrine.parse(fragment, {
      unwrap: true
    });

    docs.push(doc);

    if (i === fragments.length - 1) {
      fn(null, docs);
    }
  }
}

let buildDocs = (fragments) => {
  let fn;
  fragments.forEach(function (fragment) {
      fragment.tags.forEach(function (tag) {
          if (/^Swagger[a-zA-Z]+/.test(tag.title)) {
              fn = parser['parse' + tag.title];
              assert.equal(typeof fn, 'function', 'Invalid Section ' + tag.title);
              try {
                  yaml.safeLoadAll(tag.description, fn);
              } catch (e) {
                  console.log(e)
              }
          }
      });
  });
}

let files = fs.readdirSync(config.files.src, 'utf-8');

files.forEach(file => {
    // Only works with js files, for now
    if ((/\.js$/).test(file)) {
      readAnnotations(`${config.files.src}/${file}`, (err, docs) => {
          assert.ifError(err);
          buildDocs(docs);
      });
    }
});


fs.writeFileSync(config.files.dest, JSON.stringify(apiDoc))
