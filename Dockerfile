FROM nginx
COPY dist /usr/share/nginx/html
COPY nginx-conf/default.conf /etc/nginx/conf.d/default.conf
