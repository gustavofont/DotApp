# DotApp — Documento de Escopo

> Frontend web do DotCard-API. Este documento registra as decisões de arquitetura e design
> fechadas antes de qualquer código ser escrito — o mesmo espírito do `SCOPE.md` do
> DotCard-API: decisão + porquê, não só a decisão crua.

---

## 1. Visão geral

DotApp é o frontend web do **DotCard-API** (backend de um card game colecionável). Consome a
API via HTTP — não duplica nenhuma regra de negócio. Toda validação de saldo, posse de carta,
raridade e regra de troca continua vivendo exclusivamente no backend; o front só reflete o que
a API retorna e envia comandos.

---

## 2. Stack e por quê

| Área | Decisão | Por quê |
|---|---|---|
| Plataforma | Web SPA | App logado, sem necessidade de SEO — SSR (Next.js) seria overhead sem benefício real aqui. |
| Framework | React + Vite + TypeScript | TypeScript casa direto com o backend NestJS; Vite dá dev server rápido sem carregar um framework full-stack que o projeto não precisa. |
| Client da API | Gerado a partir do Swagger (`openapi-typescript` + `openapi-fetch`) | Qualquer mudança de DTO no backend quebra o build do front em vez de falhar silenciosamente em runtime. |
| Cache/data-fetching | TanStack Query | Cache, invalidação e refetch sem gerenciar `loading`/`error` manualmente em cada tela. |
| Auth — access token | Em memória, nunca persistido | Nunca sobrevive a um XSS que persista entre sessões. |
| Auth — refresh token | `localStorage` | O AuthForge devolve `accessToken`/`refreshToken` no corpo JSON — não usa cookie httpOnly. Sem um BFF no meio (ver abaixo), a única forma de manter o login entre recarregamentos de página é persistir o refresh token em algum storage do browser. Risco aceito conscientemente, mesma categoria do §4 do `SCOPE.md` do backend (janela de sessão pós-logout). |
| Login | Chama o AuthForge diretamente | Sem BFF — ver linha abaixo. |
| BFF | Nenhum | Um proxy resolveria o problema do refresh token (cookie httpOnly de verdade), mas adiciona mais um serviço pra manter/deployar e muda a decisão de "SPA sem SSR". Reconsiderado explicitamente e descartado. |
| Tempo real (trocas) | Polling via TanStack Query (`refetchInterval`) | O backend não tem WebSocket/push hoje; não vale adicionar infraestrutura nova só pro front antes de existir necessidade real. |
| Design system | Paleta de `RARITY_STYLE` (originalmente de `DotCardGenerator/card_composer.py`) como token-base | Reaproveita a identidade visual já validada nas cartas reais, em vez de inventar uma paleta nova pro resto do app. |
| Moldura da carta | 100% CSS, dentro de `CardArt.tsx` — nunca embutida na imagem | `imageUrl` é só a ilustração crua; moldura, glow, medalhão de raridade+tipo e faixa do nome são todos desenhados no componente. Decisão revertida de uma primeira tentativa onde a API servia o card já composto (frame + texto cozidos no PNG pelo `DotCardGenerator`) — isso duplicava moldura (uma vinda da imagem, outra do componente) e fazia o desgaste visual (§5) borrar o nome/moldura embutidos em vez de só a ilustração. |
| Estilização | Tailwind CSS | Integra nativamente com shadcn/ui (que já é Radix + Tailwind por baixo). |
| Componentes | Headless (Radix UI / shadcn) | Controle total da aparência em vez de brigar com o tema padrão de uma lib pré-estilizada. |
| Organização de pastas | Por feature (`features/catalog/`, `features/trades/`, ...) | Sete domínios com lógica própria — evita acoplamento cruzado conforme o app cresce. Só o genuinamente compartilhado vive em `shared/`. |
| Estado — server | TanStack Query | — |
| Estado — UI simples | `useState`/`useContext` nativo | Sem Redux/Zustand — não há necessidade de estado global complexo neste tamanho de app. Adicionar só se surgir necessidade real. |
| Estado — fluxos multi-etapa | XState (reveal do pull, negociação de troca) | Ver seção dedicada abaixo. |
| Rotas | React Router | Padrão de fato do ecossistema React, mais documentação/exemplos que alternativas mais novas. |
| Testes | Vitest + React Testing Library (componente) + Playwright (e2e) | Vitest pareia nativamente com Vite, sem config extra. |
| Deploy | Serviço adicional no `docker-compose.yml` raiz do DotCard-API | Mesma filosofia de "sobe tudo junto" que já existe pro backend — build estático servido via nginx leve. |

### Por que XState pros fluxos multi-etapa

O reveal do pull tem estados reais (`idle` → `opening` → `revealing[i]` → `done`) e a troca
espelha o backend (`AWAITING_COUNTERPART` → `AWAITING_CONFIRMATION` →
`ACCEPTED`/`CANCELLED`/`EXPIRED`) mais estados locais de UI em cima disso (ex.: "selecionando
carta pra oferecer" antes de confirmar a chamada). Modelar isso como `useReducer` cru funciona,
mas transições inválidas só falham em runtime — ou nem falham, só corrompem o estado
silenciosamente. Uma máquina de estados torna as transições válidas explícitas e testáveis
isoladamente da UI.

---

## 3. Integração com o backend

- **DotCard-API**: `http://localhost:3001` — todas as rotas de jogo (catálogo, pulls, acervo,
  amigos, trocas). Client tipado gerado a partir de `/docs-json`.
- **AuthForge**: `http://localhost:3000` — só auth (`/auth/login`, `/auth/refresh`,
  `/auth/logout`). Client tipado gerado separadamente, também a partir de `/docs-json`.

### Fluxo de autenticação

1. `login(email, senha)` → `POST /auth/login` no AuthForge → guarda `accessToken` em estado
   React (memória), `refreshToken` em `localStorage`.
2. Ao montar o app: se existe `refreshToken` em `localStorage`, tenta `POST /auth/refresh` antes
   de renderizar qualquer rota protegida — evita perder a sessão só por recarregar a página.
3. Toda chamada ao DotCard-API injeta `Authorization: Bearer <accessToken>`. Em resposta `401`,
   tenta um refresh e repete a chamada uma vez antes de deslogar.
4. `logout()` → `POST /auth/logout` (revoga a sessão no AuthForge) → limpa memória +
   `localStorage`.

---

## 4. Telas e fluxos

### Login
Email/senha. Trata `401` (credencial inválida) e `403` (conta bloqueada/inativa) do AuthForge.

### Home
Saldo, `friendCode`, botão de resgate diário habilitado conforme `dailyRewardAvailable`
(`GET /me`), atalho pra abrir pacote.

### Abrir pacote (pull reveal)
Baralho empilhado virado pra baixo. Toque em "abrir" dispara animação de abertura que já revela
a 1ª carta (sem toque extra pra virar essa). Cada toque na carta atual revela+avança pra
próxima do baralho, até esvaziar. Uma `LEGENDARY` sorteada ganha tratamento visual
diferenciado no momento da própria revelação dela — não é genérico pra raridade, é específico
do evento daquele pull.

### Catálogo (unifica o antigo "Acervo")
`GET /cards` cruzado com `GET /me/cards` num único grid — não existe mais uma tela separada de
acervo. Cartas ainda não possuídas aparecem como silhueta bloqueada em vez de simplesmente
sumir da lista; possuídas com mais de uma cópia ganham um badge de contador (`×N`) sobre o
`CardArt`. Clicar em qualquer card (possuído ou não) abre um popup (`CardDetailModal`) com o
`CardArt` grande e, se possuído, a lista dos exemplares individuais — cada um com seu próprio
`float_value` (ver desgaste visual, abaixo). Essa lista de exemplares é um componente separado
(`ExemplarList`) justamente para ser reaproveitada como a view de escolher um exemplar
específico ao propor uma troca.

### Amigos
Lista de amigos + convites pendentes (entrada/saída), convidar por `friendCode`, rotacionar o
próprio código.

### Trocas
Formato "versus": carta do proponente à esquerda, carta do destinatário à direita — layout
fixo de dois lados, sem espaço pra um terceiro item, reforçando visualmente a regra 1:1 do
backend antes mesmo de qualquer validação. Atualiza por polling enquanto a tela está aberta,
refletindo `AWAITING_COUNTERPART` → `AWAITING_CONFIRMATION` →
`ACCEPTED`/`CANCELLED`/`EXPIRED`.

---

## 5. `CardArt` — moldura e desgaste visual

### Moldura (por que é só CSS)

A API serve só a ilustração crua em `imageUrl` — nenhum frame, nome, ícone ou glow embutido
no pixel. Isso foi uma correção de rota: a primeira versão pedia pro `DotCardGenerator` compor
o card inteiro (moldura + texto cozidos no PNG) e o `CardArt` desenhava uma *segunda* moldura
por cima, redundante — além de fazer o desgaste visual (abaixo) borrar o nome/moldura já
embutidos na imagem, em vez de só a ilustração. Corrigido: toda a composição visual do card
vive só em `CardArt.tsx`.

Camadas do componente, de baixo pra cima:

1. **Arte** (`object-cover`, sangra até a borda do card).
2. **Desgaste** (se for um exemplar possuído — ver seção abaixo).
3. **Borda holo-foil** — um wrapper com `padding` pequeno cujo `background` é um gradiente
   multi-stop (cor da raridade + branco + `accent-soft`) fazendo às vezes de borda, sem
   `border-image`. Por cima da arte, uma textura de brilho diagonal
   (`repeating-linear-gradient` + `mix-blend-mode: overlay`) reforça a leitura de "superfície
   metálica/holográfica".
4. **Medalhão único**, canto superior esquerdo — combina raridade (fundo em gradiente radial
   na cor `RARITY_ACCENT`) e tipo (ícone SVG por dentro, `shared/typeIcons.tsx`, mesmos 4
   desenhos — árvore/chama/runa/caveira — que existiam antes em `card_composer.py`, agora só
   portados pra JSX). Um selo só, não dois separados.
5. **Faixa do nome** — recortada com `clip-path`, na base da arte, mesma cor da raridade.

### Desgaste visual por float

`generated_cards.float_value` já existe no backend como atributo cosmético puro (SCOPE.md §5.3
do DotCard-API — "estilo float de skin de CS:GO", nunca afeta gameplay). O DotApp dá uso visual
real a ele: quanto mais baixo o float, mais "nova" a carta parece; quanto mais alto, mais
"desgastada". Só se aplica a exemplares (`generated_cards`) — cartas do catálogo puro (sem
posse, sem float) não recebem o tratamento.

Validado visualmente num protótipo HTML antes de entrar em código React. Composição, tudo
client-side, nenhuma imagem nova é gerada:

1. **Filtro CSS na própria arte**, interpolado linearmente pelo float `f` (0 a 1):
   `saturate(1 - f·0.55) sepia(f·0.40) contrast(1 - f·0.18) brightness(1 - f·0.10)`
2. **Três camadas de arranhão em SVG**, cada uma como `<path>` curvo (bezier quadrática, não
   reta) com gradiente de opacidade que afina nas pontas:
   - **Fios finos** (muitos, sutis, brancos, `mix-blend-mode: screen`) — desgaste comum.
   - **Vincos** (poucos, mais grossos, brancos) — arranhões de verdade.
   - **Sulcos** (bem poucos, pretos, `mix-blend-mode: multiply`) — dano mais profundo.
   Posição enviesada pra perto das bordas/cantos (`edgeBias`, não uniforme na superfície);
   ângulo de cada arranhão variando em torno de uma **direção dominante por exemplar** (não
   isotrópico — simula uma pegada de manuseio consistente).
3. **Manchas de canto** — smudge radial escuro nos 4 cantos (`mix-blend-mode: multiply`),
   opacidade escalando com o float.
4. **Grão sutil** (SVG `feTurbulence`, `mix-blend-mode: overlay`) + **vinheta** nas bordas,
   ambos escalando com o float.

**Determinismo:** o padrão de arranhão usa um PRNG seedado pelo `id` do `generated_card` — o
mesmo exemplar sempre desenha o mesmo padrão entre renders, nunca um novo a cada vez que o
componente monta.

Implementado em `shared/cardWear.ts` (`getWearStyle(floatValue, seed)`), consumido por
`collection`, `pull-reveal` e `trades` — as três features que renderizam `generated_cards`
reais.

---

## 6. Fora de escopo agora

- WebSocket/push — trocas usam polling.
- BFF — reconsiderado e descartado (ver §2).
- Mobile nativo — Web SPA por enquanto.
- PATCH/DELETE administrativos de cartas — ficam só no backend/Swagger direto, sem UI dedicada.
- Redux/Zustand ou qualquer state manager global — `useState`/`useContext` resolve no tamanho
  atual do app.
