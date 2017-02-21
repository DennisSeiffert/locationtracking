var express = require('express');
const MappingService = require('../src/MappingService')
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/:mappingId', function(req, res, next){
  var transformations = [{
                                version : 1.0, 
                                forward : function (input) { return { name1 : input.key } },
                                backward : function (input) { return { key : input.name1 } }
                            },
                            {
                                version : 2.0, 
                                forward : function (input) { return { name2 : input.name1 } },
                                backward : function (input) { return { name1 : input.name2 } }
                            } 
                            ];
  var mappingService = new MappingService(transformations);
  var mappingId = req.params.mappingId;
  var targetVersion = req.headers.targetversion !== undefined ? req.headers.targetversion : mappingService.MaxVersion;
  var sourceVersion = req.headers.sourceversion !== undefined ? req.headers.sourceversion : mappingService.MaxVersion;
  var input = req.body.input;  
  var output = mappingService.transform(input, sourceVersion, targetVersion);
  return res.json(output);
});

module.exports = router;