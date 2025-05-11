# FrontStrike Wagering Contract

## Requirements
- Node.js + Yarn
- Rust
- Solana CLI
- Anchor Framework

## Setup
```bash
anchor build
anchor deploy --provider.cluster devnet
anchor test
```

## Notes
- Replace the program ID in `Anchor.toml` after deploying.
- Set your treasury address manually in `lib.rs`.
