import { NODE_COLORS } from '../utils/constants'

function TokensPanel({ tokens }) {
  if (!tokens || tokens.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔤</div>
        <div>Write code and hit Compile to begin</div>
      </div>
    )
  }

  const tokenCount = tokens.filter(t => t.type !== 'EOF').length

  return (
    <div className="phase-content">
      <div className="tokens-wrap">
        {tokens.map((token, i) => (
          <div
            key={i}
            className={`token ${token.type}`}
            style={{ animationDelay: `${i * 20}ms` }}
            title={`Line ${token.line} — ${token.type}: "${token.value}"`}
          >
            <span>{token.value}</span>
            <span className="type-label">{token.type}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '12px' }}>
        {tokenCount} tokens
      </div>
    </div>
  )
}

function buildASTString(n, depth = 0, isLast = true, prefix = '') {
  const color = NODE_COLORS[n.type] || '#6b7280'
  let connector = ''
  if (depth > 0) connector = isLast ? '└── ' : '├── '
  
  let typeName = n.type
  let valPart = ''
  if (n.type === 'NumberLiteral') valPart = ': ' + n.value
  else if (n.type === 'StringLiteral') valPart = ': "' + n.value + '"'
  else if (n.type === 'Literal') valPart = ': ' + n.value
  else if (n.type === 'Identifier') valPart = ': ' + n.name
  
  let line = `${prefix}<span style="color:var(--border2)">${connector}</span><span style="color:${color};font-weight:700">${typeName}${valPart ? ':' : ''}</span>`
  if (valPart) {
    line += `<span style="color:var(--text)">${valPart.substring(1)}</span>`
  }
  line += '\n'
  
  let fakePrefix = prefix + (depth > 0 ? (isLast ? '    ' : '│   ') : '')
  if (n.type === 'Assign') {
    let fakeConnector = n.children && n.children.length === 0 ? '└── ' : '├── '
    line += `${fakePrefix}<span style="color:var(--border2)">${fakeConnector}</span><span style="color:#ff6b6b;font-weight:700">Identifier:</span><span style="color:var(--text)"> ${n.name}</span>\n`
  }

  if (n.children && n.children.length > 0) {
    n.children.forEach((child, idx) => {
      line += buildASTString(child, depth + 1, idx === n.children.length - 1, fakePrefix)
    })
  }
  return line
}

function ASTPanel({ ast }) {
  if (!ast) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🌲</div>
        <div>AST will render here</div>
      </div>
    )
  }

  const htmlOutput = buildASTString(ast)
  const nodeCount = countNodes(ast)

  return (
    <div className="phase-content" style={{ position: 'relative', padding: '0' }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '13px',
          padding: '16px',
          margin: '0',
          lineHeight: '1.6',
          overflow: 'auto',
          whiteSpace: 'pre',
        }}
        dangerouslySetInnerHTML={{ __html: htmlOutput }}
      />
      <div style={{ fontSize: '10px', color: 'var(--muted)', padding: '12px 20px' }}>
        {nodeCount} nodes
      </div>
    </div>
  )
}

function countNodes(n) {
  if (!n) return 0
  return 1 + (n.children ? n.children.reduce((sum, c) => sum + countNodes(c), 0) : 0)
}

function AssemblyPanel({ instructions }) {
  if (!instructions || instructions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚡</div>
        <div>Assembly output will appear here</div>
      </div>
    )
  }

  return (
    <div className="phase-content">
      <div className="asm-wrap">
        {instructions.map((instr, i) => (
          <div key={i} className="asm-line">
            <div className="asm-line-num">{i}</div>
            <div className="asm-op">{instr.op}</div>
            <div>
              {instr.arg && <span className="asm-arg">{instr.arg}</span>}
              {instr.comment && (
                <span className="asm-comment" style={{ marginLeft: '12px' }}>
                  // {instr.comment}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '12px' }}>
        {instructions.length} instructions
      </div>
    </div>
  )
}

export default function OutputPanels({ tokens, ast, instructions, error }) {
  return (
    <div className="output-panel">
      <div className="pipeline">
        <div className="pip-step">📝 Source</div>
        <div className="pip-arrow">→</div>
        <div className="pip-step">🔤 Tokens</div>
        <div className="pip-arrow">→</div>
        <div className="pip-step">🌲 AST</div>
        <div className="pip-arrow">→</div>
        <div className="pip-step">⚡ Instructions</div>
      </div>

      {error && <div className="error-msg">⚠ {error}</div>}

      <div className="phase-panels">
        {/* PHASE 1: TOKENS */}
        <div className="phase-panel phase-1">
          <div className="phase-label">
            <span style={{ color: 'var(--token-kw)' }}>Phase 1</span>
            <span className="badge">Lexical Analysis</span>
          </div>
          <div className="legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--token-kw)' }}></div>
              Keyword
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--token-id)' }}></div>
              Identifier
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--token-num)' }}></div>
              Number
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--token-op)' }}></div>
              Operator
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--token-str)' }}></div>
              String
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--token-punc)' }}></div>
              Punctuation
            </div>
          </div>
          <TokensPanel tokens={tokens} />
        </div>

        {/* PHASE 2: AST */}
        <div className="phase-panel phase-2">
          <div className="phase-label">
            <span style={{ color: 'var(--accent)' }}>Phase 2</span>
            <span className="badge">Abstract Syntax Tree</span>
          </div>
          <div style={{ padding: '6px 16px', background: 'rgba(79,255,176,0.05)', borderBottom: '1px solid var(--border)', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.5px' }}>
            💡 <strong>Click nodes to collapse</strong> • <strong>Hover for details</strong>
          </div>
          <ASTPanel ast={ast} />
        </div>

        {/* PHASE 3: INSTRUCTIONS */}
        <div className="phase-panel phase-3">
          <div className="phase-label">
            <span style={{ color: 'var(--accent3)' }}>Phase 3</span>
            <span className="badge">Code Generation</span>
          </div>
          <AssemblyPanel instructions={instructions} />
        </div>
      </div>

      <div className="status-bar">
        <div className="status-item">
          <div className="status-dot"></div>
          <span>{error ? '⚠ Error' : tokens.length > 0 ? '✓ Ready' : 'Ready — select an example or write code'}</span>
        </div>
      </div>
    </div>
  )
}
