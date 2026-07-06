# Level 1 — New Moon submission

Repo: https://github.com/fahmmin/proof-of-mind

## Requirements checklist

| Requirement | Status |
|-------------|--------|
| `compact compile` + `managed/` artifacts | Done |
| Passing test suite (`yarn verify:l1`) | 4 tests |
| Contract deployed (address recorded) | [`deployment.json`](deployment.json) |
| README: setup instructions | Done |
| README: product idea paragraph | Done |
| README: public state vs private witness | Done |
| Public GitHub repo | Done |
| 5+ meaningful commits | Done (see `git log`) |
| Screenshots | **You** capture locally |

## Verify locally

```bash
yarn setup:l1
```

Or step by step:

```bash
yarn env:up
yarn compile
yarn deploy
yarn verify:l1
```

## Circuits (for compile screenshot)

```
circuit "certifyModel" (k=13, rows=4492)
circuit "proveOwnership" (k=13, rows=4460)
circuit "registerModel" (k=14, rows=8335)
```

## Screenshots

Embedded in [README.md](README.md#screenshots-level-1-submission):

- `docs/screenshots/compile-circuits.png` — `yarn compile`
- `docs/screenshots/deploy-undeployed.png` — `yarn deploy`

Still capture locally: `yarn verify:l1` — 4 passing tests.

Level 2+ plans: [`ROADMAP.md`](ROADMAP.md).

Do not paste inline `# comments` after shell commands in zsh.
