import { generate } from "../src/codegen";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";
import { transformElement } from "../src/transforms/transformElement";
import { transformExpression } from "../src/transforms/transformExpression";
import { transformText } from "../src/transforms/transformText";

describe("codegen", () => {
  it.skip("string", () => {
    const ast = baseParse("hi");
    transform(ast);
    const { code } = generate(ast);
    expect(code).toMatchSnapshot(); //快照 第一次执行会生成一个快照
  });

  it.skip("interpolation", () => {
    const ast = baseParse("{{message}}");
    transform(ast, {
      nodeTransforms: [transformExpression],
    });
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });

  it.skip("element", () => {
    const ast: any = baseParse("<div></div>");
    transform(ast, {
      nodeTransforms: [transformExpression,transformElement, transformText],
    });

    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });
  
  it("element3", () => {
    const ast: any = baseParse("<div>hi,{{message}}</div>");
    transform(ast, {
      nodeTransforms: [transformExpression,transformElement, transformText],
    });

    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });
});
