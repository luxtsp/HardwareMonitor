NAME := HWmonitor

run:
	python3 -m uv run main.py

clean:
	rm -rf __pycache__ */*/__pycache__ */__pycache__ */*/*/__pycache__ .mypy_cache test.txt .venv

format:
	python3 -m black -l 79 web_monitor

lint:
	python3 -m uv run -m flake8 --exclude=__pycache__,.venv .
	python3 -m uv run -m mypy . --warn-return-any --warn-unused-ignores --ignore-missing-imports --disallow-untyped-defs --check-untyped-defs

lint-strict:
	python3 -m uv run -m flake8 --exclude=__pycache__,.venv .
	python3 -m uv run -m mypy . --strict