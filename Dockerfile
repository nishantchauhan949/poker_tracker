# Use the official Python Alpine image from the Docker Hub
FROM python:3.12-alpine
LABEL authors="nishant"

# Set the working directory in the container
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gcc musl-dev

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --upgrade pip wheel setuptools
RUN pip install --no-cache-dir -r requirements.txt

# Create the matches directory
RUN mkdir -p /app/matches

# Copy only the specified files and directories into the container at /app
COPY app.py .
COPY static/ ./static/
COPY templates/ ./templates/

# Expose the port that the app runs on
EXPOSE 5000

# Define environment variable
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Run the application
CMD ["flask", "run"]