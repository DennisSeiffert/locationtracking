import { compare, equals } from "fable-core/Util";
import { intersectMany, create } from "fable-core/Set";
import { ofArray } from "fable-core/List";
import GenericComparer from "fable-core/GenericComparer";
export function equal(expected, actual) {
  return function (value) {
    value;
  };
}

function Structural_comparison_with_arrays_works() {
  var xs1 = new Int32Array([1, 2, 3]);
  var xs2 = new Int32Array([1, 2, 3]);
  var xs3 = new Int32Array([1, 2, 4]);
  {
    equal(true, equals(xs1, xs2));
  }
  {
    equal(false, equals(xs1, xs3));
  }
  {
    equal(true, !equals(xs1, xs3));
  }
  return equal(false, !equals(xs1, xs2));
}

export { Structural_comparison_with_arrays_works as Structural$20$comparison$20$with$20$arrays$20$works };

function Set_intersectMany_works() {
  var xs = create(ofArray([1, 2]), new GenericComparer(compare));
  var ys = create([2], new GenericComparer(compare));
  var zs = create(ofArray([2, 3]), new GenericComparer(compare));
  var ks = intersectMany(ofArray([xs, ys, zs]));
  return equal(true, ks.has(2) ? !(ks.has(1) ? true : ks.has(3)) : false);
}

export { Set_intersectMany_works as Set$2E$intersectMany$20$works };
//# sourceMappingURL=fable_domainModelTests.js.map