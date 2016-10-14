export default class MarkSense{
  constructor(){
  }

  // TODO: This can probably be done in a single loop 
  // but will do for a prototype for now.
  // TODO: generate n-grams for finding suggestions
  generateSnippetSuggestionTree(corpus){
    const lines = corpus.split(`\n`).filter(line => !(line === null || line.match(/^ *$/) !== null || line.indexOf('}') > -1))
      .map(l => { return {
        code: l.trim(),
        depth: this.depth(l)
      };
    });

    var chain = {};
    chain['__ROOT__'] = {
      depth: 0,
      children: [],
      parent: undefined
    };

    for(let i = 0; i < lines.length; i++){
      const line = lines[i],
            parent = this.getParentFromIndex(lines, i, line.depth);

      if(chain[line.code]){
        chain[parent.code].children.find((child) => child.code === line.code).count++;
      } else {
        chain[parent.code].children.push({
          code: line.code,
          probability: 0,
          count: 1
        });

        chain[line.code] = {
          depth: line.depth,
          parent: parent.code,
          children: []
        };
      }
    }

    Object.keys(chain).forEach(key => {
      const node = chain[key],
                  childrenCount = node.children.reduce((acc, curr) => {
                    return acc + curr.count;
                  }, 0);
      node.children.forEach(child => {
          child.probability = child.count / childrenCount;
        });
    });

    this.chain = chain;

    return chain;
  }

  getSnippetSuggestions(code){
    // TODO: generate n-grams and use them to find suggestions from partially typed lines

    return this.chain[code];
  }

  getParentFromIndex(lines, idx, currDepth){
    if(currDepth === 1){
      return { code: '__ROOT__', depth: 0};
    }

    // traverse backwards until a node is hit with less depth, it's parent
    for(let i = idx - 1; i >= 0; i--){
      if(lines[i].depth < currDepth){
        return lines[i];
      }
    }
  }

  depth(line){
    return line.split('  ').length;
  }
}