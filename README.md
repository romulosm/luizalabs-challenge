# 🎵 Artista Front Spotify — Backend

Este projeto é o backend do **Artista Front Spotify**, uma plataforma que integra com a API do Spotify para gerenciar usuários, artistas favoritos, playlists e muito mais. Foi desenvolvido com **NestJS**, seguindo boas práticas de arquitetura escalável e modular.

---

## 🚀 Tecnologias utilizadas

- **NestJS** — Framework progressivo para Node.js, ideal para construir aplicações escaláveis, seguras e testáveis.
- **TypeScript** — Tipagem estática para maior segurança e produtividade.
- **MongoDB** — Banco de dados NoSQL, flexível e rápido.
- **JWT (JSON Web Tokens)** — Para autenticação segura e moderna.
- **Spotify API** — Integração completa com a conta do usuário.

---

## 💡 Por que NestJS?

Escolhemos o **NestJS** por:

- Arquitetura baseada em módulos e injeção de dependências.
- Estrutura pronta para testes unitários e integração.
- Suporte nativo a TypeScript.
- Flexibilidade para integração com diferentes bancos e provedores.

---

## 🔐 Autenticação com Spotify

A autenticação usa OAuth 2.0 com a API do Spotify, garantindo uma experiência segura e moderna para o usuário.

### 💬 Por que salvar os tokens?

Após o login, o Spotify retorna dois tokens:

- **Access token**: usado para acessar recursos protegidos (por exemplo, playlists e artistas). Ele tem duração curta (em geral, 1 hora).
- **Refresh token**: usado para gerar novos access tokens sem precisar solicitar novo login ao usuário.

Salvamos esses tokens no banco de dados vinculados ao usuário para:

- Permitir acesso contínuo aos dados do Spotify mesmo após expirar o access token.
- Evitar forçar o usuário a logar novamente sempre que o token expira.
- Suportar atualizações automáticas e operações em background (por exemplo, sincronizar playlists ou artistas salvos).

---

### 🔁 Refresh automático

Quando o **access token** expira, o backend usa o **refresh token** para solicitar ao Spotify um novo access token de forma transparente para o usuário.  
Esse processo garante uma sessão fluida e contínua, sem necessidade de interação extra.

---

### 🔒 Uso do JWT

Após finalizar a autenticação com o Spotify, o backend emite um **JWT** próprio contendo:

- O identificador interno do usuário (`sub`)
- O `spotifyId`
- Outros claims úteis

Esse JWT é utilizado em todas as rotas protegidas do backend (por exemplo, `/me`, `/playlists`, etc.).  
Assim, o frontend consegue autenticar cada requisição de forma segura, sem expor diretamente os tokens do Spotify.

---

### ✅ Fluxo resumido

1️⃣ O usuário clica em **Login com Spotify** no frontend.  
2️⃣ É redirecionado para a página de autorização do Spotify.  
3️⃣ Após consentimento, o Spotify retorna **access token** e **refresh token**.  
4️⃣ O backend salva os tokens e emite um **JWT** próprio para o frontend.  
5️⃣ O frontend usa o JWT para acessar rotas autenticadas.  
6️⃣ O backend renova automaticamente o access token quando necessário usando o refresh token.

---

## 🗂️ Estrutura de pastas

```plaintext
src/
├── auth/
│   ├── dto/
│   ├── guards/
│   ├── interfaces/
│   ├── strategies/
│   ├── test/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
│
├── config/
│   ├── test/
│   │   └── config.service.spec.ts
│   ├── config-env.model.ts
│   ├── config.module.ts
│   └── config.service.ts
│
├── shared/
│   ├── code-errors.enum.ts
│   ├── coded-validation.pipe.ts
│   ├── coded.exception.ts
│   └── http-exception.filter.ts
│
├── spotify-api/
│   ├── interfaces/
│   ├── test/
│   ├── spotify-api.controller.ts
│   ├── spotify-api.module.ts
│   └── spotify-api.service.ts
│
├── user/
│   ├── repository/
│   │   └── user.repository.ts
│   ├── schemas/
│   │   └── user.schema.ts
│   ├── test/
│   │   ├── user.service.spec.ts
│   │   ├── user.module.ts
│   │   ├── user.service.ts
│   │   ├── app.controller.spec.ts
│   │   ├── app.module.ts
│   │   └── app.service.ts
│   ├── user.module.ts
│   ├── user.service.ts
│   └── app.controller.ts
│
├── app.module.ts
├── app.service.ts
└── main.ts
```

---

## ⚙️ Como instalar

```bash
git clone https://github.com/romulosm/luizalabs-challenge
cd luizalabs-challenge
npm install
```

---

## 🧪 Rodar testes

```bash
npm run test
```

Para ver cobertura de testes:

```bash
npm run test:cov
```

---

## 💻 Rodar o projeto localmente

```bash
npm run start:dev
```

O servidor vai iniciar em `http://localhost:3000` (ou porta definida no `.env`).

---

## 🛠️ Variáveis de ambiente

Copie o arquivo exemplo:

```bash
cp .env.sample .env
```

Edite as variáveis conforme necessário:

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://your-app-url.com/auth/callback
SPOTIFY_API_BASE_URL=https://api.spotify.com/v1
SPOTIFY_ACCOUNTS_URL=https://accounts.spotify.com/api/token
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
MONGODB_URI=mongodb://user:password@db:27017/your-database?authSource=admin
NODE_ENV=development
HTTP_PORT=3000
```

---

## 🐳 Docker

### 📄 Dockerfile

```dockerfile
# Usa imagem oficial do Node
FROM node:20

# Define diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o restante do projeto
COPY . .

# Compila a aplicação
RUN npm run build

# Expõe a porta
EXPOSE 3000

# Comando para iniciar
CMD ["npm", "run", "start:prod"]
```

---

### ⚙️ docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    env_file:
      - .env
    depends_on:
      - mongo
  mongo:
    image: mongo:6
    restart: always
    ports:
      - '27017:27017'
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

---

### 🚀 Rodar com Docker

```bash
docker-compose up --build
```

A aplicação ficará disponível em `http://localhost:3000` e o MongoDB em `mongodb://localhost:27017`.

---

## ✅ Funcionalidades principais

- Login e logout usando Spotify
- Registro automático ou atualização do usuário no primeiro login
- Emissão de JWT para sessões autenticadas
- Gerenciamento de tokens de acesso e refresh
- Exclusão de conta (rota de logout e exclusão completa)

---

## 🏗️ Arquitetura

O projeto segue arquitetura **modular**, facilitando manutenção, testes e escalabilidade. Cada domínio (auth, user, spotify-api) possui seu próprio módulo, service, controller e schemas.

Utilizamos **repository pattern** para isolar o acesso ao banco de dados.

---

## 🤝 Contribuições

Sinta-se à vontade para abrir **issues**, enviar **pull requests** ou sugerir melhorias!

---

## 📄 Licença

MIT

---

## 🌟 Agradecimentos

Obrigado por explorar este projeto!  
Feito com 💙 e muito café.

---
