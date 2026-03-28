import { useState } from 'react'
import { EXAMPLES } from '../utils/constants'

export default function Editor({ sourceCode, setSourceCode, onLoadExample }) {
  const lineCount = sourceCode.split('\n').length

  const handleScroll = (e) => {
    const lineNumsEl = e.currentTarget.parentElement.querySelector('.line-nums')
    if (lineNumsEl) {
      lineNumsEl.scrollTop = e.currentTarget.scrollTop
    }
  }

  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n')

  return (
    <div className="editor-panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <div className="dot dot-red"></div>
          <div className="dot dot-yellow"></div>
          <div className="dot dot-green"></div>
        </div>
        <span>source.toy</span>
      </div>

      <div className="editor-wrap">
        <pre className="line-nums">{lineNumbers}</pre>
        <textarea
          className="code-editor"
          value={sourceCode}
          onChange={(e) => setSourceCode(e.target.value)}
          onScroll={handleScroll}
          spellCheck="false"
          placeholder="// Write your code here...&#10;// Try one of the examples below"
        />
      </div>

      <div className="examples-bar">
        <span style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', alignSelf: 'center', marginRight: '4px' }}>
          Examples:
        </span>
        {Object.keys(EXAMPLES).map((key) => (
          <button
            key={key}
            className="example-btn"
            onClick={() => onLoadExample(key)}
          >
            {key === 'ifelse' ? 'if / else' : key === 'loop' ? 'while loop' : key}
          </button>
        ))}
      </div>
    </div>
  )
}
