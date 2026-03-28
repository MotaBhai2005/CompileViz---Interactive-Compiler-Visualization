const KEYWORDS = new Set(['if','else','while','for','def','return','and','or','not','True','False','None','in','elif','break','continue','pass','import','from']);

export function tokenize(src) {
  const tokens = [];
  const lines = src.split('\n');
  let lineNo = 1;

  for (const line of lines) {
    // skip comments
    const commentIdx = line.indexOf('#');
    const code = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
    let j = 0;

    while (j < code.length) {
      const ch = code[j];

      // whitespace
      if (/\s/.test(ch)) { j++; continue; }

      // string
      if (ch === '"' || ch === "'") {
        let s = ch; j++;
        while (j < code.length && code[j] !== ch) { s += code[j]; j++; }
        s += ch; j++;
        tokens.push({ type: 'STRING', value: s, line: lineNo });
        continue;
      }

      // number
      if (/[0-9]/.test(ch) || (ch === '-' && /[0-9]/.test(code[j+1]) && (tokens.length === 0 || ['OPERATOR','PUNCTUATION'].includes(tokens[tokens.length-1]?.type)))) {
        let n = ch; j++;
        while (j < code.length && /[0-9.]/.test(code[j])) { n += code[j]; j++; }
        tokens.push({ type: 'NUMBER', value: n, line: lineNo });
        continue;
      }

      // identifier / keyword
      if (/[a-zA-Z_]/.test(ch)) {
        let w = ''; 
        while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) { w += code[j]; j++; }
        tokens.push({ type: KEYWORDS.has(w) ? 'KEYWORD' : 'IDENTIFIER', value: w, line: lineNo });
        continue;
      }

      // multi-char operators
      const two = code.slice(j, j+2);
      if (['==','!=','<=','>=','**','//','+=','-=','*=','/=','->'].includes(two)) {
        tokens.push({ type: 'OPERATOR', value: two, line: lineNo }); j += 2; continue;
      }

      // single-char operators
      if ('+-*/<>=!%&|^~'.includes(ch)) {
        tokens.push({ type: 'OPERATOR', value: ch, line: lineNo }); j++; continue;
      }

      // punctuation
      if ('(){}[],:;.'.includes(ch)) {
        tokens.push({ type: 'PUNCTUATION', value: ch, line: lineNo }); j++; continue;
      }

      // unknown
      tokens.push({ type: 'UNKNOWN', value: ch, line: lineNo }); j++;
    }

    lineNo++;
  }

  tokens.push({ type: 'EOF', value: 'EOF', line: lineNo });
  return tokens;
}
