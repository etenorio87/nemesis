# QUICK START Proyecto Nemesis

Esta guía asume que tiene `node >= 22`, `npm >= 11` y `docker` instalados.

### 1. Infraestructura (Docker)

Inicie la base de datos (MariaDB) y el caché (Redis) en contenedores Docker.

```bash
cd docker
docker-compose up -d

# Instalar dependencias
npm install

# Aplicar migraciones de base de datos (si es la primera vez)
npx nx prisma-migrate-dev nemesis-server

# Levantar el servidor
npx nx serve nemesis-server
