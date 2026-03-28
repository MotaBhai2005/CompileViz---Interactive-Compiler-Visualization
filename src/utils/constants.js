export const EXAMPLES = {
  arithmetic: `# Simple arithmetic
x = 10 + 3 * 2
y = (x - 4) / 2
z = x * y + 1`,

  variables: `# Variable assignments & expressions
name = "Alice"
age = 25
score = age * 4 + 10
result = score - age`,

  ifelse: `# Conditional logic
x = 15
if x > 10:
    y = x * 2
else:
    y = x + 5
z = y + 1`,

  loop: `# While loop
i = 0
total = 0
while i < 5:
    total = total + i
    i = i + 1`,

  function: `# Function definition & call
def add(a, b):
    return a + b

x = add(3, 4)
y = add(x, 10)`
};

export const NODE_COLORS = {
  Program: '#4fffb0', Assignment: '#c084fc', Assign: '#c084fc', BinOp: '#ff6b6b', 
  NumberLiteral: '#ffd93d', Number: '#ffd93d', StringLiteral: '#6bcbff', String: '#6bcbff', 
  Identifier: '#ff6b6b', Call: '#fb923c', FuncDef: '#f472b6',
  If: '#60a5fa', While: '#34d399', Return: '#f87171', Param: '#a3e635',
  Cond: '#94a3b8', Then: '#6ee7b7', Else: '#fca5a5', Body: '#93c5fd',
  Literal: '#fbbf24', UnaryOp: '#e879f9', For: '#4ade80', Unknown: '#6b7280'
};
