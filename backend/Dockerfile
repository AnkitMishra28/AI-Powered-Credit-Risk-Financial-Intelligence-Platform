# ==============================================================================
# CreditLens Backend Production Dockerfile (Multi-Stage)
# ==============================================================================

# Stage 1: Build Dependencies
FROM python:3.11-slim as builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Production Minimal Runtime
FROM python:3.11-slim as runner

WORKDIR /app

# Install runtime PostgreSQL client library & curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root system user for security
RUN groupadd -g 10001 creditlens && \
    useradd -u 10001 -g creditlens -s /bin/bash -m creditlens

# Copy installed Python packages from builder stage
COPY --from=builder /root/.local /home/creditlens/.local
ENV PATH=/home/creditlens/.local/bin:$PATH
ENV PYTHONPATH=/app

# Copy application source code and ML artifacts
COPY --chown=creditlens:creditlens . /app

USER creditlens

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://127.0.0.1:8000/api/v1/health/live || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2 --no-access-log"]