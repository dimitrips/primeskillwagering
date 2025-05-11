import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { FrontstrikeWagering } from "../target/types/frontstrike_wagering";

describe("frontstrike-wagering", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.FrontstrikeWagering as Program<FrontstrikeWagering>;

  it("Initialize a Lobby", async () => {
    const lobby = anchor.web3.Keypair.generate();
    const tx = await program.methods
      .initializeLobby("match123", new anchor.BN(10000000))
      .accounts({
        lobby: lobby.publicKey,
        payer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([lobby])
      .rpc();

    console.log("Lobby initialized:", tx);
  });
});
