export class CodeGen {
  constructor() {
    this.instructions = [];
    this.labelCount = 0;
  }

  label(prefix='L') { return `${prefix}${++this.labelCount}`; }

  emit(op, arg='', comment='') {
    this.instructions.push({ op, arg: String(arg), comment });
  }

  generate(node) {
    if (!node) return;
    switch(node.type) {
      case 'Program':
        this.emit('START', '', 'begin program');
        node.children.forEach(c => this.generate(c));
        this.emit('HALT', '', 'end program');
        break;
      case 'Assignment':
        this.generate(node.children[1]); // The value
        this.emit('STORE', node.name, `store → ${node.name}`);
        break;
      case 'NumberLiteral':
      case 'Number':
        this.emit('PUSH', node.value, `literal ${node.value}`);
        break;
      case 'StringLiteral':
      case 'String':
        this.emit('PUSHS', node.value, `string literal`);
        break;
      case 'Literal':
        this.emit('PUSH', node.value, `literal`);
        break;
      case 'Identifier':
        this.emit('LOAD', node.name, `load ${node.name}`);
        break;
      case 'BinOp': {
        this.generate(node.children[0]);
        this.generate(node.children[1]);
        const opMap = {'+':'ADD','-':'SUB','*':'MUL','/':'DIV','//':'IDIV','%':'MOD','**':'POW','<':'LT','>':'GT','==':'EQ','!=':'NEQ','<=':'LEQ','>=':'GEQ'};
        this.emit(opMap[node.op] || 'OP', node.op, `${node.op} operation`);
        break;
      }
      case 'UnaryOp':
        this.generate(node.children[0]);
        this.emit('NEG', '', 'negate');
        break;
      case 'If': {
        const elseL = this.label('ELSE');
        const endL = this.label('END');
        this.generate(node.children[0]); // Cond
        this.emit('JZ', elseL, 'jump if false');
        node.children[1].children.forEach(c => this.generate(c)); // Then
        this.emit('JMP', endL, 'skip else');
        this.emit('LABEL', elseL, '');
        if (node.children[2]) node.children[2].children.forEach(c => this.generate(c)); // Else
        this.emit('LABEL', endL, '');
        break;
      }
      case 'Cond':
        node.children.forEach(c => this.generate(c));
        break;
      case 'Then': case 'Else': case 'Body':
        node.children.forEach(c => this.generate(c));
        break;
      case 'While': {
        const startL = this.label('WHILE');
        const endL = this.label('WEND');
        this.emit('LABEL', startL, 'loop start');
        this.generate(node.children[0]); // Cond
        this.emit('JZ', endL, 'exit loop');
        node.children[1].children.forEach(c => this.generate(c)); // Body
        this.emit('JMP', startL, 'repeat');
        this.emit('LABEL', endL, 'loop end');
        break;
      }
      case 'FuncDef': {
        const endL = this.label('FEND');
        this.emit('JMP', endL, `skip func ${node.name}`);
        this.emit('FUNC', node.name, `function ${node.name}`);
        node.children.filter(c=>c.type==='Param').forEach((p,i) => this.emit('PARAM', p.name, `param ${i}: ${p.name}`));
        node.children.filter(c=>c.type!=='Param').forEach(c => this.generate(c));
        this.emit('RET', '', 'return');
        this.emit('LABEL', endL, '');
        break;
      }
      case 'Return':
        if (node.children[0]) this.generate(node.children[0]);
        this.emit('RET', '', 'return value');
        break;
      case 'Call':
        node.children.forEach(c => this.generate(c));
        this.emit('CALL', node.name, `call ${node.name}(${node.children.length} args)`);
        break;
      default:
        break;
    }
  }
}
