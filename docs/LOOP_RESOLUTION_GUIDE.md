# Guia de Resolução de Loops Infinitos - Mapeamento

## Problema Identificado

A página de mapeamento entrava em um loop infinito que causava o erro "Maximum update depth exceeded" por causa de:

1. **Dependência de função tradução (`t`)**: A função `t()` muda de referência a cada render, causando o `useEffect` dispara continuamente
2. **Geolocalização repetida**: A cada disparo do efeito, `navigator.geolocation.getCurrentPosition()` era chamado novamente
3. **Atualização de estado**: `setUserLocation()` disparava um novo render, que redispunha o efeito

## Solução Implementada

### 1. GeolocationManager (utils/geolocation-manager.ts)

Um singleton que centraliza a lógica de geolocalização:
- **Cache**: Armazena a localização após o primeiro acesso
- **Promise Deduplication**: Reutiliza a mesma promise se geolocalização já está em progresso
- **Timeout de Cache**: Localização é cacheada por 5 minutos (configurable)

\`\`\`typescript
const manager = new GeolocationManager();
const location = await manager.getLocation(); // Reutiliza resultado anterior
\`\`\`

### 2. useGeolocation Hook (hooks/use-geolocation.ts)

Um hook que fornece a localização de forma segura:
- **Ref para prevenir múltiplas cargas**: `hasLoadedRef.current` garante que o efeito execute apenas uma vez
- **Dependency array vazio**: `useEffect(..., [])` - nunca redisapra
- **Cleanup isMounted**: Evita atualizações de estado em componentes desmontados

\`\`\`typescript
const { location, error } = useGeolocation();
\`\`\`

### 3. Página de Mapeamento (app/mapeamento/page.tsx)

Mudanças na página:
- **Usa o hook useGeolocation** em vez de chamar `navigator.geolocation` diretamente
- **Inicialização de crime types com useEffect vazio**: `setSelectedCrimeTypes(Object.keys(...))` com `[]` dependency
- **Remove dependência `[t]`**: Crime types são inicializados uma única vez

## Padrão: Por Que Funciona

\`\`\`
ANTES (Loop Infinito):
Render → useEffect([t]) → navigator.geolocation.getCurrentPosition() 
  → setUserLocation() → Re-render → t() referência muda → useEffect dispara novamente ❌

DEPOIS (Funcionando):
1º Render → useEffect([]) (uma única vez) → geolocationManager.getLocation() 
  → setLocation() → Re-render → Nenhum efeito redisapra ✅
\`\`\`

## Técnicas de Prevenção

### 1. **Dependency Arrays Vazios**
Use quando o efeito deve executar apenas uma vez:
\`\`\`typescript
useEffect(() => {
  // Código que executa APENAS na montagem
}, []) // ← Vazio = uma única execução
\`\`\`

### 2. **Refs para Rastreamento**
Previne múltiplas execuções:
\`\`\`typescript
const hasLoadedRef = useRef(false);
useEffect(() => {
  if (hasLoadedRef.current) return; // Pula se já executou
  hasLoadedRef.current = true;
  // Lógica
}, [])
\`\`\`

### 3. **Singletons para Recursos Caros**
Reutiliza resultados:
\`\`\`typescript
class Manager {
  private cache = null;
  async get() {
    if (this.cache) return this.cache; // Retorna cache
    this.cache = await expensive();
    return this.cache;
  }
}
\`\`\`

### 4. **Cleanup em Efeitos**
\`\`\`typescript
useEffect(() => {
  let isMounted = true;
  async function load() {
    const data = await fetch(...);
    if (isMounted) setState(data); // Só atualiza se montado
  }
  load();
  return () => { isMounted = false; }; // Cleanup
}, [])
\`\`\`

## Checklist de Debugging

- [ ] Verificar dependency array do useEffect - está vazio se não há dependências externas?
- [ ] Procurar por setState dentro de useEffect - o que dispara a mudança de dependência?
- [ ] Rastrear funções que mudam de referência a cada render (callbacks, traduções)
- [ ] Adicionar logs: `console.log("[v0]", "Effect ran")`
- [ ] Usar React DevTools para ver quantas vezes componentes renderizam
- [ ] Verificar error boundary para capturar "Maximum update depth exceeded"

## Logs para Debugging

\`\`\`typescript
// Ver quando efeitos disparam
useEffect(() => {
  console.log("[v0] Effect fired"); 
  // ...
}, [dependency]);

// Ver quais dependências mudaram
useEffect(() => {
  console.log("[v0] Dependency changed:", dependency);
}, [dependency]);

// Ver renders
console.log("[v0] Component rendered");
\`\`\`

## Boas Práticas

1. **Sempre explique o dependency array**: `[] = one time`, `[dep] = when dep changes`, `no array = every render (avoid!)`
2. **Isole dados custosos em hooks**: Geolocalização, API calls, etc.
3. **Use singletons para recursos compartilhados**: Evita duplicação
4. **Sempre tenha cleanup em efeitos**: Especialmente com async code
5. **Teste com React.StrictMode**: Detecta efeitos problemáticos em desenvolvimento

## Links Úteis

- [React useEffect Documentation](https://react.dev/reference/react/useEffect)
- [Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning)
- [React DevTools](https://react.dev/learn/react-developer-tools)
