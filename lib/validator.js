'use strict'

const swaggerTools = require('swagger-tools')
const spec = swaggerTools.specs.v2

let validator = {}

module.exports = exports = () => {
  return validator
}

validator.validate = (swaggerObject) => {
  return new Promise((resolve, reject) => {
    spec.validate(swaggerObject, function (err, result) {
      if (err) {
        reject(err)
      }

      if (typeof result !== 'undefined') {
        if (result.errors.length > 0) {
          console.log('The Swagger document is invalid...');

          console.log('');

          console.log('Errors');
          console.log('------');

          result.errors.forEach(function (err) {
            console.log('#/' + err.path.join('/') + ': ' + err.message);
          });

          console.log('');
        }

        if (result.warnings.length > 0) {
          console.log('Warnings');
          console.log('--------');

          result.warnings.forEach(function (warn) {
            console.log('#/' + warn.path.join('/') + ': ' + warn.message);
          });
        }

        console.log('Validator CB::', result.errors);
        if (result.errors.length > 0) {
          process.exit(1);
          resolve(true)
        }
      } else {
        // Swagger document is valid
        resolve(true)
      }
    });
  })
}
