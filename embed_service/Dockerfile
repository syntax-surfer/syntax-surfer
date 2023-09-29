FROM python:3.10

WORKDIR /embed_service

# Copy the current directory contents into the container
COPY . /embed_service

# Install the specified packages
RUN pip install -r requirements.txt

# Expose HTTPS port
EXPOSE 8080

CMD ["uvicorn", "embed_service:app", "--host", "0.0.0.0", "--port", "8080"]
