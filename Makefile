SHELL = /bin/bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
.DEFAULT_GOAL := help

export PYTHONPATH
export PIPENV_VENV_IN_PROJECT=1

PYTHON := python3
PIP := $(PYTHON) -m pip
PIPENV := $(PYTHON) -m pipenv
PYLINT := $(PIPENV) run pylint
BLACK := $(PIPENV) run black
MYPY := $(PIPENV) run mypy
ISORT := $(PIPENV) run isort

APP_NAME = rentoza_cocktail_api:0.0.1
APP_DIR = rentoza_cocktail_api
TEST_SRC = $(APP_DIR)/tests
DOCKER_RUN = docker run --rm --mount type=bind,source="$(shell pwd)/",target=/root/ $(APP_NAME)

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


### Local commands ###

venv:
	$(PIP) install -U pipenv
	$(PIPENV) shell

install-packages:
	pipenv install --dev

lint:
	$(PYLINT) -E $(APP_DIR) || pylint-exit $$?

format:
	$(BLACK) $(APP_DIR)
	$(ISORT) $(APP_DIR)

check-typing:
	$(MYPY) $(APP_DIR)

lint-and-format: ## Lint, format and static-check
	$(PYLINT) -E $(APP_DIR) || pylint-exit $$?
	$(MYPY) $(APP_DIR)
	$(BLACK) $(APP_DIR)
	$(ISORT) $(APP_DIR)

local:
	$(PYTHON) $(APP_DIR)/manage.py migrate && python3 $(APP_DIR)/manage.py runserver

migrate:
	$(PYTHON) $(APP_DIR)/manage.py migrate --check --no-input

checkmigrations:
	$(PYTHON) $(APP_DIR)/manage.py makemigrations --check --no-input --dry-run

### Docker commands ###

build-docker-image: ## Build the docker image and install python dependencies
	docker build --no-cache -t $(app_name) .
	$(docker_run) pipenv install --dev
	$(docker_run) pipenv install
	$(docker_run) pre-commit install

docker-compose-up:
	docker-compose build
	docker-compose -f up -d

docker-compose-down:
	docker-compose down

format: ## Format code
	$(docker_run) pipenv run format

lint: ## Lint the code
	$(docker_run) pipenv run lint

test: ## Run tests
	$(docker_run) pipenv run test

### General commands ###

# Consider using test-dev or test-deploy instead
testcov:
	pytest $(tests_src)
	@echo "building coverage html"
	@coverage html
	@echo "opening coverage html in browser"
	@open htmlcov/index.html

clean: # Removes all cache files
	rm -rf `find . -name __pycache__`
	rm -f `find . -type f -name '*.py[co]' `
	rm -f `find . -type f -name '*~' `
	rm -f `find . -type f -name '.*~' `
	rm -rf `find . -type d -name '*.egg-info' `
	rm -rf `find . -type d -name 'pip-wheel-metadata' `
	rm -rf .cache
	rm -rf .pytest_cache
	rm -rf .mypy_cache
	rm -rf htmlcov
	rm -rf *.egg-info
	rm -f .coverage
	rm -f .coverage.*
	rm -rf build

full-clean: # Removes virtualenv and all cache files
	$(PIPENV) --rm
	rm -rf `find . -name __pycache__`
	rm -f `find . -type f -name '*.py[co]' `
	rm -f `find . -type f -name '*~' `
	rm -f `find . -type f -name '.*~' `
	rm -rf `find . -type d -name '*.egg-info' `
	rm -rf `find . -type d -name 'pip-wheel-metadata' `
	rm -rf .cache
	rm -rf .pytest_cache
	rm -rf .mypy_cache
	rm -rf htmlcov
	rm -rf *.egg-info
	rm -f .coverage
	rm -f .coverage.*
	rm -rf build

.PHONY: venv install clean full-clean install-git-hooks local checkmigrations
	lint-and-format pylint-full check-coding-style format check-typing
	build-docker-image testcov test docker-compose-up help
