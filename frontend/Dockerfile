FROM node:20-alpine

WORKDIR /app

# Copiamos package.json primero para aprovechar la caché de Docker
COPY package.json package-lock.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de desarrollo de Vite
EXPOSE 5173

# Arrancamos en modo desarrollo hosteado para Docker
CMD ["npm", "run", "dev", "--", "--host"]