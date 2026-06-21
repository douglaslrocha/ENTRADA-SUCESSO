# Estágio de Build do Frontend e Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos do root e instala dependências
COPY package.json ./
RUN npm install --no-audit

# Copia o restante do código do frontend
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts eslint.config.js index.html ./
COPY src/ ./src
COPY public/ ./public

# Build do frontend (gera a pasta /app/dist)
RUN npm run build

# Copia arquivos do backend e instala dependências do backend
COPY backend/package.json ./backend/
RUN cd backend && npm install --no-audit

# Copia código do backend e compila
COPY backend/tsconfig.json ./backend/
COPY backend/src/ ./backend/src
RUN cd backend && npm run build


# Estágio de Produção
FROM node:20-alpine

# Instala Nginx, Supervisor e utilitários
RUN apk add --no-cache nginx supervisor

WORKDIR /app

# Copia build do frontend para a pasta do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia build do backend e dependências de produção
COPY --from=builder /app/backend/dist /app/backend/dist
COPY --from=builder /app/backend/node_modules /app/backend/node_modules
COPY --from=builder /app/backend/package.json /app/backend/package.json
COPY backend/data /app/backend/data

# Copia arquivos de configuração do Nginx e Supervisord
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

# Cria pastas necessárias para Nginx e Uploads
RUN mkdir -p /run/nginx /app/uploads /app/applet \
    && ln -s /app/uploads /app/applet/uploads

# Expõe a porta 80 do Nginx
EXPOSE 80

# Comando para iniciar o supervisor (que gerencia o backend e o nginx)
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
