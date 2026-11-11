# G1 — package and license matrix

Tool: `pnpm licenses list --json` (pnpm 10.31.0) against the scaffolded
`maint-qual` app pinned to the 18.2.0 train. Machine-readable summary:
[`../package-license-summary.json`](../package-license-summary.json)
(raw output with local paths stays in `local/pnpm-licenses.json`).

## Totals

- **506** installed packages in the dependency tree.
- **59** are `@objectstack/*` framework packages, all at exactly **18.2.0**
  and all **Apache-2.0** (`@objectstack/spec`, `core`, `runtime`, `objectql`,
  `plugin-auth`, `plugin-security`, `plugin-audit`, `plugin-approvals`,
  `mcp`, `rest`, `driver-sql`, `service-datasource`, `cli`, `console`,
  `setup`, `account`, `verify`, connectors, triggers, …). The scaffold
  app uses no `@object-ui/*` runtime package; the prebuilt Console is served
  by the CLI per the upstream `LICENSING.md` split (framework Apache-2.0,
  `ui/` sources MIT).

## License counts (transitive tree)

| License | Count |
|---|---:|
| MIT | 388 |
| Apache-2.0 | 70 |
| ISC | 23 |
| BSD-3-Clause | 5 |
| BlueOak-1.0.0 | 5 |
| BSD-2-Clause | 3 |
| MPL-2.0 | 2 |
| MIT-0 | 2 |
| PSF-2.0 | 1 |
| Unlicense | 1 |
| MIT/X11 | 1 |
| "MIT License" (metadata spelling) | 1 |
| (MIT AND Zlib) | 1 |
| (MIT OR CC0-1.0) | 1 |
| (MIT OR GPL-3.0-or-later) | 1 |
| Unknown | 1 |

Everything is a permissive license except the items below. No GPL, AGPL, SSPL
or copyleft-forced dependency was pulled in.

## Items requiring a human decision before product redistribution

1. **`jszip@3.10.2` — (MIT OR GPL-3.0-or-later).** Dual-licensed; using it
   under its MIT branch is straightforward, but the choice should be recorded
   in the product's license process. Pulled by `@objectstack/rest` (xlsx
   import/export).
2. **`lightningcss@1.33.0` (+ platform binary) — MPL-2.0.** File-level
   copyleft; unmodified transitive use via `vite`/build tooling is normal, but
   it stays a build-time tool and must not be patched without MPL process.
3. **`buffers@0.1.1` — license metadata "Unknown".** Old substack package
   (MIT-licensed upstream repository, no LICENSE field shipped in the npm
   tarball). Transitive via `unzipper` → `exceljs` → `@objectstack/rest`.
   Action: record the MIT provenance from upstream, pin the version, and
   track upstream resolution. No runtime service depends on it directly.
4. **`argparse@3.0.4` — PSF-2.0** (Python-2.0-family permissive): confirm
   internal policy acceptance.

## Operational notes

- Framework plugins actually composed at runtime were audited from the boot
  plugin list rather than assumed from npm; see
  [bootstrap-log.md](bootstrap-log.md).
- `pg@8.23.1` was the only manually added driver (the SQL driver loads `pg`
  as an optional peer and fails loudly without it).
- No `ObjectOS` cloud control-plane package or `OS_MODE=cloud` dependency was
  installed or used; every probe ran on the self-hosted train.
