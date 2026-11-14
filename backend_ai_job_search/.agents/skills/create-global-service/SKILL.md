# Skill: Global Service Generator (`create-global-service`)

## Description
Generates a standalone global service inside `src/common/services/<service_name>/` matching the project's established architectural patterns. The generated feature contains only the module and the service (no entities, DTOs, or controllers), utilizes the performance measurement decorator `@Measure('<ClassNameService>')`, logs execution via `Logger.log`, must be marked as global (`@Global()`), and must be exported/registered in `src/index.ts`.

---

## File Structure Hierarchy
For a given service name (e.g., `logger`, `metrics`, `cache`), create the following structure inside `src/common/services/<service_name>/`:

```text
src/
├── common/
│   │   ├── services/
│   │   │   ├── <service_name>/
│   │   │   │   ├── <service_name>.service.ts
│   │   │   │   └── <service_name>.module.ts
└── index.ts