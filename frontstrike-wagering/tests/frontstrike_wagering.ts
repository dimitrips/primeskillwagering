import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FrontstrikeWagering } from "../target/types/frontstrike_wagering";
import { Keypair, SystemProgram } from "@solana/web3.js";

describe("FrontStrike Wagering Tests", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.FrontstrikeWagering as Program<FrontstrikeWagering>;

  // Initialize Keypairs
  const lobby = Keypair.generate();
  const matchAccount = Keypair.generate();
  const player1 = Keypair.generate();
  const player2 = Keypair.generate();

  it("Initializes a Lobby", async () => {
    const tx = await program.methods
      .initializeLobby("match123", new anchor.BN(10000000)) // $0.10 per life
      .accounts({
        lobby: lobby.publicKey,
        payer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([lobby])
      .rpc();
    
    console.log("Lobby Initialized with TX:", tx);
  });

  it("Deposits to Lobby", async () => {
    const tx1 = await program.methods
      .depositToLobby(10, 1) // Team 1, 10 lives ($1.00)
      .accounts({
        lobby: lobby.publicKey,
        player: player1.publicKey,
      })
      .signers([player1])
      .rpc();

    console.log("Player 1 Deposited:", tx1);

    const tx2 = await program.methods
      .depositToLobby(10, 2) // Team 2, 10 lives ($1.00)
      .accounts({
        lobby: lobby.publicKey,
        player: player2.publicKey,
      })
      .signers([player2])
      .rpc();

    console.log("Player 2 Deposited:", tx2);
  });

  it("Starts the Match", async () => {
    const tx = await program.methods
      .startMatch()
      .accounts({
        lobby: lobby.publicKey,
        matchAccount: matchAccount.publicKey,
        payer: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([matchAccount])
      .rpc();
    
    console.log("Match Started:", tx);
  });

  it("Buys Lives During the Match", async () => {
    const tx = await program.methods
      .buyLives(5) // Buys 5 more lives for $0.50
      .accounts({
        matchAccount: matchAccount.publicKey,
        player: player1.publicKey,
      })
      .signers([player1])
      .rpc();

    console.log("Player 1 Bought Additional Lives:", tx);
  });

  it("Submits Match Results", async () => {
    const tx = await program.methods
      .submitMatchResults(
        [
          [player1.publicKey, 15], // Player 1 survived with 15 lives
          [player2.publicKey, 5],  // Player 2 survived with 5 lives
        ],
        true // Match is valid
      )
      .accounts({
        matchAccount: matchAccount.publicKey,
        platformTreasury: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Match Results Submitted and Payout Distributed:", tx);
  });

  it("Timeout Refund Process", async () => {
    const tx = await program.methods
      .cancelMatchDueToTimeout()
      .accounts({
        matchAccount: matchAccount.publicKey,
      })
      .rpc();

    console.log("Match Timed Out and Refunded:", tx);
  });
});
