FROM python:3.13-slim

WORKDIR /app

COPY backend/chatflow_backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/chatflow_backend/ .

EXPOSE 8000

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "massagebox.asgi:application"]