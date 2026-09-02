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
| Moldura da carta | 100% CSS, dentro de `CardArt.tsx` — nunca embutida na imagem | `imageUrl` é só a ilustração crua; case, glow e o rótulo (raridade, serial+grade, nome, tipo) são todos desenhados no componente (ver §5). Decisão revertida de uma primeira tentativa onde a API servia o card já composto (frame + texto cozidos no PNG pelo `DotCardGenerator`) — isso duplicava moldura (uma vinda da imagem, outra do componente) e fazia o desgaste visual (§5) borrar o nome/moldura embutidos em vez de só a ilustração. |
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
Email/senha. Trata `401` (credencial inválida), `403` (conta bloqueada/inativa) e `429`
(throttle do AuthForge) — cada um com mensagem própria via toast, depois de um bug real onde
os três caíam na mesma mensagem genérica porque o front nunca tinha acesso ao status HTTP
verdadeiro do erro (corrigido anexando `response.status` explicitamente no retorno de `login()`).

Link "Esqueci minha senha" leva pra `/forgot-password` — formulário de e-mail, sempre mostra a
mesma mensagem neutra de sucesso, porque `POST /auth/forgot-password` sempre responde 200
independente da conta existir (anti-enumeração, decisão do AuthForge). O e-mail chega via
MailForge com um link pra `/reset-password?token=` → formulário de senha nova + confirmação,
valida força/coincidência no cliente antes de mandar pro servidor. Erros são mapeados pelo
`errorCode` que o AuthForge devolve no corpo (ex. `INVALID_RESET_TOKEN`), não pelo status HTTP
— o helper `unwrap()` usado nas outras chamadas não anexa `.status` ao erro lançado, só
`AuthContext.login()` faz essa anexação manual.

### Home
Saldo, `friendCode`, botão de resgate diário habilitado conforme `dailyRewardAvailable`. Dois
botões de ação com ícone — "Abrir Pacote" (ouro, a única ação primária da tela) e "Trocas"
(contorno) — substituem o que antes eram links de navegação; abrir pacote e propor troca são
coisas que o jogador *faz*, não lugares que ele *navega*, então saíram da navbar (ver
"Navegação em sidebar", abaixo). Logo abaixo, duas vitrines reaproveitando o mesmo componente
(`CardShowcase`): "Melhores cartas" (5 de melhor grade) e "Cartas mais raras" (5 de maior
raridade, empate resolvido por grade). Perfil, saldo, `dailyRewardAvailable` e as duas listas
já ranqueadas e limitadas vêm de uma única chamada, `GET /me/summary` — o ranking passou a ser
feito no banco, não mais no cliente (mesmo motivo do redesenho do Catálogo, ver abaixo).

### Abrir pacote (pull reveal)
Baralho empilhado virado pra baixo. Toque em "abrir" dispara animação de abertura que já revela
a 1ª carta (sem toque extra pra virar essa). Cada toque na carta atual revela+avança pra
próxima do baralho, até esvaziar. Uma `LEGENDARY` sorteada ganha tratamento visual
diferenciado no momento da própria revelação dela — não é genérico pra raridade, é específico
do evento daquele pull.

### Catálogo (unifica o antigo "Acervo")

**Redesenhado depois de um bug real de produção**, não só por preferência de arquitetura. A
versão original cruzava `GET /cards` com `GET /me/cards?limit=100` num grid único —
funcionava até um jogador acumular mais de 100 `generated_cards`: o `limit=100` truncava a
lista de posse em silêncio, sem nenhum sinal de erro, e uma carta com várias cópias podia
aparecer com a contagem errada (achado com um caso real: uma carta específica mostrando `×1`
na tela contra `×3` no banco). Não dava pra corrigir só aumentando o limite — quebraria de novo
assim que a coleção do jogador crescesse mais.

**Arquitetura atual:** cartas carregam por coleção, não a coleção inteira do jogo de uma vez.
`GET /me/inventory?collectionId=` devolve uma coleção inteira sem limite, com a posse do
jogador (contagem + melhor exemplar) já embutida por carta — calculada no banco via
`DISTINCT ON` + `COUNT(*) OVER (PARTITION BY ...)`, nunca agregada no cliente. A primeira
coleção carrega ao abrir a tela; a próxima só quando o scroll chega ao fim da atual (sentinel +
`IntersectionObserver`) — nunca "me dá tudo de uma vez". Dentro de cada coleção, cartas
possuídas ficam num grid, com um badge de contador (`×N`) quando há mais de uma cópia; as
trancadas saem dali e formam uma seção própria abaixo, "Cartas faltando" — nunca misturadas na
mesma grade.

Clicar em qualquer card (possuído ou não) abre um popup (`CardDetailModal`) com o `CardArt`
grande e, se possuído, a lista dos exemplares individuais — cada um com seu próprio
`float_value` (ver desgaste visual, abaixo). Essa lista **não** vem pré-carregada: é buscada sob
demanda (`GET /me/inventory/:cardId/exemplars`, só `id`+`float`, sem o `card` aninhado
redundante) só quando o popup abre — evita repetir o mesmo erro de "carregar tudo adiantado" num
nível mais fino. É um componente separado (`ExemplarList`) justamente para ser reaproveitado
como a view de escolher um exemplar específico ao propor uma troca.

### Amigos
Lista de amigos + convites pendentes (entrada/saída), convidar por `friendCode`, rotacionar o
próprio código.

### Trocas
Formato "versus": carta do proponente à esquerda, carta do destinatário à direita — layout
fixo de dois lados, sem espaço pra um terceiro item, reforçando visualmente a regra 1:1 do
backend antes mesmo de qualquer validação. `tradeMachine.ts` (XState) modela o ciclo de uma
troca aberta: ao entrar em `open`, faz polling a cada 3s contra `GET /trades/:id` até o status
sair de `AWAITING_COUNTERPART`/`AWAITING_CONFIRMATION`, é assim que a proposta de contrapartida
do outro lado ou a confirmação final aparecem sem o usuário recarregar a página. Escolher a
carta a oferecer (na criação) ou a contrapartida (no counterpart) usa `CardPicker`, um grid de
`CardArt` em modo `compact` sobre `GET /me/cards` — mais simples que reaproveitar
`ExemplarList`, porque aqui o jogador escolhe entre *todas* as próprias cartas, não os
exemplares de uma carta-base já selecionada.

**Mudança de contrato no backend:** `TradeResponseDto.offeredCardId`/`requestedCardId` eram só
o id do exemplar — um participante conseguia resolver a própria carta via `GET /me/cards`, mas
não tinha nenhuma rota pra resolver a do outro lado (`GET /users/:id/cards` é `ADMIN`-only), o
que inviabilizava o layout "versus" de verdade. O DTO passou a embutir o `GeneratedCardResponseDto`
completo de cada lado (`offeredCard`/`requestedCard`) — participante de uma troca tem
legitimidade pra ver a carta do outro, é exatamente o dado que a troca já expõe.

### Internacionalização (PT/EN)
`react-i18next`, todo texto de interface em `src/i18n/locales/{pt,en}.json`. Sem detecção
automática de navegador (`navigator.language`) — a troca é só pela interface (seletor com
bandeiras 🇧🇷/🇺🇸 na sidebar), persistida em `localStorage`. Não é só preferência de UX: detecção
automática tornaria o idioma padrão não-determinístico em ambiente de teste (jsdom reporta
`en-US`), quebrando a suíte de testes existente — `pt` é sempre o idioma inicial/fallback,
`en` é sempre escolha explícita do usuário.

### Navegação em sidebar
Migrou de uma barra horizontal no topo pra uma sidebar fixa à esquerda (`sm:` e acima; colapsa
pra barra horizontal no mobile, mesmo conjunto de nós DOM, sem estado de drawer JS — evita
duplicar elementos interativos, o que quebraria testes em jsdom que dependem de nome único por
elemento). Reduzida às três telas de navegação de verdade — Home, Catálogo, Amigos; "Abrir
Pacote" e "Trocas" saíram (ver "Home", acima) porque uma barra de navegação lista lugares, não
ações que o jogador executa.

### Toasts
`sonner`, com um módulo próprio (`components/ui/sonner.tsx`) temado pelos mesmos tokens visuais
do resto do app. Escopo deliberadamente estreito: status de sistema/rede que o app precisa
confessar (login com erro, request que não chegou no servidor) — nunca um evento de jogo (carta
lendária, coleção completa continuam sem toast, tratados na própria tela). Motivado por um bug
real: o `Login` engolia o status HTTP verdadeiro do erro do AuthForge — `429` (throttle), `403`
(conta bloqueada) e `401` (senha errada) caíam todos na mesma mensagem genérica, porque o front
nunca tinha acesso ao status de verdade. Corrigido junto com a criação do módulo.

---

## 5. `CardArt` — moldura e desgaste visual

### Moldura — "the grading slab" (por que é só CSS)

A API serve só a ilustração crua em `imageUrl` — nenhum frame, nome, ícone ou glow embutido
no pixel. Isso foi uma correção de rota: a primeira versão pedia pro `DotCardGenerator` compor
o card inteiro (moldura + texto cozidos no PNG) e o `CardArt` desenhava uma *segunda* moldura
por cima, redundante — além de fazer o desgaste visual (abaixo) borrar o nome/moldura já
embutidos na imagem, em vez de só a ilustração. Corrigido: toda a composição visual do card
vive só em `CardArt.tsx`.

**Redesenhada** de "moldura holo-foil + medalhão de raridade/tipo" pra "case + rótulo
certificado" — mesma tese de fundo (a posse é o objeto precioso, não só a arte por baixo),
execução nova. Craft visual completo (paleta, tipografia, regras nomeadas) fica só no
`DESIGN.md` pra não duplicar fonte de verdade; resumo arquitetural do que mudou:

- **Case**: borda acrílica incolor (gradiente, não `border-image`, 3px de padding) — a cor da
  raridade não fica mais na moldura inteira, só na faixa do rótulo.
- **Rótulo**, no topo (escondido em modo `compact`, pra thumbnails pequenas — grid de escolha
  de carta numa troca, por exemplo): faixa holo de 4px na cor da raridade → linha serial+grade
  em mono (`NO. 000042` / `GR 8.3`, só quando o exemplar tem `wear`, isto é, é possuído) →
  nome da carta (serif) → tag raridade·tipo (mono, truncada pra nunca quebrar linha).
- **Trancada**: case vazio, contorno tracejado, ícone de cadeado, sem gradiente/glow —
  deliberadamente inerte, nunca compete visualmente com uma carta certificada.

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

Implementado em `shared/cardWear.ts` (`getWearStyle(floatValue, seed)`), chamado só de dentro do
próprio `CardArt.tsx` — qualquer feature que passa a prop `wear` (Catálogo, pull-reveal, trades)
ganha o tratamento automaticamente, sem repetir a lógica em cada tela.

---

## 6. Fora de escopo agora

- WebSocket/push — trocas usam polling.
- BFF — reconsiderado e descartado (ver §2).
- Mobile nativo — Web SPA por enquanto.
- PATCH/DELETE administrativos de cartas — ficam só no backend/Swagger direto, sem UI dedicada.
- Redux/Zustand ou qualquer state manager global — `useState`/`useContext` resolve no tamanho
  atual do app.
