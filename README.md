# Lend App (User dApp)

## Setup

```bash
pnpm install
```

Copy env:

```bash
cp .env.example .env
```

Isi env utama:

- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_USDC_ADDRESS`
- `NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL` (atau BASE mainnet)
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Run:

```bash
pnpm dev
```

## Deploy Vercel

Root directory: `lend-app`

Set env seperti di `.env.example`.
