'use strict';
const fs = require('fs');
const assert = require('assert');
const doctrine = require('doctrine');
const yaml = require('js-yaml');
const merge = require('merge');

let apiDoc = Object.assign({}, require('./config').apiDoc);

// Refactor to separate module
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

function parseControllers(dir) {
    let files = fs.readdirSync(dir, 'utf-8');
    files.forEach(function (f) {
        // Only works with js files, for now
        if ((/\.js$/).test(f)) {
          readAnnotations(`${dir}/${f}`, (err, docs) => {
              assert.ifError(err);
              buildDocs(docs);
          });
        }
    });
}

parseControllers(`${__dirname}/test`);
console.log(JSON.stringify(apiDoc));
