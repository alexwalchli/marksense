import * as acorn from 'acorn'

export default class MarkSense {

  // TODO: Lots of needed here not that API is defined
  generateSnippetTree (code) {
    let snippetTree = {}
    this.searchIndex = {}

    snippetTree.__ROOT__ = {
      depth: 0,
      parent: undefined,
      children: []
    }

    const linesOfCode = this.cleanAndParseCodeIntoLines(code)
    for (let i = 0; i < linesOfCode.length; i++) {
      const lineOfCode = linesOfCode[i]
      const parent = this.getParentFromIndex(linesOfCode, i, lineOfCode.depth)

      this.updateSearchIndex(lineOfCode, lineOfCode.ttokenizedCode)

      if (snippetTree[lineOfCode.tokenizedCode]) {
        if (snippetTree[parent.tokenizedCode].children.find((child) => child.tokenizedCode === lineOfCode.tokenizedCode)) {
          snippetTree[parent.tokenizedCode].children.find((child) => child.tokenizedCode === lineOfCode.tokenizedCode).count++
        } else {
          snippetTree[parent.tokenizedCode].children.push({
            tokenizedCode: lineOfCode.tokenizedCode,
            probability: 0,
            count: 1
          })
        }
      } else {
        snippetTree[parent.tokenizedCode].children.push({
          tokenizedCode: lineOfCode.tokenizedCode,
          probability: 0,
          count: 1
        })
        snippetTree[lineOfCode.tokenizedCode] = {
          tokenizedCode: lineOfCode.tokenizedCode,
          depth: lineOfCode.depth,
          parent: parent.tokenizedCode,
          children: []
        }
      }
    }

    Object.keys(snippetTree).forEach(key => {
      const node = snippetTree[key]
      const childrenCount = node.children.reduce((acc, curr) => {
        return acc + curr.count
      }, 0)
      node.children.forEach(child => {
        child.probability = child.count / childrenCount
      })
    })

    this.snippetTree = snippetTree

    return snippetTree
  }

  search (code) {
    return this.searchIndex[code] || []
  }

  getParentFromIndex (linesOfCode, idx, currDepth) {
    if (currDepth === 1) {
      return { tokenizedCode: '__ROOT__', depth: 0, children: [] }
    }

    // traverse backwards until a node is hit with less depth, it's parent
    for (let i = idx - 1; i >= 0; i--) {
      if (linesOfCode[i].depth < currDepth) {
        return linesOfCode[i]
      }
    }
  }

  depth (code) {
    return code.split('  ').length
  }

  // Starting over
  newRootSnippet (rootKey) {
    this.rootKey = rootKey
    this.currentKey = rootKey
    this.currentSnippets = [ rootKey ]
  }

  // Moving right in intellisense
  getDeeperSnippet () {
    const currentSnippet = this.snippetTree[this.currentKey]
    const nextSnippet = currentSnippet.children[0]

    // TODO: If this path is at it's lowest depth', get the neighbor below it
    if (nextSnippet) {
      this.currentKey = nextSnippet.tokenizedCode
      this.currentSnippets.push(nextSnippet.tokenizedCode)
      return [...this.currentSnippets]
    } else {
      return [...this.currentSnippets]
    }
  }

  // Moving left in intellisense
  getShallowerSnippet () {
    if (this.currentSnippets.length > 1) {
      this.currentSnippets.splice(this.currentSnippets.length - 1, 1)
      this.currentKey = this.currentSnippets[this.currentSnippets.length - 1]
      return [...this.currentSnippets]
    } else {
      return [this.currentKey]
    }
  }

  // Moving down in intellisense
  getSnippetBelow () {
    const parent = this.snippetTree[this.snippetTree[this.currentKey].parent]
    const indexOfCurrentSnippet = parent.children.map(child => child.tokenizedCode).indexOf(this.currentKey)
    const neighbor = parent.children[indexOfCurrentSnippet + 1]

    if (neighbor) {
      this.currentSnippets.splice(this.currentSnippets.length - 1, 1) // remove the tail and then
      this.currentSnippets.push(neighbor.tokenizedCode) // add the snippet from one branch over
      this.currentKey = neighbor.tokenizedCode
    }

    return [...this.currentSnippets]
  }

  // Moving up in intellisense
  getSnippetAbove () {
    const parent = this.snippetTree[this.currentKey].parent

    this.currentSnippets.splice(this.currentSnippets.length - 1, 1) // remove the tail and then

    // const indexOfChild = parent.children.map(child => child.code).indexOf(this.currentKey)

    this.currentSnippets.push(this.snippetTree[parent.children(parent.children.indexOf(this.currentKey) - 1)]) // add the snippet from one branch over

    return [...this.currentSnippets]
  }

  unescapeHtml (str) {
    return str.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
  }

  isWhitespaceOrEmptyOrClosing (lineOfCode) {
    return lineOfCode === null || lineOfCode.match(/^ *$/) !== null || lineOfCode.indexOf('}') > -1
  }

  tokenizeLineOfCode (lineOfCode) {
    const tokens = [...acorn.tokenizer(lineOfCode)]
    let tokenizedCode = lineOfCode
    let tokenOffset = 0
    tokens.forEach(token => {
      if (token.type.label === 'name' || token.type.label === 'string') {
        let replaceToken = `{${token.type.label}}`
        tokenizedCode = tokenizedCode.slice(0, token.start + tokenOffset) + replaceToken + tokenizedCode.slice(token.end + tokenOffset, tokenizedCode.length)
        tokenOffset = tokenizedCode.length - lineOfCode.length
      }
    })

    return tokenizedCode
  }

  updateSearchIndex (lineOfCode) {
    const twoLetternGram = lineOfCode.code.substring(0, 2)
    const threeLetternGram = lineOfCode.code.substring(0, 3)
    this.searchIndex[twoLetternGram] = this.searchIndex[twoLetternGram] || []
    this.searchIndex[threeLetternGram] = this.searchIndex[threeLetternGram] || []
    if (this.searchIndex[twoLetternGram].indexOf(lineOfCode.tokenizedCode) === -1) {
      this.searchIndex[twoLetternGram].push(lineOfCode.tokenizedCode)
    }
    if (this.searchIndex[threeLetternGram].indexOf(lineOfCode.tokenizedCode) === -1) {
      this.searchIndex[threeLetternGram].push(lineOfCode.tokenizedCode)
    }
  }

  cleanAndParseCodeIntoLines (code) {
    if (!code) {
      return []
    }

    return this.unescapeHtml(code)
            .split('\n')
            .filter(loc => !this.isWhitespaceOrEmptyOrClosing(loc))
            .map(loc => {
              return {
                depth: this.depth(loc),
                code: loc.trim(),
                tokenizedCode: this.tokenizeLineOfCode(loc.trim())
              }
            })
  }
}
