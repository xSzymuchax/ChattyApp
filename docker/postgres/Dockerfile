FROM postgres:18

COPY init.sh /docker-entrypoint-initdb.d/init.sh
RUN sed -i 's/\r$//' /docker-entrypoint-initdb.d/init.sh \
    && chmod +x /docker-entrypoint-initdb.d/init.sh
