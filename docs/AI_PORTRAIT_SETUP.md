# Configuração da Geração de Retrato Falado por IA

## Visão Geral

O sistema DataCrim utiliza IA para gerar retratos falados realistas baseados em descrições fornecidas pelos usuários. A implementação usa a API de Inferência do Hugging Face com modelos Stable Diffusion 3.5.

## Como Obter uma Chave de API Gratuita

### Hugging Face (Recomendado)

1. **Criar uma Conta**
   - Acesse: https://huggingface.co/join
   - Crie uma conta gratuita (não requer cartão de crédito)

2. **Gerar Token de API**
   - Vá para: https://huggingface.co/settings/tokens
   - Clique em "New token"
   - Dê um nome ao token (ex: "datacrim-app")
   - Selecione o tipo "read" (suficiente para inferência)
   - Clique em "Generate"
   - **IMPORTANTE**: Copie o token imediatamente (não será mostrado novamente)

3. **Adicionar ao Projeto**
   - No Vercel: Vá em Settings → Environment Variables
   - Adicione: `HUGGINGFACE_API_KEY` = seu_token_aqui
   - Ou localmente: Crie arquivo `.env.local`:
     \`\`\`
     HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
     \`\`\`

## Modelos Disponíveis e Recomendações

### Modelos Ativos (2025)

| Modelo | Status | Qualidade | Velocidade | Recomendação |
|--------|--------|-----------|-----------|--------------|
| **stabilityai/stable-diffusion-3.5-large** | ✅ Ativo | Excelente | Média | ⭐ Padrão |
| **black-forest-labs/FLUX.1-dev** | ✅ Ativo | Superior | Lenta | Melhor qualidade |
| **runwayml/stable-diffusion-v1-5** | ✅ Ativo | Boa | Rápida | Fallback rápido |
| **stabilityai/stable-diffusion-3** | ✅ Ativo | Muito Boa | Média | Alternativa |

### Modelos Descontinuados ⚠️

- `stabilityai/stable-diffusion-2-1` → **DESCONTINUADO** (erro 404)
- `stabilityai/stable-diffusion-2` → Substituído pela versão 3.5
- `CompVis/stable-diffusion-v1-4` → Use v1-5

## Limites da API Gratuita

### Hugging Face (Tier Gratuito)
- **Requisições**: ~1000 requisições/mês
- **Rate Limit**: ~1 requisição a cada 2-3 segundos
- **Tempo de Geração**: 5-20 segundos por imagem (dependendo do modelo)
- **Qualidade**: Alta (512x512 pixels)
- **Sem Custo**: Completamente gratuito
- **Cache**: Modelos são carregados apenas na primeira requisição (~20-30s)

## APIs Alternativas (Caso Necessário)

### 1. Replicate
- **Site**: https://replicate.com
- **Tier Gratuito**: $0.006 por geração (~166 gerações grátis)
- **Modelo**: stable-diffusion, FLUX
- **Setup**:
  \`\`\`env
  REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxx
  \`\`\`

### 2. Stability AI
- **Site**: https://platform.stability.ai
- **Tier Gratuito**: 25 créditos/mês
- **Qualidade**: Muito alta
- **Setup**:
  \`\`\`env
  STABILITY_API_KEY=sk-xxxxxxxxxxxxx
  \`\`\`

### 3. DeepAI
- **Site**: https://deepai.org
- **Tier Gratuito**: 5 requisições/dia
- **Simples**: Sem autenticação necessária
- **Limitado**: Qualidade inferior

## Solução de Problemas Comuns

### Erro 404: "Model endpoint not found"
**Causa**: Modelo foi descontinuado ou URL incorreta (ex: stable-diffusion-2-1)
**Solução**: 
- Sistema automaticamente usa `stable-diffusion-3.5-large` (modelo ativo)
- Se erro persistir, tente modelo alternativo: `runwayml/stable-diffusion-v1-5`
- Verifique modelo no Hugging Face: https://huggingface.co/models?pipeline_tag=text-to-image

### Erro 429: "Rate limit exceeded"
**Causa**: Muitas requisições em pouco tempo
**Solução**: 
- Aguarde 60 segundos antes de tentar novamente
- Implemente cache de imagens geradas
- Use modelo mais rápido (v1-5 em vez de 3.5)
- Considere upgrade para tier pago

### Erro 401/403: "API key invalid"
**Causa**: Token incorreto, expirado ou sem permissões
**Solução**:
- Verifique se copiou o token **completo** do Hugging Face
- Confirme que o tipo de token é "read"
- Gere um novo token e atualize as variáveis de ambiente
- Aguarde 2-5 minutos para a mudança ser refletida

### Erro 500/503: "Hugging Face service error"
**Causa**: Servidor Hugging Face sobrecarregado ou em manutenção
**Solução**:
- Aguarde 5-10 minutos e tente novamente
- Sistema usa placeholder automaticamente
- Tente em horários de menor uso (madrugada)
- Considere API alternativa se problema persistir

### Erro "Model loading"
**Causa**: Modelo está sendo carregado (primeira requisição)
**Solução**:
- Aguarde 20-30 segundos
- Próximas requisições serão mais rápidas (modelo está em cache)
- É comportamento normal na primeira vez

### Imagem não aparece ou está preta
**Causa**: Falha na geração ou timeout
**Solução**:
- Verifique console.log para mensagens de erro
- Tente com descrição mais simples
- Verifique se API key está configurada corretamente
- Sistema usa placeholder se falhar

### Imagem de Baixa Qualidade
**Causa**: Prompt mal construído ou parâmetros não otimizados
**Solução**:
- Forneça mais detalhes descritivos
- Use prompt estruturado: "sexo, idade, tom de pele, cabelo, olhos, etc"
- Aumentar `guidance_scale` (7.5 → 9.0)
- Aumentar `num_inference_steps` (25 → 50, mais lento mas melhor)
- Tente modelo FLUX para qualidade superior

## Otimizações Implementadas

### 1. Prompt Engineering
- Prompts otimizados para geração de rostos realistas
- Negative prompts para evitar distorções
- Tradução automática de características para inglês
- Estrutura consistente para melhor compreensão da IA

### 2. Tratamento de Erros Robusto
- Detecção automática de erros 404, 429, 500, 503
- Fallback inteligente para placeholder quando API falha
- Mensagens de erro claras e orientadas ao usuário
- Logs detalhados para debugging

### 3. Performance
- Indicador de progresso durante geração
- Cache de imagens geradas
- Compressão de imagens para download
- Modelo rápido (v1-5) como fallback automático

### 4. Modelos com Fallback Automático
- Tenta `stable-diffusion-3.5-large` primeiramente
- Se falhar com 404, tenta `runwayml/stable-diffusion-v1-5`
- Se ambos falharem, usa placeholder local

## Segurança

### Boas Práticas
- ✅ Nunca exponha a API key no código frontend
- ✅ Use variáveis de ambiente apenas no backend
- ✅ Implemente rate limiting no backend
- ✅ Valide e sanitize inputs do usuário
- ✅ Monitore uso da API regularmente

### Proteção de Dados
- Imagens geradas não são armazenadas permanentemente
- Dados pessoais não são enviados para APIs externas
- Logs não contêm informações sensíveis
- Tokens são rotacionados regularmente

## Monitoramento de Uso

### Verificar Uso no Hugging Face
1. Acesse: https://huggingface.co/settings/billing
2. Veja estatísticas de uso e limites restantes
3. Configure alertas de limite para notificações

### Logs do Sistema
\`\`\`javascript
// Logs disponíveis para debugging
[v0] Generating portrait with prompt: ...
[v0] Calling Hugging Face API with model: stabilityai/stable-diffusion-3.5-large
[v0] Optimized prompt: ...
[v0] Portrait generated successfully
[v0] Using placeholder fallback due to error: ...
\`\`\`

## Custos Estimados (Se Escalar para Produção)

### Tier Pago Hugging Face
- **Pro**: $9/mês - 10,000 requisições
- **Enterprise**: Customizado com SLA

### Alternativas de Hospedagem Paga
- **Replicate**: $0.006/geração (~$600/100k)
- **Stability AI**: $0.002-0.012/geração (dependendo do modelo)
- **AWS Bedrock**: $0.008/geração
- **Azure**: $0.10-1.00 por 1000 requisições

## Suporte e Referências

Para problemas ou dúvidas:
1. Verifique os logs do console ([v0] messages)
2. Confirme que HUGGINGFACE_API_KEY está configurada
3. Teste modelo no playground: https://huggingface.co/spaces/stabilityai/stable-diffusion-xl
4. Consulte documentação oficial do Hugging Face
5. Entre em contato com o suporte do DataCrim

### Recursos Úteis
- [Hugging Face Inference API Docs](https://huggingface.co/docs/api-inference)
- [Modelos de Texto-para-Imagem](https://huggingface.co/models?pipeline_tag=text-to-image)
- [Stable Diffusion Guide](https://huggingface.co/docs/diffusers)
- [Prompt Engineering Tips](https://stable-diffusion-art.com/prompt-engineering/)
