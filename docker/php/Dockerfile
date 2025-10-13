FROM php:8.4-fpm

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    git \
    unzip \
    ca-certificates \
    pkg-config \
    libonig-dev \
    libicu-dev \
    libxml2-dev \
    libzip-dev \
    zlib1g-dev \
 && docker-php-ext-configure intl \
 && docker-php-ext-install -j"$(nproc)" \
    pdo_mysql \
    intl \
    zip \
    mbstring \
    bcmath \
    exif \
    opcache \
 && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Align www-data UID/GID to host developer (optional, best-effort)
RUN usermod -u 1000 www-data || true \
 && groupmod -g 1000 www-data || true

EXPOSE 9000
CMD ["php-fpm"]
