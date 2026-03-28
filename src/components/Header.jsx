export default function Header({ activePhase, setActivePhase, onCompile }) {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">⚙</div>
        Compile<span>Viz</span>
      </div>

      <div className="header-tabs">
        {[1, 2, 3].map((phase) => (
          <div
            key={phase}
            className={`phase-tab ${activePhase === phase ? 'active' : ''}`}
            onClick={() => setActivePhase(phase)}
          >
            <span className="phase-num">{phase}</span>
            {phase === 1 && 'Lexer'}
            {phase === 2 && 'Parser'}
            {phase === 3 && 'Codegen'}
          </div>
        ))}
      </div>

      <button className="run-btn" onClick={onCompile}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <polygon points="2,1 11,6 2,11" />
        </svg>
        Compile
      </button>
    </header>
  )
}
