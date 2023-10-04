FROM python:3.11-slim

RUN pip install pipenv

WORKDIR /app/backend

COPY Pipfile Pipfile.lock .env ./
RUN pipenv install --system --deploy

RUN ./manage.py collectstatic --noinput
RUN ./manage.py migrate

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--threads", "4"]
