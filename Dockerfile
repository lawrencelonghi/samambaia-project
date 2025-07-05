# Use the official Python 3.11 image as the base
FROM python:3.11-slim-bullseye

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Python dependencies
COPY requirements.txt .
RUN /root/.cargo/bin/uv pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files (if needed)
# RUN python manage.py collectstatic --noinput

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
#CMD ["gunicorn", "--bind", "0.0.0.0:8000", "your_project.wsgi:application"]