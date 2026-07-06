# Level 1 submission checklist

## Automated (done)

- [x] `yarn verify:l1` — compile + 4 tests passing
- [x] `contracts/managed/proof-of-mind/` generated (ZK keys + circuits)
- [x] README with product idea + public vs private witness
- [x] `deployment.json` with local contract address

## Circuits compiled

```
circuit "certifyModel" (k=13, rows=4492)
circuit "proveOwnership" (k=13, rows=4460)
circuit "registerModel" (k=14, rows=8335)
```

## You still need to do

1. **Create public GitHub repo** and push (5+ commits — see git log after `git init`)
2. **Preprod deploy** — only step that needs your input:
   ```bash
   export WALLET_SEED="your-64-char-hex-seed"
   yarn deploy:preprod
   ```
   Fund wallet at https://faucet.preprod.midnight.network first.
3. **Screenshots** for hackathon form:
   - Terminal: `yarn compile` output (circuits listed above)
   - Terminal: `yarn verify:l1` with 4 tests green
   - Terminal or `deployment.json`: preprod contract address (after step 2)

## One-command local verify

```bash
yarn setup:l1
```

Do not paste inline `# comments` after commands in zsh — they become extra arguments.
