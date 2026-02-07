# Dev Workflows CLI — Specification v0.1

> Contract de implementación. Si no está aquí, no se construye.

---

## 1. Resumen

**devw** es un CLI que permite a desarrolladores definir reglas de contexto una vez y compilarlas al formato nativo de cada AI editor.

- **Comando:** `devw`
- **Package name:** `dev-workflows`
- **Instalación:** `npm install -g dev-workflows` o `npx dev-workflows`
- **Licencia:** MIT
- **Repo:** `github.com/gpolanco/dev-workflows`

---

## 2. Decisiones cerradas

| Decisión | Valor |
|----------|-------|
| Formato fuente | YAML |
| Carpeta config | `.dwf/` |
| CLI framework | commander |
| Testing | node:test |
| Bridges v0.1 | Claude Code, Cursor, Gemini CLI |
| Modos | link + copy |
| Rule blocks en v0.1 | Sí |
| Estructura interna | Un archivo por scope |

---

## 3. Estructura de `.dwf/` en un proyecto

Cuando el usuario ejecuta `devw init`, se genera:

```
.dwf/
  config.yml              # Configuración del proyecto (tools, modo, metadata)
  rules/
    architecture.yml      # Reglas de arquitectura
    conventions.yml       # Convenciones de código
    security.yml          # Reglas de seguridad
    workflow.yml          # Reglas de workflow/proceso
    testing.yml           # Reglas de testing
```

### config.yml

```yaml
# Dev Workflows configuration
version: "0.1"

project:
  name: "my-app"
  description: "Optional project description"

tools:
  - claude
  - cursor
  - gemini

mode: copy  # copy | link

blocks: []  # Rule blocks instalados (se añaden con devw add)
```

### Archivos de reglas (ejemplo: architecture.yml)

```yaml
# .dwf/rules/architecture.yml
scope: architecture

rules:
  - id: named-exports
    severity: error          # error | warning | info
    content: |
      Always use named exports. Never use default exports.
      This applies to all files: components, utilities, hooks, and types.

  - id: feature-based-structure
    severity: error
    content: |
      Organize code by feature, not by type.
      Each feature folder contains its own components, hooks, utils, and types.

  - id: no-barrel-files
    severity: warning
    content: |
      Avoid barrel files (index.ts re-exports).
      Import directly from the source file.
```

### Campos de una regla

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Identificador único (kebab-case) |
| `severity` | enum | No | `error` \| `warning` \| `info` (default: `error`) |
| `content` | string | Sí | La regla en lenguaje natural (multiline YAML) |
| `tags` | string[] | No | Tags para filtrado (e.g. `[react, components]`) |
| `enabled` | boolean | No | Default: `true`. Permite desactivar sin borrar |

---

## 4. Comandos del CLI

### `devw init`

Inicializa `.dwf/` en el proyecto actual.

```bash
devw init
```

**Comportamiento:**

1. Detecta qué AI tools están configuradas en el proyecto (busca `.cursor/`, `CLAUDE.md`, `GEMINI.md`)
2. Pregunta interactivamente qué tools incluir (con las detectadas pre-seleccionadas)
3. Pregunta modo: `copy` (default) o `link`
4. Genera `.dwf/config.yml` + archivos de reglas vacíos (con comentarios de ejemplo)
5. Añade `.dwf/` al `.gitignore` si modo es `link` (no aplica si `copy`)

**Flags:**

| Flag | Descripción |
|------|-------------|
| `--tools claude,cursor,gemini` | Salta selección interactiva |
| `--mode copy\|link` | Salta selección interactiva |
| `--yes` / `-y` | Acepta todos los defaults |

---

### `devw compile`

Lee `.dwf/`, aplica bridges, genera output para cada tool configurada.

```bash
devw compile
```

**Comportamiento:**

1. Lee `.dwf/config.yml` para saber qué tools compilar
2. Lee todos los archivos de `.dwf/rules/`
3. Para cada tool, aplica el bridge correspondiente
4. Genera los archivos de output en el proyecto

**Output por bridge:**

| Tool | Output generado |
|------|----------------|
| Claude Code | `CLAUDE.md` en la raíz del proyecto |
| Cursor | `.cursor/rules/devworkflows.mdc` |
| Gemini CLI | `GEMINI.md` en la raíz del proyecto |

**Flags:**

| Flag | Descripción |
|------|-------------|
| `--tool claude` | Compila solo un bridge específico |
| `--dry-run` | Muestra output sin escribir archivos |
| `--verbose` | Muestra detalle de lo que se genera |

**Modo copy:** escribe los archivos directamente.
**Modo link:** crea symlinks desde el output hacia `.dwf/` (requiere que compile genere archivos intermedios en `.dwf/.cache/`).

---

### `devw doctor`

Valida el estado de la configuración.

```bash
devw doctor
```

**Checks:**

1. `.dwf/` existe y tiene `config.yml`
2. `config.yml` es válido (schema)
3. Archivos de reglas son YAML válido
4. No hay IDs de reglas duplicados (entre archivos)
5. Tools configuradas tienen su bridge disponible
6. Si modo link: symlinks son válidos
7. Si hay archivos compilados: están en sync con las reglas (hash comparison)

**Output:** lista de checks con ✓/✗ y mensaje descriptivo.

---

### `devw add <block>`

Instala un rule block precocinado.

```bash
devw add nextjs-approuter
devw add typescript-strict
```

**Comportamiento:**

1. Busca el block en el registry interno (distribuido con el package)
2. Mercea las reglas del block en los archivos de scope correspondientes
3. Añade el block a `config.yml > blocks[]`
4. Ejecuta `devw compile` automáticamente

**Flags:**

| Flag | Descripción |
|------|-------------|
| `--no-compile` | No auto-compila después de añadir |
| `--list` | Lista todos los blocks disponibles |

---

### `devw list`

Lista información sobre la configuración actual.

```bash
devw list rules       # Lista todas las reglas activas con su scope y severity
devw list blocks      # Lista blocks instalados
devw list tools       # Lista tools configuradas
```

---

### `devw remove <block>`

Elimina un rule block.

```bash
devw remove nextjs-approuter
```

Elimina las reglas que fueron añadidas por ese block y actualiza `config.yml`.

---

## 5. Bridges — Formato de output

### Bridge: Claude Code

**Output:** `CLAUDE.md` en la raíz del proyecto.

**Formato:**

```markdown
<!-- Generated by dev-workflows. Do not edit manually. -->
<!-- Source: .dwf/ | Compiled: 2025-02-07T10:30:00Z -->

# Project Rules

## Architecture

- Always use named exports. Never use default exports.
  This applies to all files: components, utilities, hooks, and types.

- Organize code by feature, not by type.
  Each feature folder contains its own components, hooks, utils, and types.

## Conventions

- Use kebab-case for file names.

## Security

- Every new table must have RLS policies before merging.
```

**Reglas del bridge:**
- Header con timestamp y warning de "no editar"
- Agrupado por scope (H2)
- Cada regla como bullet point
- Severity `error` y `warning` se incluyen. `info` se omite (solo es documentación interna)
- Reglas con `enabled: false` se omiten

---

### Bridge: Cursor

**Output:** `.cursor/rules/devworkflows.mdc`

**Formato:**

```markdown
---
description: Project rules generated by dev-workflows
globs:
alwaysApply: true
---

<!-- Generated by dev-workflows. Do not edit manually. -->

## Architecture

- Always use named exports. Never use default exports.

## Conventions

- Use kebab-case for file names.

## Security

- Every new table must have RLS policies before merging.
```

**Reglas del bridge:**
- Frontmatter MDC con `alwaysApply: true`
- Mismo agrupamiento por scope
- Un solo archivo `.mdc` (no uno por scope — simplifica v0.1)

---

### Bridge: Gemini CLI

**Output:** `GEMINI.md` en la raíz del proyecto.

**Formato:** Idéntico al bridge de Claude Code. Gemini CLI consume `GEMINI.md` con el mismo formato Markdown.

---

## 6. Rule Blocks (v0.1)

Los blocks se distribuyen dentro del package npm en `content/blocks/`.

### Blocks incluidos en v0.1

| Block ID | Scope principal | Descripción |
|----------|----------------|-------------|
| `typescript-strict` | conventions | Strict mode, no any, explicit return types |
| `nextjs-approuter` | architecture | App Router patterns, RSC, server actions |
| `react-conventions` | conventions | Hooks rules, component patterns, naming |
| `supabase-rls` | security | RLS enforcement, auth patterns |
| `tailwind` | conventions | Utility-first, no custom CSS, design tokens |
| `testing-basics` | testing | Test naming, coverage expectations, mocks |

### Formato de un block

```yaml
# content/blocks/typescript-strict.yml
id: typescript-strict
name: "TypeScript Strict"
description: "Strict TypeScript conventions for professional codebases"
version: "0.1.0"

rules:
  - id: ts-strict-no-any
    scope: conventions
    severity: error
    content: |
      Never use `any`. Use `unknown` when the type is truly unknown,
      then narrow with type guards.

  - id: ts-strict-explicit-returns
    scope: conventions
    severity: warning
    content: |
      Always declare explicit return types on exported functions.
      Inferred types are fine for internal/private functions.

  - id: ts-strict-no-enums
    scope: conventions
    severity: warning
    content: |
      Prefer union types over enums.
      Use `as const` objects when you need runtime values.

  - id: ts-strict-no-non-null-assertion
    scope: conventions
    severity: error
    content: |
      Never use non-null assertion (!). Handle null/undefined explicitly
      with optional chaining, nullish coalescing, or type guards.
```

---

## 7. Estructura del package

```
dev-workflows/
  packages/
    cli/
      src/
        index.ts                  # Entry point + commander setup
        commands/
          init.ts                 # devw init
          compile.ts              # devw compile
          doctor.ts               # devw doctor
          add.ts                  # devw add <block>
          remove.ts               # devw remove <block>
          list.ts                 # devw list [rules|blocks|tools]
        core/
          parser.ts               # Lee y valida .dwf/rules/*.yml
          compiler.ts             # Orquesta bridges
          schema.ts               # Validación de config y rules
          hash.ts                 # Checksum para detectar drift
        bridges/
          types.ts                # Interface Bridge
          claude.ts               # Claude Code bridge
          cursor.ts               # Cursor bridge
          gemini.ts               # Gemini bridge
        blocks/
          registry.ts             # Lee blocks disponibles
          installer.ts            # Merge block → rules
        utils/
          fs.ts                   # File system helpers
          detect-tools.ts         # Detecta .cursor/, CLAUDE.md, etc.
          logger.ts               # Output con colores/iconos
          prompt.ts               # Prompts interactivos (init)
      package.json
      tsconfig.json
      bin/
        devw.js                   # #!/usr/bin/env node

  content/
    blocks/
      typescript-strict.yml
      nextjs-approuter.yml
      react-conventions.yml
      supabase-rls.yml
      tailwind.yml
      testing-basics.yml

  docs/
    VISION_GENERAL.md
    ARCHITECTURE.md
    DECISIONS.md
    ROADMAP.md

  package.json                    # Workspace root
  pnpm-workspace.yaml
  tsconfig.json                   # Base tsconfig
  README.md
  CLAUDE.md
  LICENSE
```

---

## 8. Bridge interface

```typescript
interface Bridge {
  /** ID del bridge (claude, cursor, gemini) */
  id: string;

  /** Archivos que genera en el proyecto */
  outputPaths: string[];

  /**
   * Compila las reglas al formato nativo del tool.
   * Retorna un Map<filePath, content>.
   */
  compile(rules: Rule[], config: ProjectConfig): Map<string, string>;
}

interface Rule {
  id: string;
  scope: string;           // architecture, conventions, security, workflow, testing
  severity: 'error' | 'warning' | 'info';
  content: string;
  tags?: string[];
  enabled: boolean;
  sourceBlock?: string;    // ID del block que lo instaló (null si es manual)
}

interface ProjectConfig {
  version: string;
  project: {
    name: string;
    description?: string;
  };
  tools: string[];
  mode: 'copy' | 'link';
  blocks: string[];
}
```

---

## 9. Dependencias del CLI

```json
{
  "dependencies": {
    "commander": "^13.0.0",
    "yaml": "^2.7.0",
    "chalk": "^5.4.0",
    "ora": "^8.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0"
  }
}
```

**Nota:** Mínimas dependencias. No se necesita más para v0.1.

- `commander` → CLI framework
- `yaml` → Parser YAML
- `chalk` → Colores en terminal
- `ora` → Spinners (compile, add)

---

## 10. Plan de ejecución

### Sprint 1 — Core funcional (semana 1)

**Objetivo:** `devw init` + `devw compile` funcionan end-to-end.

| Tarea | Estimación |
|-------|-----------|
| Setup del package (tsconfig, bin, commander) | 2h |
| Schema de config.yml y rules (parser + validación) | 3h |
| `devw init` (con detección de tools + prompts) | 4h |
| Bridge: Claude Code | 2h |
| Bridge: Cursor | 3h |
| Bridge: Gemini | 1h |
| `devw compile` (orquestación) | 3h |
| Tests para parser, bridges, compile | 4h |

**Entregable:** puedes hacer `devw init` → escribir reglas → `devw compile` → ver CLAUDE.md y .cursor/rules generados.

### Sprint 2 — Blocks + Doctor (semana 2)

| Tarea | Estimación |
|-------|-----------|
| Content: escribir los 6 rule blocks | 4h |
| Block registry + installer | 3h |
| `devw add` + `devw remove` | 3h |
| `devw list` (rules, blocks, tools) | 2h |
| `devw doctor` (validación completa) | 3h |
| Modo link (symlinks) | 2h |
| Tests para blocks, doctor | 3h |

**Entregable:** el CLI está feature-complete para v0.1.

### Sprint 3 — Ship (semana 3)

| Tarea | Estimación |
|-------|-----------|
| README del CLI (install in 30 seconds) | 2h |
| npm publish config + CI (GitHub Actions) | 3h |
| Landing page mínima en dev-workflows.com | 4h |
| Dogfooding: usar devw en el propio repo | 2h |
| Fix bugs del dogfooding | 3h |
| Post de lanzamiento (X, Reddit, dev.to) | 2h |

**Entregable:** publicado en npm, landing live, anunciado.

---

## 11. Fuera de alcance (v0.1)

- Webapp / Pro tier
- MCP server
- Sync con nube
- Custom scopes
- Block authoring por terceros
- Watch mode
- Plugins de bridges por terceros
- Windows support (Unix-first)

---

## 12. Criterios de éxito

v0.1 está validada si:

1. Puedes instalar con `npx dev-workflows init` y tener reglas compiladas en < 2 minutos
2. Cambias una regla, haces `devw compile`, y el output refleja el cambio
3. Al menos 2 personas externas lo prueban y entienden el flujo sin ayuda
4. `devw doctor` detecta problemas reales

---

## 13. Criterios de cancelación

Parar si:

1. Los devs prefieren editar `.cursorrules` y `CLAUDE.md` directamente (no ven valor en la abstracción)
2. Los editores convergen en un formato común (poco probable a corto plazo)
3. No hay tracción orgánica en 30 días post-lanzamiento

---

> **Este documento es el contrato de implementación.**
> Si algo no está aquí, no entra en v0.1.
> Si algo necesita cambiar, se actualiza este documento primero.