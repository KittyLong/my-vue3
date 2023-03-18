import { isString } from "../../shared";
import { NodeTypes } from "./ast"
import {
  CREATE_ELEMENT_VNODE,
  helperMapName,
  TO_DISPLAY_STRING,
} from "./runtimeHelpers";

export function generate(ast) {
  const context = createCodegenContext()

  genFunctionPreamble(ast, context)
  const functionName = 'render'
  const args = ['_ctx', '_cache']
  const signature = args.join(', ')
  context.push(`function  ${functionName}(${signature}){`)
  context.push(`return `)
  genNode(ast.codegenNode, context)
  context.push('}')
  return {
    code: context.code
  }
}

function createCodegenContext() {
  let context = {
    code: '',
    push(str) {
      context.code += str
    },
    helper(key) {
      return `_${helperMapName[key]}`
    }
  }
  return context
}
function genNode(node: any, context: { code: string; push(str: any): void }) {
  // 
  switch (node.type) {
    case NodeTypes.TEXT:

      getText(node, context)
      break;
    case NodeTypes.INTERPOLATION:
      getInterpolation(node, context)
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);
      break;
  }
}

function getText(node: any, context: { code: string; push(str: any): void }) {
  context.push(`'${node.content}'`)
}

function getInterpolation(node: any, context) {
  const { push, helper } = context
  context.push(`${helper(TO_DISPLAY_STRING)}(`)
  genNode(node.content, context)
  push(')')
}
// 处理interplation引入前缀
function genFunctionPreamble(ast: any, context: { code: string; push(str: any): void }) {
  const aliasHelper = (s) => `${helperMapName[s]}:_${helperMapName[s]}`
  if (ast.helpers.length > 0) {
    context.push(
      `const { ${ast.helpers.map(aliasHelper).join(",")}} = Vue`
    )
  }
  context.push('\n')
  context.push('return ')
}

function genExpression(node: any, context: { code: string; push(str: any): void; }) {
  context.push(`${node.content}`);
}
function genElement(node, context) {
  const { push, helper } = context
  const { tag, children, props } = node
  push(`${helper(CREATE_ELEMENT_VNODE)}(`)
  genNodeList(genNullable([tag, props, children]), context)
  push(")");
}
function genCompoundExpression(node: any, context: { code: string; push(str: any): void; }) {
  const children = node.children
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (isString(child)) {
      context.push(child)
    } else {
      genNode(child, context)
    }
  }
}
function genNodeList(nodes, context) {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (isString(node)) {
      context.push(node)
    } else {
      genNode(node, context)
    }
    if (i < nodes.length - 1) {
      context.push(', ')
    }
  }

}
function genNullable(args: any[]): any {
  return args.map(arg => arg || 'null')
}

