export class Parser {
  constructor(tokens) {
    this.tokens = tokens.filter(t => t.type !== 'EOF');
    this.pos = 0;
    this.nodeCount = 0;
  }

  nextId() { return ++this.nodeCount; }

  peek(offset=0) { return this.tokens[this.pos + offset] || { type:'EOF', value:'EOF' }; }
  consume() { return this.tokens[this.pos++] || { type:'EOF', value:'EOF' }; }

  expect(type, value) {
    const t = this.consume();
    if (t.type !== type && t.value !== value) throw new Error(`Expected ${value||type}, got '${t.value}'`);
    return t;
  }

  match(type, value) {
    const t = this.peek();
    if (value !== undefined) return t.value === value;
    return t.type === type;
  }

  parse() {
    const stmts = [];
    while (this.pos < this.tokens.length) {
      const s = this.parseStatement();
      if (s) stmts.push(s);
    }
    return { id: this.nextId(), type: 'Program', children: stmts };
  }

  parseStatement() {
    const t = this.peek();

    if (t.type === 'KEYWORD' && t.value === 'def') return this.parseFuncDef();
    if (t.type === 'KEYWORD' && t.value === 'if') return this.parseIf();
    if (t.type === 'KEYWORD' && t.value === 'while') return this.parseWhile();
    if (t.type === 'KEYWORD' && t.value === 'return') return this.parseReturn();
    if (t.type === 'KEYWORD' && t.value === 'for') return this.parseFor();

    // assignment or expression
    if (t.type === 'IDENTIFIER' && this.peek(1).value === '=') {
      const name = this.consume().value;
      this.consume(); // =
      const val = this.parseExpr();
      // Changed to Assignment with Identifier to match Option 1/3 layout
      return { id: this.nextId(), type: 'Assignment', name, children: [
        { id: this.nextId(), type: 'Identifier', name, children: [] },
        val
      ] };
    }

    return this.parseExpr();
  }

  parseFuncDef() {
    this.consume(); // def
    const name = this.consume().value;
    this.consume(); // (
    const params = [];
    while (this.peek().value !== ')') {
      params.push({ id: this.nextId(), type: 'Param', name: this.consume().value, children:[] });
      if (this.peek().value === ',') this.consume();
    }
    this.consume(); // )
    if (this.peek().value === ':') this.consume();
    const body = this.parseBlock();
    return { id: this.nextId(), type: 'FuncDef', name, children: [...params, ...body] };
  }

  parseIf() {
    this.consume(); // if
    const cond = this.parseExpr();
    if (this.peek().value === ':') this.consume();
    const thenBlock = this.parseBlock();
    const node = { id: this.nextId(), type: 'If', children: [{ id: this.nextId(), type: 'Cond', children: [cond] }, { id: this.nextId(), type: 'Then', children: thenBlock }] };
    if (this.peek().value === 'else') {
      this.consume();
      if (this.peek().value === ':') this.consume();
      const elseBlock = this.parseBlock();
      node.children.push({ id: this.nextId(), type: 'Else', children: elseBlock });
    }
    return node;
  }

  parseWhile() {
    this.consume();
    const cond = this.parseExpr();
    if (this.peek().value === ':') this.consume();
    const body = this.parseBlock();
    return { id: this.nextId(), type: 'While', children: [{ id: this.nextId(), type: 'Cond', children: [cond] }, { id: this.nextId(), type: 'Body', children: body }] };
  }

  parseReturn() {
    this.consume();
    const val = this.pos < this.tokens.length ? this.parseExpr() : null;
    return { id: this.nextId(), type: 'Return', children: val ? [val] : [] };
  }

  parseFor() {
    this.consume();
    const v = this.consume().value;
    this.consume(); // in
    const iter = this.parseExpr();
    if (this.peek().value === ':') this.consume();
    const body = this.parseBlock();
    return { id: this.nextId(), type: 'For', varName: v, children: [iter, ...body] };
  }

  parseBlock() {
    const stmts = [];
    let count = 0;
    while (this.pos < this.tokens.length && count < 8) {
      const s = this.parseStatement();
      if (s) { stmts.push(s); count++; }
      else break;
      const next = this.peek();
      if (next.type === 'KEYWORD' && ['def','if','while','else','elif'].includes(next.value)) break;
    }
    return stmts;
  }

  parseExpr() { return this.parseComparison(); }

  parseComparison() {
    let left = this.parseAddSub();
    while (['<','>','==','!=','<=','>='].includes(this.peek().value)) {
      const op = this.consume().value;
      const right = this.parseAddSub();
      left = { id: this.nextId(), type: 'BinOp', op, children: [left, right] };
    }
    return left;
  }

  parseAddSub() {
    let left = this.parseMulDiv();
    while (['+','-'].includes(this.peek().value) && this.peek().type === 'OPERATOR') {
      const op = this.consume().value;
      const right = this.parseMulDiv();
      left = { id: this.nextId(), type: 'BinOp', op, children: [left, right] };
    }
    return left;
  }

  parseMulDiv() {
    let left = this.parseUnary();
    while (['*','/','//','%','**'].includes(this.peek().value)) {
      const op = this.consume().value;
      const right = this.parseUnary();
      left = { id: this.nextId(), type: 'BinOp', op, children: [left, right] };
    }
    return left;
  }

  parseUnary() {
    if (this.peek().value === '-' && this.peek().type === 'OPERATOR') {
      this.consume();
      const val = this.parsePrimary();
      return { id: this.nextId(), type: 'UnaryOp', op: '-', children: [val] };
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const t = this.peek();

    if (t.value === '(') {
      this.consume();
      const e = this.parseExpr();
      this.consume(); // )
      return e;
    }

    if (t.type === 'NUMBER') {
      this.consume();
      return { id: this.nextId(), type: 'NumberLiteral', value: parseFloat(t.value), children: [] };
    }

    if (t.type === 'STRING') {
      this.consume();
      return { id: this.nextId(), type: 'StringLiteral', value: t.value, children: [] };
    }

    if (t.type === 'KEYWORD' && ['True','False','None'].includes(t.value)) {
      this.consume();
      return { id: this.nextId(), type: 'Literal', value: t.value, children: [] };
    }

    if (t.type === 'IDENTIFIER') {
      const name = this.consume().value;
      if (this.peek().value === '(') {
        this.consume();
        const args = [];
        while (this.peek().value !== ')' && this.pos < this.tokens.length) {
          args.push(this.parseExpr());
          if (this.peek().value === ',') this.consume();
        }
        this.consume();
        return { id: this.nextId(), type: 'Call', name, children: args };
      }
      return { id: this.nextId(), type: 'Identifier', name, children: [] };
    }

    this.consume();
    return { id: this.nextId(), type: 'Unknown', value: t.value, children: [] };
  }
}
