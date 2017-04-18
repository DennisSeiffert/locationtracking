#r "../../packages/FsUnit/lib/net45/FsUnit.NUnit.dll"
#r "../../packages/NUnit/lib/net45/nunit.framework.dll"
open FsUnit
open NUnit.Framework

[<TestFixture>]
module MyTests =

  // Convenience method
  let equal (expected: 'T) (actual: 'T) =
      Assert.AreEqual(expected, actual)

  [<Test>]
  let ``Structural comparison with arrays works``() =
    let xs1 = [| 1; 2; 3 |]
    let xs2 = [| 1; 2; 3 |]
    let xs3 = [| 1; 2; 4 |]
    equal true (xs1 = xs2)
    equal false (xs1 = xs3)
    equal true (xs1 <> xs3)
    equal false (xs1 <> xs2)
  
  [<Test>]
  let ``Set.intersectMany works``() =
      let xs = set [1; 2]
      let ys = Set.singleton 2
      let zs = set [2; 3]
      let ks = Set.intersectMany [xs; ys; zs] 
      (ks.Contains 2 && not(ks.Contains 1 || ks.Contains 3))
      |> equal true