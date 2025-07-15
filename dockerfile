# Stage 1: Build
FROM node:20-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos necessários para instalar dependências
COPY package*.json ./

# Instala dependências (pode ser npm ou yarn)
RUN npm install

# Copia todo o código para dentro da imagem
COPY . .

# Constrói o projeto (se estiver usando NestJS, normalmente `npm run build`)
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos de produção do build anterior
COPY package*.json ./

# Instala apenas as dependências de produção
RUN npm install --only=production

# Copia os arquivos buildados
COPY --from=builder /app/dist ./dist

# Expõe a porta (ajuste conforme seu app)
EXPOSE 3000

# Comando padrão
CMD ["node", "dist/main.js"]
