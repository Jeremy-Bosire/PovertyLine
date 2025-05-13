---
trigger: always_on
---

### 🔄 Project Awareness & Context
- **Always read `PLANNING.md`** at the start of a new conversation to understand PovertyLine's architecture, goals, style, and constraints.
- **Check `TASK.md`** before starting a new task. If the task isn't listed, add it with a brief description and today's date.
- **Use consistent naming conventions, file structure, and architecture patterns** as described in `PLANNING.md`, focusing on the React/Redux frontend and Flask backend structure.

### 🧱 Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility (users, profiles, resources, matching, analytics).
- **Use clear, consistent imports** (prefer relative imports within packages).

### 🧪 Testing & Reliability
- **Always create unit tests for new features**:
 - Jest tests for React frontend components
 - Pytest for Flask backend functions, classes, routes
- **After updating any logic**, check whether existing unit tests need to be updated. If so, do it.
- **Tests should live in a `/tests` folder** mirroring the main app structure.
 - Include at least:
   - 1 test for expected use
   - 1 edge case
   - 1 failure case (especially important for authentication and authorization flows)

### ✅ Task Completion
- **Mark completed tasks in `TASK.md`** immediately after finishing them.
- Add new sub-tasks or TODOs discovered during development to `TASK.md` under a "Discovered During Work" section.
- Track which part of the project (frontend, backend, database) the task belongs to.

### 📎 Style & Conventions
- **For Backend**:
 - **Use Python** with Flask framework
 - **Follow PEP8**, use type hints, and format with `black`
 - **Use `pydantic` for data validation**
 - Use `SQLAlchemy` as ORM with PostgreSQL
 - Write **docstrings for every function** using the Google style

- **For Frontend**:
 - Use React functional components with hooks
 - Follow Airbnb JavaScript style guide
 - Use Redux Toolkit for state management
 - Implement proper prop validation
 - Create reusable components where possible

### 📚 Documentation & Explainability
- **Update `README.md`** when new features are added, dependencies change, or setup steps are modified.
- **Comment non-obvious code** and ensure everything is understandable to a mid-level developer.
- When writing complex logic, **add an inline `# Reason:` comment** explaining the why, not just the what.
- Document all API endpoints comprehensively with examples.

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
- **Never delete or overwrite existing code** unless explicitly instructed to or if part of a task from `TASK.md`.
- **Focus on mobile-first design** for all frontend components, as this is critical for the target user demographic.
- **Consider data privacy and security** in all implementations, especially for sensitive user profile data.