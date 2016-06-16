swagger-annotate
================

Package for reading code annotations in JS source files and generate
a valid swagger file.

## Install

```
$ npm install -g swagger-annotate
```

## Usage

```
$ swagger-annotate <path-to-directory-or-file> # will write swagger file to standard output
```

### Example

Given the following source code of typical Express app:
```
...
/**
 * @SwaggerPath
 *   /:
 *     get:
 *       summary: just a test route
 *       description: nothing to see here
 *       tags:
 *         - test
 *         - pet
 *       consumes:
 *         - application/json
 *       produces:
 *         - application/json
 *       responses:
 *         200:
 *           description: successful operation
 *           schema:
 *             $ref: "#/definitions/ApiResponse"
 */
router.get('/', function (req, res) {
    res.json(+new Date());
});
...
```

```
$ swagger-annotate test/sample.js > test/swagger.json
```
Will parse annotations in `test/sample.js` and output JSON file to `test/swagger.json`

## Test

```
$ npm test
```
(WIP, Not a real test yet)


## TODO

 + add tests
 + recursively read directories
