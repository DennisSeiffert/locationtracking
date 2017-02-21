// var transform = function(input){
//       var result = [];
//       for(var i = 0; i < input.length;i++){
//          result.push(input[i]);
//          for(var j = 0; j < input[i].length; j++){
//            if(input[i][j].country !== undefined){
//              input[i][j].country = {name: input[i][j].country.id, value : input[i][j].country.value};
//            }
//          }
//       }
// }

module.exports = class MappingService {
    constructor(transformations){
        this.transformations = transformations;

        this.transformations.sort(function(a, b) { return a.version - b.version });

        this.MinVersion = this.transformations[0].version;
        this.MaxVersion = this.transformations[this.transformations.length - 1].version;
    }

    transform(input, currentVersion, targetVersion){                   
        var appliedTransformations = this.transformations.filter(function(v) {  
            return v.version >= Math.min(currentVersion, targetVersion) && v.version <= Math.max(currentVersion,targetVersion);
         });

        var output = input;

        if (currentVersion <= targetVersion){            
            appliedTransformations.forEach(function(transformation){
                output = transformation.forward(output);
            })
        }else{
            appliedTransformations = appliedTransformations.reverse();
            appliedTransformations.pop()
            appliedTransformations.forEach(function(transformation){
                output = transformation.backward(output);
            })
        }

        return output;
    }
}