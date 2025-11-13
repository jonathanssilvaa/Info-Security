# Infinite Loop Prevention & Diagnosis Guide

## Problem Analysis

The "Maximum update depth exceeded" error occurs when React's internal update limit (50) is exceeded, typically caused by:

1. **setState in useEffect without dependencies** - Effect runs every render, triggering setState
2. **setState in useEffect with object/array dependency** - New object reference every render
3. **Direct value comparisons** - Comparing objects by reference instead of value
4. **Missing cleanup functions** - Effects triggering repeatedly
5. **Callback functions in dependencies** - Unstable function references

## Root Cause in DataCrim App

The original issue was in `SettingsProvider`:
- `useEffect` had `[settings]` as dependency
- `settings` is an object that changed by reference each update
- This triggered the save effect, which updated localStorage
- The update completed, triggering a new render
- New render created a new `settings` object reference
- This triggered the effect again → infinite loop

## Solutions Implemented

### 1. **Value-Based Comparison**
Instead of comparing objects by reference, we convert to a consistent string representation:

\`\`\`typescript
function settingsToKey(settings: Settings): string {
  return JSON.stringify(settings)
}
\`\`\`

Only save when the stringified value actually changes.

### 2. **Proper Dependency Management**
- Separate effects for different concerns
- Initial load effect with empty dependency array
- Save effect that compares values, not references
- Always return cleanup functions

### 3. **Update Guards**
- Check if value has changed before triggering save
- Use `updatePendingRef` to prevent multiple rapid saves
- Clear and reschedule timers to prevent duplicate saves

### 4. **Stable Function References**
- Use `useCallback` for all context update functions
- Prevents unnecessary re-renders of consuming components
- Ensures functions can be safely used as dependencies

## Debugging Techniques

### 1. **Render Count Monitoring**
Use the `useRenderCount` hook to track renders:

\`\`\`typescript
function MyComponent() {
  const { count } = useRenderCount("MyComponent")
  
  // Logs render count to console
  return <div>Render count: {count}</div>
}
\`\`\`

### 2. **Value Tracking with usePreviousValue**
Compare current vs previous values:

\`\`\`typescript
function MyComponent({ value }: { value: any }) {
  const prevValue = usePreviousValue(value)
  
  useEffect(() => {
    if (prevValue !== value) {
      console.log("Value changed from", prevValue, "to", value)
    }
  }, [value, prevValue])
}
\`\`\`

### 3. **Detailed Effect Logging**
Add logging at effect entry and exit:

\`\`\`typescript
useEffect(() => {
  console.log("[v0] Effect running with deps:", settings)
  
  // Effect logic here
  
  return () => {
    console.log("[v0] Effect cleaning up")
  }
}, [settings])
\`\`\`

### 4. **React DevTools Profiler**
1. Open React DevTools
2. Go to "Profiler" tab
3. Record a session while error occurs
4. Look for components rendering excessively
5. Check which props/state changes trigger renders

## Best Practices

### ✅ DO
- Use empty dependency array `[]` for one-time initialization
- Use value-based comparison for complex objects
- Implement debouncing for frequent updates
- Clear timers in cleanup functions
- Use `useCallback` for functions in context
- Throttle/debounce localStorage operations

### ❌ DON'T
- Depend on object/array directly without comparison
- Call setState unconditionally in effects
- Create new objects/arrays every render
- Forget cleanup functions in useEffect
- Update state in render without memoization
- Use multiple effects with overlapping concerns

## Testing for Infinite Loops

1. **Monitor console** for repeated "[v0]" logs
2. **Check error boundary** - if it catches "Maximum update depth", loop exists
3. **Check DevTools profiler** - look for component rendering > 50 times
4. **Check network tab** - look for repeated API calls
5. **Add breakpoints** in effects and state setters

## Recovery Strategies

If an infinite loop is detected:

1. Error boundary catches and displays error
2. User can click "Recarregar Página" to reload
3. Application doesn't crash completely
4. Detailed error info available in development mode

## Common Patterns to Watch

### Pattern 1: Object Dependency
\`\`\`typescript
// ❌ WRONG
useEffect(() => {
  save(settings)
}, [settings]) // NEW OBJECT REFERENCE EVERY RENDER

// ✅ CORRECT
useEffect(() => {
  const key = JSON.stringify(settings)
  if (key !== lastKey) {
    save(settings)
    lastKey = key
  }
}, [settings])
\`\`\`

### Pattern 2: Missing Cleanup
\`\`\`typescript
// ❌ WRONG
useEffect(() => {
  const timer = setTimeout(() => update(), 100)
  // Forgot to clear timer!
}, [])

// ✅ CORRECT
useEffect(() => {
  const timer = setTimeout(() => update(), 100)
  return () => clearTimeout(timer)
}, [])
\`\`\`

### Pattern 3: Unstable Dependencies
\`\`\`typescript
// ❌ WRONG
const onUpdate = () => { /* ... */ }
useEffect(() => {
  subscribe(onUpdate) // New function every render!
}, []) // onUpdate missing from deps

// ✅ CORRECT
const onUpdate = useCallback(() => { /* ... */ }, [])
useEffect(() => {
  subscribe(onUpdate)
  return () => unsubscribe(onUpdate)
}, [onUpdate])
\`\`\`

## Monitoring in Production

- Error boundary logs to console with timestamp
- Consider sending errors to monitoring service
- Track frequency of infinite loop errors
- Analyze patterns to identify problematic features
- Set up alerts if error rate increases
