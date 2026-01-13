FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create uploads and processed directories
RUN mkdir -p uploads processed

EXPOSE 5001

CMD ["gunicorn", "-w", "4", "--timeout", "120", "-b", "0.0.0.0:5001", "app:app"]
