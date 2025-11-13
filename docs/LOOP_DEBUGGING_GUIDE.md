# Guia Completo de Detecção e Resolução de Loops Infinitos

## 📋 Índice
1. [Causas Comuns](#causas-comuns)
2. [Ferramentas de Detecção](#ferramentas-de-detecção)
3. [Processo de Diagnóstico](#processo-de-diagnóstico)
4. [Padrões de Solução](#padrões-de-solução)
5. [Boas Práticas](#boas-práticas)
6. [Exemplos Práticos](#exemplos-práticos)

## 🔴 Causas Comuns de Loops Infinitos

### 1. useEffect sem Dependency Array ou com Dependências Instáveis

**Problema:**
\`\`\`tsx
// ❌ RUIM - Executa a cada render
useEffect(() => {
  setState(newValue)
})

// ❌ RUIM - Executa toda vez que obj muda (mesmo que valores sejam iguais)
useEffect(() => {
  setState(obj) // obj é criado novo a cada render
}, [obj])
\`\`\`

**Solução:**
\`\`\`tsx
// ✅ BOM - Executa apenas na montagem
useEffect(() => {
  setState(initialValue)
}, [])

// ✅ BOM - Compara valores específicos
useEffect(() => {
  setState(obj.value)
}, [obj.value])
\`\`\`

### 2. Atualizações de Estado Causando Re-renders que Gatilham Efeitos

**Problema:**
\`\`\`tsx
const [settings, setSettings] = useState({})

// Segunda renderização causa efeito ser executado novamente
useEffect(() => {
  // Isso desencadeia uma atualização que causa o efeito rodar de novo
  setSettings(newSettings) // settings muda, triggered effect again
}, [settings]) // settings é uma dependência
\`\`\`

**Solução:**
\`\`\`tsx
// Use ref para rastrear o que já foi salvo
const lastSavedRef = useRef<string>('')

useEffect(() => {
  const settingsKey = JSON.stringify(settings)
  
  // Só atualiza se realmente mudou
  if (settingsKey !== lastSavedRef.current) {
    localStorage.setItem('settings', settingsKey)
    lastSavedRef.current = settingsKey
  }
}, [settings])
\`\`\`

### 3. Callbacks Instáveis em useEffect

**Problema:**
\`\`\`tsx
// ❌ RUIM - Função criada a cada render
const handleUpdate = () => { ... }

useEffect(() => {
  handleUpdate()
}, [handleUpdate]) // Dependência muda toda renderização
\`\`\`

**Solução:**
\`\`\`tsx
// ✅ BOM - Callback estável
const handleUpdate = useCallback(() => { ... }, [])

useEffect(() => {
  handleUpdate()
}, [handleUpdate])
\`\`\`

## 🛠️ Ferramentas de Detecção

### 1. Loop Detector

Rastreia execução de funções em tempo real:

\`\`\`tsx
import { loopDetector } from '@/utils/loop-detector'

// Dentro de um contexto ou hook
useEffect(() => {
  const metrics = loopDetector.track('meu-efeito')
  
  // metrics.isLooping indica se há loop detectado
  if (metrics.severity === 'critical') {
    console.error('Loop crítico detectado!')
  }
})
\`\`\`

### 2. Call Counter

Monitora número de chamadas em uma janela de tempo:

\`\`\`tsx
import { useCallCounter } from '@/hooks/use-call-counter'

export function MeuComponente() {
  const { track, getCount } = useCallCounter({
    name: 'MeuComponente-render',
    maxCalls: 20,
    timeWindow: 1000,
    onThreshold: (count, limit) => {
      console.error(`Componente renderizou ${count} vezes em 1s!`)
    }
  })

  // Chamar no início do render
  track()

  return <div>...</div>
}
\`\`\`

### 3. Effect Tracker

Rastreia execuções de efeitos específicos:

\`\`\`tsx
import { useEffectTracker } from '@/hooks/use-effect-tracker'

export function MeuComponente() {
  const tracker = useEffectTracker({
    name: 'settings-effect',
    maxExecutions: 50,
    timeWindow: 5000
  })

  useEffect(() => {
    const start = performance.now()
    
    // seu código do efeito
    
    const duration = performance.now() - start
    tracker.recordExecution(duration)
    
    console.log(tracker.getReport())
  }, [])
}
\`\`\`

## 🔍 Processo de Diagnóstico

### Passo 1: Verificar Logs do Console

\`\`\`
[v0] ⚠️  Loop detectado em "settings-context": 45 chamadas em 100ms
[v0] 🔴 LOOP CRÍTICO em "settings-load": 150 chamadas em 100ms
\`\`\`

### Passo 2: Acessar Relatório do Loop Detector

\`\`\`tsx
// No console do navegador
import { loopDetector } from '@/utils/loop-detector'
console.table(loopDetector.getReport())
\`\`\`

Você verá:
\`\`\`
context              | totalCalls | callsInLastSecond | severity
settings-context     | 45         | 45               | high
theme-provider       | 12         | 2                | low
\`\`\`

### Passo 3: Rastrear o Fluxo

Adicione logs antes de setState:

\`\`\`tsx
useEffect(() => {
  console.log('[v0] About to setState in settings')
  setSettings(newSettings) // Onde o loop começa?
  console.log('[v0] After setState')
}, [settings]) // ← Esta é a causa provável
\`\`\`

### Passo 4: Verificar Dependencies

Use React DevTools para inspecionar:
- O que mudou entre renders
- Qual efeito foi disparado
- Qual setState foi chamado

## ✅ Padrões de Solução

### Pattern 1: Deduplicação com Refs

\`\`\`tsx
const lastSavedRef = useRef<string>('')

useEffect(() => {
  const key = JSON.stringify(state)
  
  if (key !== lastSavedRef.current) {
    save(state)
    lastSavedRef.current = key
  }
}, [state])
\`\`\`

### Pattern 2: Debouncing de Efeitos

\`\`\`tsx
useEffect(() => {
  const timer = setTimeout(() => {
    saveToLocalStorage(settings)
  }, 300)

  return () => clearTimeout(timer)
}, [settings])
\`\`\`

### Pattern 3: Atualização Condicional

\`\`\`tsx
const [data, setData] = useState(initial)

useEffect(() => {
  setData(prev => {
    const newData = calculateNewData()
    
    // Só atualiza se realmente mudou
    if (JSON.stringify(prev) === JSON.stringify(newData)) {
      return prev
    }
    return newData
  })
}, [])
\`\`\`

### Pattern 4: Separar Efeitos

\`\`\`tsx
// ✅ BOM - Efeitos separados com responsabilidades claras
useEffect(() => {
  loadFromStorage()
}, []) // Só carrega uma vez

useEffect(() => {
  savePendingChanges()
}, []) // Salva periodicamente
\`\`\`

## 🎯 Boas Práticas

### 1. Sempre use Dependency Arrays

\`\`\`tsx
// ✅ BOM
useEffect(() => { ... }, [])
useEffect(() => { ... }, [specificValue])

// ❌ RUIM
useEffect(() => { ... })
\`\`\`

### 2. Mantenha Dependências Granulares

\`\`\`tsx
// ✅ BOM - Depende apenas do que muda
useEffect(() => {
  updateUI()
}, [userId, theme])

// ❌ RUIM - Depende de objeto inteiro
useEffect(() => {
  updateUI()
}, [user]) // user é um objeto novo a cada render
\`\`\`

### 3. Use useCallback para Callbacks em Dependencies

\`\`\`tsx
// ✅ BOM
const handleUpdate = useCallback(() => {
  update()
}, [])

useEffect(() => {
  handleUpdate()
}, [handleUpdate])
\`\`\`

### 4. Implemente Limites de Segurança

\`\`\`tsx
const maxRetries = useRef(0)

useEffect(() => {
  if (maxRetries.current > 5) {
    throw new Error('Max retries exceeded')
  }
  
  maxRetries.current++
  // ... resto do código
}, [dependency])
\`\`\`

### 5. Teste Cada Dependency Individualmente

\`\`\`tsx
// ✅ BOM - Fácil de debugar
useEffect(() => {
  console.log('[v0] user changed:', user)
}, [user])

useEffect(() => {
  console.log('[v0] theme changed:', theme)
}, [theme])

// ❌ RUIM - Difícil saber qual mudou
useEffect(() => {
  console.log('[v0] something changed')
}, [user, theme, settings])
\`\`\`

## 📚 Exemplos Práticos

### Exemplo 1: Contexto de Configurações (Resolvido)

Ver `contexts/settings-context.tsx` para implementação correta com:
- Detecção de mudanças reais
- Debouncing de saves
- Deduplicação com refs

### Exemplo 2: Monitorar Componente

\`\`\`tsx
import { useCallCounter } from '@/hooks/use-call-counter'

export function ProblematicComponent() {
  const { track, getCount } = useCallCounter({
    name: 'ProblematicComponent',
    maxCalls: 10,
    onThreshold: () => alert('Component is rendering too much!')
  })

  track()

  return <div>...</div>
}
\`\`\`

### Exemplo 3: Depurar Efeito

\`\`\`tsx
import { useEffectTracker } from '@/hooks/use-effect-tracker'

export function DataFetcher() {
  const tracker = useEffectTracker({
    name: 'data-fetcher',
    maxExecutions: 5
  })

  useEffect(() => {
    const start = performance.now()
    
    fetchData()
    
    const duration = performance.now() - start
    const report = tracker.recordExecution(duration)
    
    console.log(report)
  }, [])

  return <div>...</div>
}
\`\`\`

## 📞 Checklist de Resolução

- [ ] Identifique o contexto/hook onde o loop ocorre
- [ ] Verifique se todos os useEffect têm dependency arrays
- [ ] Confirme que as dependências são realmente necessárias
- [ ] Use refs para rastrear valores anteriores
- [ ] Implemente debouncing se necessário
- [ ] Separe efeitos com responsabilidades diferentes
- [ ] Teste cada dependency individualmente
- [ ] Use ferramentas de rastreamento para confirmar correção
- [ ] Revise o código em pair/code review
- [ ] Monitore em produção com logs

## 🔗 Referências

- [React Hooks Pitfalls - Overreact](https://overreacted.io/a-complete-guide-to-useeffect/)
- [React DevTools Profiler](https://react.dev/learn/react-dev-tools)
- [useEffect Dependencies Checker](https://github.com/facebook/react/issues/14920)
