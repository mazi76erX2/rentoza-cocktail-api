# Running Backend and Frontend with Docker Compose

This guide explains how to run the backend and frontend of your application using Docker Compose. The provided Dockerfiles are located in the following directories:

- Frontend: `docker/frontend/Dockerfile`
- Backend: `docker/backend/Dockerfile`
- Database (PostgreSQL): `docker/postgres/Dockerfile`
- Nginx: `docker/nginx/Dockerfile`

## Prerequisites

Make sure you have the following installed on your machine:

- Docker: https://docs.docker.com/get-docker/
- Docker Compose: https://docs.docker.com/compose/install/

## Steps

1. Clone the repository:

```bash
git clone https://github.com/mazi76erX2/rentoza-cocktail-api.git
```

Navigate to the project directory:
```bash
cd rentoza-cocktail-api
```

Build the Docker images for the frontend, backend, database, and nginx:

```bash
docker-compose build
```

Start the Docker containers:

```bash
docker-compose up
```

This command will start the containers defined in the `docker-compose.yml` file.

#### Access the application:

Frontend: Open your web browser and visit http://localhost:3000.
Backend: The backend API will be accessible at http://localhost:8000.
Database: The PostgreSQL database will be running internally within the Docker network.


## Run tests:

Frontend: Open a new terminal window, navigate to the frontend directory, and run the following command:

```bash
docker-compose run frontend npm run test
```
This command will execute the tests for the frontend using the configured test runner (e.g., Jest).

Backend: Open a new terminal window, navigate to the backend directory, and run the following command:

```bash
docker-compose run backend python3 manage.py test
```
This command will execute the tests for the backend using the Django test framework.

### Stop the containers:

To stop the containers and remove the associated resources, press Ctrl + C in the terminal where the containers are running.

Alternatively, you can run the following command in a new terminal window:

```bash
docker-compose down
```

This command will stop and remove the containers, networks, and volumes created by Docker Compose.
Customization
If you need to customize any configuration settings or environment variables, you can modify the following files:

Backend: docker-compose.yml and .env file (if present).
Frontend: docker-compose.yml and .env file (if present).
Nginx: docker-compose.yml and docker/nginx/nginx.conf file.
Make sure to rebuild the Docker images after making any changes to the configuration:

```bash
docker-compose build
```

### Troubleshooting
If any issues arise during the build or startup process, make sure you have followed the steps correctly and that all prerequisites are installed.
Check the terminal output for any error messages or logs from the containers.
Refer to the documentation of the specific tools or frameworks used in your application for further troubleshooting steps.
