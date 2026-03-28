import { useState, useCallback } from 'react'
import { tokenize } from './compiler/Lexer'
import { Parser } from './compiler/Parser'
import { CodeGen } from './compiler/CodeGen'
import { EXAMPLES, NODE_COLORS } from './utils/constants'
import Header from './components/Header'
import Editor from './components/Editor'
import OutputPanels from './components/OutputPanels'
import './App.css'

function App() {
  const [sourceCode, setSourceCode] = useState(EXAMPLES.arithmetic)
  const [tokens, setTokens] = useState([])
  const [ast, setAst] = useState(null)
  const [instructions, setInstructions] = useState([])
  const [error, setError] = useState('')
  const [activePhase, setActivePhase] = useState(1)

  const handleCompile = useCallback(() => {
    try {
      setError('')
      
      // Phase 1: Lexer
      const newTokens = tokenize(sourceCode)
      setTokens(newTokens)
      
      // Phase 2: Parser
      const parser = new Parser(newTokens)
      const newAst = parser.parse()
      setAst(newAst)
      
      // Phase 3: CodeGen
      const cg = new CodeGen()
      cg.generate(newAst)
      setInstructions(cg.instructions)
      
    } catch (err) {
      setError(err.message || 'Compilation error')
      console.error(err)
    }
  }, [sourceCode])

  const handleLoadExample = (exampleKey) => {
    setSourceCode(EXAMPLES[exampleKey])
  }

  return (
    <div className="app">
      <Header activePhase={activePhase} setActivePhase={setActivePhase} onCompile={handleCompile} />
      <div className="main">
        <Editor sourceCode={sourceCode} setSourceCode={setSourceCode} onLoadExample={handleLoadExample} />
        <OutputPanels tokens={tokens} ast={ast} instructions={instructions} error={error} activePhase={activePhase} />
      </div>
    </div>
  )
}

export default App
