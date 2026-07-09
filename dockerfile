# ========= Build React =========
FROM node:22 AS frontend-builder

WORKDIR /frontend

COPY chatflow_frontend/package*.json ./

RUN npm install

COPY chatflow_frontend/ .

RUN npm run build


# ========= Python =========
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

COPY chatflow_backend/requirements.txt .

RUN pip install --upgrade pip

RUN pip install --no-cache-dir -r requirements.txt

# کپی کردن پروژه Django
COPY chatflow_backend/ /app/

# کپی فایل Build شده React داخل Nginx
COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html

# کپی تنظیمات Nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# کپی تنظیمات Supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]