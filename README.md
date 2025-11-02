# Library Management System

Professional, full-stack Library Management System combining a Spring Boot backend, a React frontend, and a Python-based recommendation microservice.

## Table of Contents
- About
- Features
- Architecture
- Tech stack
- Quickstart
  - Prerequisites
  - Clone
  - Run backend
  - Run frontend
  - Run recommendation service
- Configuration
  - Database
  - Environment variables
- API examples
- Data & Recommendation Service
- Testing
- Development notes
- Contributing
- Troubleshooting
- License & Contacts

## About

This repository contains a Library Management System intended as a production-grade starter project for managing books, loans, ratings and users. It includes:

- A Spring Boot backend (REST API) written in Java and packaged with Maven.
- A React frontend single-page app (in `frontend/`).
- A Python FastAPI-based recommendation microservice (in `python-recommendation-service/`) which provides popular and content-based recommendations by querying the same Postgres database.

## Features

- User registration & authentication (JWT / Spring Security).
- Book catalog with search.
- Loans and loan management.
- Ratings for books.
- Recommendation endpoints (popular & content-based) served by a Python microservice.
- Admin endpoints for managing users and books.

## Architecture

- Client: React SPA (frontend/). Communicates with backend at `http://localhost:8080` by default.
- API: Spring Boot application serving REST endpoints under `/api/*`.
- Recommendation microservice: FastAPI app (port 8000) exposing endpoints like `/popular` and `/content-based/{book_id}`. The Spring Boot backend calls this service at `python.api.url` configured in `application.properties`.
- Database: PostgreSQL (configured in `src/main/resources/application.properties`).

## Tech stack

- Java 11+ and Spring Boot
- Maven (mvnw wrapper included)
- React (Create React App)
- Node.js & npm
- Python 3.8+, FastAPI, scikit-learn, pandas, psycopg2
- PostgreSQL

## Quickstart

Prerequisites

- Java 11+ (or matching JDK used by the project)
- Maven (optional — the Maven wrapper `mvnw`/`mvnw.cmd` is included)
- Node.js (16+) and npm
- Python 3.8+ and virtualenv (for recommendation service)
- PostgreSQL (running locally or reachable from the app)

Clone the repository

```powershell
git clone https://github.com/PXDHU/Library_Management_System.git
cd Library_Management_System
```

Run the backend (Windows PowerShell)

Set your DB name in `src/main/resources/application.properties` or override via environment variables (examples below). Using the included Maven wrapper on Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Or build and run the JAR:

```powershell
.\mvnw.cmd clean package -DskipTests
java -jar target\*.jar
```

Run the frontend

```powershell
cd frontend
npm install
npm start
# React dev server runs on http://localhost:3000 by default
```

Run the recommendation service

```powershell
cd python-recommendation-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python recommendation_service.py
# or run via uvicorn if you prefer
# uvicorn recommendation_service:app --host 0.0.0.0 --port 8000
```

By default the Spring Boot app expects the recommendation API at `http://localhost:8000` (see `python.api.url` in `application.properties`).

## Configuration

Database (Postgres)

The repository's `src/main/resources/application.properties` is preconfigured to use PostgreSQL:

- `spring.datasource.url=jdbc:postgresql://localhost:5432/`
- `spring.datasource.username=postgres`
- `spring.datasource.password=` (empty by default — update it)

Update the JDBC URL to include your database name. Example for a DB named `librarydb`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/librarydb
spring.datasource.username=postgres
spring.datasource.password=your_postgres_password
```

You can also override these using environment variables when running the JVM process:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

Recommendation service DB connection

The Python recommendation service connects directly to PostgreSQL (see `python-recommendation-service/recommendation_service.py`). Update the `psycopg2.connect(...)` block to use your DB/credentials or make it configurable using environment variables.

Other config

- `server.port` in `application.properties` to change backend port (default 8080).
- `python.api.url` to point the backend to the recommendation microservice.

## API examples

The backend exposes REST endpoints under `/api`. A few key examples (see controller classes in `src/main/java/com/example/Library_Management/controller/` for full details):

- List or search books

  GET /api/books
  GET /api/books?title={title}

  Example:
  ```bash
  curl "http://localhost:8080/api/books?title=clean+code"
  ```

- Popular books (calls the Python microservice)

  GET /api/books/popular

  ```bash
  curl http://localhost:8080/api/books/popular
  ```

- Content-based recommendations (from ISBN)

  GET /api/books/{isbn}/recommendations/content-based

  ```bash
  curl http://localhost:8080/api/books/9780132350884/recommendations/content-based
  ```

- User registration and auth

  POST /api/users/register
  POST /api/users/login

See `UserController.java`, `LoanController.java`, `RatingController.java` and `AdminController.java` for more endpoints and request/response shapes.

## Data & Recommendation Service

- The repository contains a `python-recommendation-service` that expects book and rating tables in the Postgres database. It queries the `book` and `rating` tables directly (see `recommendation_service.py`).
- The service exposes two main FastAPI endpoints:
  - `GET /popular` — returns top-rated/popular book titles
  - `GET /content-based/{book_id}` — returns content-based recommendations using TF-IDF on title/author/publisher
- When running locally, ensure the Python service can connect to the same Postgres instance used by the Spring Boot backend. Update credentials in `recommendation_service.py` or adapt the code to read environment variables.

Dataset

- Some CSV files for experiments are available under `python-recommendation-service/dataset/` (if present). They are useful for offline testing and prototyping the recommendation models.

## Testing

Backend unit tests live in `src/test/java/` and can be run with Maven:

```powershell
.\mvnw.cmd test
```

Frontend tests (if available) run with:

```powershell
cd frontend
npm test
```

Python service: create a virtualenv and run unit tests (if present) or test endpoints with `curl`/Postman.

## Development notes & best practices

- Keep `application.properties` out of source for sensitive credentials in production — use environment variables, Vault, or other secret management.
- The recommendation service currently contains DB credentials in-code; refactor to use environment variables or a config file for production readiness.
- Consider adding Dockerfiles and a docker-compose to run Postgres, backend, frontend and recommendation service together for local integration testing.

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-change`
3. Add tests for new behavior
4. Open a pull request describing your changes

Please run existing tests before opening a PR.

## Troubleshooting

- If the backend fails to start due to DB errors:
  - Confirm Postgres is running and reachable.
  - Confirm database name and credentials in `application.properties`.
  - Ensure the JDBC URL includes the database name (e.g. `/librarydb`).
- If the Python service fails to connect:
  - Update `recommendation_service.py` DB credentials or change the code to read environment variables.
  - Install missing packages: `pip install -r requirements.txt`.
- If the frontend cannot call the backend due to CORS, confirm `@CrossOrigin` settings in controllers or adjust the frontend `proxy` setting while developing.

## License & Contacts

This repository does not currently include a LICENSE file. Add a license that fits your needs (MIT, Apache-2.0, etc.).

Maintainer / Contact

- Please open issues or pull requests on the repository for bugs, questions and improvements.

---
