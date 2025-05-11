FrontStrike Wagering Smart Contract

📖 Project Overview

FrontStrike is a competitive FPS game featuring a crypto-based wagering system. This smart contract, built on the Solana blockchain, enables players to wager SOL by purchasing in-game "lives." At the end of the match, payouts are distributed based on remaining lives, with a 4.95% platform fee routed to the designated treasury wallet.

🔑 Key Features:

Buy Lives: Players purchase lives to enter the match.

Mid-Game Purchase: Players can buy more lives during the match.

Winnings Distribution: Payouts are based on the number of lives held at the end of the match.

Anti-Cheat Mechanism: Matches flagged for cheating are frozen until reviewed.

Timeout Handling: Refunds are possible if results are not submitted within 24 hours.

💻 Environment Setup

Install Rust:

curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup update

Install Solana CLI:

sh -c "$(curl -sSfL https://release.solana.com/v1.16.2/install)"
solana --version

Install Node.js & Yarn:

curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install --global yarn

Install Anchor CLI:

cargo install --git https://github.com/coral-xyz/anchor --tag v0.27.0 anchor-cli --locked
anchor --version

Configure Solana Devnet:

solana config set --url devnet
solana airdrop 2
solana balance

📂 Project Structure

frontstrike-wagering/
├── Anchor.toml
├── Cargo.toml
├── programs/
│   └── frontstrike_wagering/
│       └── src/
│           └── lib.rs
├── tests/
│   └── frontstrike_wagering.ts
└── migrations/
    └── deploy.ts

🚀 Deployment Guide

Build the Project:

anchor build

Deploy to Devnet:

anchor deploy --provider.cluster devnet

Run Tests:

anchor test

📝 Smart Contract Functions

1️⃣ Initialize Lobby

Creates a lobby for a match.

anchor run initialize_lobby "match_001" 10000000

match_id: Unique match identifier.

life_value: Cost per life (in lamports).

2️⃣ Deposit to Lobby

Player deposits SOL to buy lives.

anchor run deposit_to_lobby 10 1

lives_purchased: Number of lives.

team: Team number (1 or 2).

3️⃣ Start Match

Begins the match once the minimum number of deposits are met.

anchor run start_match

4️⃣ Buy Lives

Player buys more lives during gameplay.

anchor run buy_lives 5

additional_lives: Number of extra lives.

5️⃣ Submit Match Results

Finalizes the match and distributes payouts.

anchor run submit_match_results [player_wallet, lives_held, valid]

is_valid_match: Boolean flag indicating match validity.

6️⃣ Cancel Match (Timeout)

Cancels a match if results are not submitted within 24 hours.

anchor run cancel_match_due_to_timeout

🛠️ API Specifications

Base URL: https://api.devnet.solana.com

Endpoint

Method

Description

/initialize-lobby

POST

Create a new lobby

/deposit-to-lobby

POST

Player deposits SOL for lives

/start-match

POST

Starts the game match

/buy-lives

POST

Player buys additional lives

/submit-match-results

POST

Finalize and payout match

/cancel-match

POST

Cancel match after timeout

🧪 Postman Testing

Import the Postman Collection (provided as JSON).

Edit the Environment Variables with your wallet addresses.

Test Endpoints interactively.

📝 Troubleshooting

Transaction Fails: Check Solana wallet balance.

Deployment Error: Ensure Anchor and Rust versions are correct.

API Call Issues: Verify the base URL and headers.

🏁 Conclusion

This project demonstrates a decentralized wagering mechanism using Solana's blockchain. Adapt it for various game modes, wagering models, or platform fee configurations as needed.

Feel free to submit any questions or feedback during the hackathon!
