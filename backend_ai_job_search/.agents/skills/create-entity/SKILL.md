# Skill: NestJS Entity & Feature Generator (`create-entity`)

## Description
Generates a complete feature module inside `src/entities/<entity_plural>/` matching the project's established architectural patterns. All CRUD endpoints must accept payload data in the HTTP request body (`@Body()`) via validated DTOs, be documented with Swagger decorators (`@ApiProperty`, `@ApiOperation`), utilize the performance measurement decorator `@Measure('<ClassNameService>')`, log execution via `Logger.log`, and export/register the module in `src/index.ts`.

---

## File Structure Hierarchy
For a given entity (e.g., `vacances`, `telemetry`), create the following structure inside `src/entities/<entity_plural>/`:

```text
src/
├── entities/
│   ├── <entity_plural>/
│   │   ├── dto/
│   │   │   ├── create-<entity_singular>.dto.ts
│   │   │   ├── update-<entity_singular>.dto.ts
│   │   │   └── <entity_singular>-id.dto.ts
│   │   ├── <short_name>.controller.ts
│   │   ├── <short_name>.entity.ts
│   │   ├── <short_name>.module.ts
│   │   └── <short_name>.service.ts
└── index.ts