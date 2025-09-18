FROM python:3.11-slim

# Set work directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all necessary code
COPY run.py .
COPY phantomnet ./phantomnet

# Optional: copy other files like config, .gitignore, README if needed for operation or documentation
COPY .gitignore .
COPY README.md .

# Expose port (change 8080 to whatever your app uses)
EXPOSE 8080

# Run the server
CMD ["python", "run.py"]
