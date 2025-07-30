#!/bin/sh

echo "📦 Instalando dependências..."
npm install

echo "⚙️ Gerando Prisma Client..."
npx prisma generate

echo "🚀 Iniciando servidor..."
npx nodemon server.js
