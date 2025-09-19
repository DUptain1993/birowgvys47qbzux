# Use official Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Expose port 8443 for HTTPS
EXPOSE 8443

# Set environment variables for SSL cert paths (optional defaults)
ENV SSL_CERT_PATH=/certs/fullchain.pem
ENV SSL_KEY_PATH=/certs/privkey.pem

# Run entrypoint script
ENTRYPOINT ["./entrypoint.sh"]

