FROM python:3.10

# Copy requirements.txt
COPY requirements.txt . 

# Install the specified packages
RUN pip install -r requirements.txt

# Copy FastAPI code into container
COPY util.py .
COPY embed_service.py .

# Expose HTTPS port
EXPOSE 8080

CMD ["uvicorn", "embed_service:app", "--host", "0.0.0.0", "--port", "8080"]
