'use strict'
const merge = require('merge');
const fs = require('fs');
const yaml = require('js-yaml');
const doctrine = require('doctrine');
const assert = require('assert');

let parser = {}
let apiDoc = {}

module.exports = exports = (doc) => {
  apiDoc = doc

  return parser
}

parser.buildDocs = (fragments) => {
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

parser.readAnnotations = (filePath, fn) => {
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

parser.parseSwaggerHeader = (data) => {
    merge(apiDoc, data);
}

parser.parseSwaggerTag = (data) => {
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
}

parser.parseSwaggerPath = (data) => {
    merge.recursive(apiDoc.paths, data);
}

parser.parseSwaggerDefinitions = (data) => {
    if (!apiDoc.definitions) {
        apiDoc.definitions = {};
    }
    merge(apiDoc.definitions, data);
}
