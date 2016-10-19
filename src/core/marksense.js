import * as acorn from 'acorn'

export default class MarkSense {

  unescapeHtml (str) {
    return str.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
  }

  // TODO: Lots of needed here not that API is defined
  generateSnippetTree (corpus) {
    const lines = corpus.split(`\n`).filter(line => !(line === null || line.match(/^ *$/) !== null || line.indexOf('}') > -1))
      .map(l => {
        return {
          code: this.unescapeHtml(l.trim()),
          depth: this.depth(l)
        }
      })

    let snippetTree = {}
    this.searchIndex = {}

    snippetTree.__ROOT__ = {
      depth: 0,
      parent: undefined,
      children: []
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const parent = this.getParentFromIndex(lines, i, line.depth)
      const tokens = [...acorn.tokenizer(line.code)]
      const originalCode = line.code
      const originalCodeLength = originalCode.length

      let tokenOffset = 0
      tokens.forEach(token => {
        if (token.type.label === 'name' || token.type.label === 'string') {
          let replaceToken = `{${token.type.label}}`
          // TODO: tokenOffset is offseting to the left off by one because I'm offsetting on both sides'
          line.code = line.code.slice(0, token.start + tokenOffset) + replaceToken + line.code.slice(token.end + tokenOffset, line.code.length)
          tokenOffset = line.code.length - originalCodeLength
        }
      })

      const twoLetternGram = originalCode.substring(0, 2)
      const threeLetternGram = originalCode.substring(0, 3)
      this.searchIndex[twoLetternGram] = this.searchIndex[twoLetternGram] || []
      this.searchIndex[threeLetternGram] = this.searchIndex[threeLetternGram] || []
      if (this.searchIndex[twoLetternGram].indexOf(line.code) === -1) {
        this.searchIndex[twoLetternGram].push(line.code)
      }
      if (this.searchIndex[threeLetternGram].indexOf(line.code) === -1) {
        this.searchIndex[threeLetternGram].push(line.code)
      }

      if (snippetTree[line.code]) {
        if (snippetTree[parent.code].children.find((child) => child.code === line.code)) {
          snippetTree[parent.code].children.find((child) => child.code === line.code).count++
        } else {
          snippetTree[parent.code].children.push({
            code: line.code,
            probability: 0,
            count: 1
          })
        }
      } else {
        snippetTree[parent.code].children.push({
          code: line.code,
          probability: 0,
          count: 1
        })
        snippetTree[line.code] = {
          depth: line.depth,
          parent: parent.code,
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

  getParentFromIndex (lines, idx, currDepth) {
    if (currDepth === 1) {
      return { code: '__ROOT__', depth: 0 }
    }

    // traverse backwards until a node is hit with less depth, it's parent
    for (let i = idx - 1; i >= 0; i--) {
      if (lines[i].depth < currDepth) {
        return lines[i]
      }
    }
  }

  depth (line) {
    return line.split('  ').length
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
      this.currentKey = nextSnippet.code
      this.currentSnippets.push(nextSnippet.code)
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
      return []
    }
  }

  // Moving down in intellisense
  getSnippetBelow () {
    const parent = this.snippetTree[this.snippetTree[this.currentKey].parent]
    const indexOfCurrentSnippet = parent.children.map(child => child.code).indexOf(this.currentKey)
    const neighbor = parent.children[indexOfCurrentSnippet + 1]

    if (neighbor) {
      this.currentSnippets.splice(this.currentSnippets.length - 1, 1) // remove the tail and then
      this.currentSnippets.push(neighbor.code) // add the snippet from one branch over
      this.currentKey = neighbor.code
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
}
