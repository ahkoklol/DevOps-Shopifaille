# Image de base : Nginx léger
FROM nginx:alpine

# On remplace la config par la nôtre
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# On copie les fichiers buildés dans le répertoire servi par Nginx
# Si ton dossier s’appelle "build", remplace "dist" par "build"
COPY dist/ /usr/share/nginx/html

# Nginx écoute sur le port 80 dans le conteneur
EXPOSE 80
