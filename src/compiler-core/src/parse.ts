import { NodeTypes } from "./ast";
const enum TagType {
    Start,
    End,
}
export function baseParse(content: string) {
    const context = createParseContext(content)
    return createRoot(parseChildren(context, []))
}

function parseChildren(context, ancestors) {

    const nodes: any = []
    while (!isEnd(context,ancestors)) {
        const s = context.source
        let node
        if (s.startsWith('{{')) {
            node = parseInterpolation(context)
        } else if (s[0] === '<') {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors)
            }
        }
        if (!node) {
            node = parseText(context)
        }
        nodes.push(node)
    }

    return nodes
}
function parseText(context) {
    let endIndex = context.source.length
    const endTokens = ['<', "{{"]
    // let length = context.source
    // 找到最近的endtoken
    for (let i = 0; i < endTokens.length; i++) {
        let index = context.source.indexOf(endTokens[i])
        if (index !== -1) {
            endIndex = Math.min(endIndex, index)
        }
    }

    let content = parseTextData(context, endIndex)
    advanceBy(context, endIndex)
    return {
        type: NodeTypes.TEXT,
        content: content,
    }
}
function parseElement(context, ancestors) {
    const element: any = parseTag(context, TagType.Start)
    ancestors.push(element)
    element.children = parseChildren(context, ancestors)
    ancestors.pop()
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, TagType.End);
      } else {
        throw new Error(`miss tag:${element.tag}`);
      }
    return {
        type: element?.type,
        tag: element?.tag,
        children: element.children,
    }
}
function parseInterpolation(context) {
    // {{text}}
    // 插值处理
    const openDelimiter = "{{"
    const closeDelimiter = "}}"
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)
    advanceBy(context, 2)
    const rawContentLength = closeIndex - openDelimiter.length
    const rawContent = parseTextData(context, rawContentLength)
    const content = rawContent.trim()
    console.log(context.source)
    advanceBy(context, rawContentLength + closeDelimiter.length)
    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content,
        }
    }
}

function parseTextData(context: any, rawContentLength: number) {
    return context.source.slice(0, rawContentLength)
}

function createParseContext(content: string) {
    return {
        source: content
    }
}
function createRoot(children) {
    return { children,type:NodeTypes.ROOT }
}

function advanceBy(context: any, length: number) {
    context.source = context.source.slice(length)
}
function isEnd(context,ancestors) {
    //context.source消费完
    //出现结束标志</
    // 结束时ancestors中的结束节点要相同
    const s = context.source;
    if (s.startsWith("</")) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            if (startsWithEndTagOpen(s, tag)) {
                return true;
            }
        }
    }
    return !s;
}
function startsWithEndTagOpen(source, tag) {
    return (
        source.startsWith("</") &&
        source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
    );
}
function parseTag(context: any, type: TagType) {
    const match: any = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1];//括号中的内容
    advanceBy(context, match[0].length); //match[0] 是<div 没有>所以后面还要再推进1位
    advanceBy(context, 1);

    if (type === TagType.End) return;

    return {
        type: NodeTypes.ELEMENT,
        tag,
    };

}