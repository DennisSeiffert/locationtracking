require('../node_modules/jasmine-core')
require('../node_modules/jasmine')
const MappingService = require('../src/MappingService')

describe('mapping service tests', function () {
    var transformations = [{
                                version : 1, 
                                forward : function (input) { return { name1 : input.key } },
                                backward : function (input) { return { key : input.name1 } }
                            },
                            {
                                version : 2, 
                                forward : function (input) { return { name2 : input.name1 } },
                                backward : function (input) { return { name1 : input.name2 } }
                            } 
                            ];

    it('should transform forward', function() {        
        var sut = new MappingService(transformations);
        var result = sut.transform({ key : 'keyValue'}, 0, 2);

        expect(result).toEqual({ name2 : 'keyValue'});
    });

    it('should transform backwards', function() {        
        var sut = new MappingService(transformations);
        var result = sut.transform({ name2 : 'keyValue'}, 2, 1);

        expect(result).toEqual({ name1 : 'keyValue'});
    });

    it('should remain on current version when target version equals current version', function() {        
        var sut = new MappingService(transformations);
        var result = sut.transform({ name2 : 'keyValue'}, 2, 2);

        expect(result).toEqual({ name2 : 'keyValue'});
    });
});
