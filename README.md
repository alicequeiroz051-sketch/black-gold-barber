# Black Gold Barber Club

Site demonstrativo de uma barbearia premium fictícia, criado pela **Wevoxe** para apresentar a donos de barbearias o tipo de site que a agência desenvolve.

> **Aviso:** marca, endereço, telefone, profissionais e depoimentos são fictícios. Nenhuma reserva real é feita: o agendamento prepara um resumo para envio por WhatsApp.

## Tecnologias

- HTML5 semântico
- CSS3 (variáveis, grid, flexbox)
- JavaScript puro, sem frameworks, sem npm, sem build
- [Lucide Icons](https://lucide.dev) via CDN
- Google Fonts (Cormorant Garamond e Manrope)
- Imagens via Unsplash (substituíveis)

## Estrutura

```
black-gold-barber/
├── index.html
├── README.md
├── .gitignore
├── assets/
│   ├── images/        (coloque aqui suas próprias imagens)
│   └── favicon.svg
├── css/style.css
└── js/script.js
```

## Como abrir no VS Code

1. Abra o VS Code e vá em **Arquivo → Abrir Pasta** e escolha `black-gold-barber`.
2. Abra o `index.html`.

## Como executar localmente

- **Mais simples:** dê duplo clique no `index.html` para abrir no navegador.
- **Recomendado:** instale a extensão **Live Server** no VS Code, clique com o botão direito no `index.html` e escolha **Open with Live Server**.

## Como personalizar

| O que | Onde |
|---|---|
| Nome e logotipo | `index.html` (classes `logo__mark` e `logo__sub`, no cabeçalho e no rodapé) e `assets/favicon.svg` |
| Serviços e preços | `index.html`, seção `#servicos` (atributos `data-service` e `data-price` e o texto do card). O formulário e a tabela de preços se atualizam sozinhos a partir dos cards |
| Serviço "mais pedido" | classe `card--popular` e o `<span class="badge">` do card |
| Profissionais | `index.html`, seção `#profissionais`. Mantenha os mesmos nomes na lista `barbers` do `js/script.js` e no `<select id="barber">` |
| Imagens | troque os `src` no `index.html` por arquivos em `assets/images/` (ex.: `assets/images/hero.jpg`) |
| Cores e fontes | variáveis no topo do `css/style.css` |
| Horários de atendimento | objeto `hours` no `js/script.js` e o texto da seção `#contato` |
| Textos, endereço e depoimentos | `index.html` (os depoimentos de exemplo são fictícios) |

## Como configurar o WhatsApp comercial

No início do `js/script.js`, edite o objeto `CONFIG`:

```js
whatsappNumber: "5500000000000",   // troque pelo número real, só dígitos, com 55 + DDD
phoneDisplay: "(00) 00000-0000",
```

Esse número é só um placeholder. Os botões de WhatsApp do site e a mensagem do agendamento usam esse valor. Instagram e Facebook ficam em `CONFIG.social`.

## Horários ocupados (demonstração)

Os horários ocupados são simulados e as reservas feitas ficam no **localStorage** do navegador. Isso **não** sincroniza entre aparelhos e não substitui um sistema de agenda. Para desligar a simulação, use `simulateBusySlots: false`. O botão "Limpar horários de demonstração" apaga as reservas salvas.

## Como publicar gratuitamente

**GitHub Pages**
1. Crie um repositório no GitHub e envie os arquivos (`git init`, `git add .`, `git commit`, `git push`).
2. No repositório, vá em **Settings → Pages**.
3. Em **Source**, escolha a branch `main` e a pasta `/ (root)`, e salve.
4. Em alguns minutos o site estará em `https://seu-usuario.github.io/nome-do-repositorio/`.

**Netlify ou Vercel:** crie uma conta, escolha importar do GitHub (ou arraste a pasta, no Netlify Drop) e publique. Não é preciso configurar build.

## Antes de usar com um cliente real

- Substitua o número de WhatsApp, o endereço, os horários e os links de redes sociais.
- Troque as imagens por fotos reais, ou confirme a licença das imagens usadas.
- Remova os depoimentos fictícios e o aviso de demonstração.
- Para agenda real, será preciso um sistema com banco de dados (fora do escopo desta demo).
