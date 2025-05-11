use anchor_lang::prelude::*;

declare_id!("G4GSXiB5B2K1zEdziQuq7FBsTu4MoYMeJzBiisFBTPfZ");

#[program]
pub mod frontstrike_wagering {
    use super::*;

    pub fn initialize_lobby(
        ctx: Context<InitializeLobby>,
        match_id: String,
        life_value: u64,
    ) -> Result<()> {
        let lobby = &mut ctx.accounts.lobby;
        lobby.match_id = match_id;
        lobby.total_pot = 0;
        lobby.life_value = life_value;
        lobby.created_at = Clock::get()?.unix_timestamp;
        lobby.team1_deposits = 0;
        lobby.team2_deposits = 0;
        Ok(())
    }

    pub fn deposit_to_lobby(
        ctx: Context<DepositToLobby>,
        lives_purchased: u32,
        team: u8, // 1 or 2
    ) -> Result<()> {
        let lobby = &mut ctx.accounts.lobby;
        let player = PlayerInfo {
            wallet: ctx.accounts.player.key(),
            lives_held: lives_purchased,
            deposited: true,
        };
        lobby.player_accounts.push(player);

        let payment_amount = lives_purchased as u64 * lobby.life_value;
        **lobby.to_account_info().try_borrow_mut_lamports()? += payment_amount;
        **ctx.accounts.player.to_account_info().try_borrow_mut_lamports()? -= payment_amount;

        if team == 1 {
            lobby.team1_deposits += 1;
        } else {
            lobby.team2_deposits += 1;
        }

        Ok(())
    }

    pub fn start_match(ctx: Context<StartMatch>) -> Result<()> {
        let lobby = &mut ctx.accounts.lobby;
        require!(
            lobby.team1_deposits >= 3 && lobby.team2_deposits >= 3,
            ErrorCode::NotEnoughDeposits
        );

        let match_account = &mut ctx.accounts.match_account;
        match_account.match_id = lobby.match_id.clone();
        match_account.player_accounts = lobby.player_accounts.clone();
        match_account.total_pot = lobby.total_pot;
        match_account.life_value = lobby.life_value;
        match_account.created_at = Clock::get()?.unix_timestamp;
        match_account.is_flagged = false;

        Ok(())
    }

    pub fn buy_lives(ctx: Context<BuyLives>, additional_lives: u32) -> Result<()> {
        let match_account = &mut ctx.accounts.match_account;
        let player_key = ctx.accounts.player.key();

        let mut found = false;
        for player in match_account.player_accounts.iter_mut() {
            if player.wallet == player_key {
                player.lives_held += additional_lives;
                found = true;
                break;
            }
        }

        require!(found, ErrorCode::PlayerNotFound);

        let payment_amount = additional_lives as u64 * match_account.life_value;
        **match_account.to_account_info().try_borrow_mut_lamports()? += payment_amount;
        **ctx.accounts.player.to_account_info().try_borrow_mut_lamports()? -= payment_amount;

        match_account.total_pot += payment_amount;

        Ok(())
    }

    pub fn submit_match_results(
        ctx: Context<SubmitMatchResults>,
        final_lives: Vec<(Pubkey, u32)>,
        is_valid_match: bool,
    ) -> Result<()> {
        let match_account = &mut ctx.accounts.match_account;

        if !is_valid_match {
            match_account.is_flagged = true;
            return Ok(());
        }

        let total_lives: u32 = final_lives.iter().map(|(_, lives)| *lives).sum();
        let platform_fee_bps = 495u64;

        for (wallet, lives_held) in final_lives.iter() {
            let share = (*lives_held as u64 * match_account.total_pot) / (total_lives as u64);
            let fee = (share * platform_fee_bps) / 10_000;
            let payout = share - fee;

            **match_account.to_account_info().try_borrow_mut_lamports()? -= payout;
            **ctx.accounts.platform_treasury.to_account_info().try_borrow_mut_lamports()? += fee;
        }

        Ok(())
    }

    pub fn cancel_match_due_to_timeout(ctx: Context<CancelMatchDueToTimeout>) -> Result<()> {
        let match_account = &mut ctx.accounts.match_account;
        let now = Clock::get()?.unix_timestamp;
        require!(
            now > match_account.created_at + 86400,
            ErrorCode::TimeoutNotReached
        );

        // Refund logic would go here
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeLobby<'info> {
    #[account(init, payer = payer, space = 8 + 2048)]
    pub lobby: Account<'info, Lobby>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositToLobby<'info> {
    #[account(mut)]
    pub lobby: Account<'info, Lobby>,
    #[account(mut)]
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct StartMatch<'info> {
    #[account(mut)]
    pub lobby: Account<'info, Lobby>,
    #[account(init, payer = payer, space = 8 + 2048)]
    pub match_account: Account<'info, MatchAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyLives<'info> {
    #[account(mut)]
    pub match_account: Account<'info, MatchAccount>,
    #[account(mut)]
    pub player: Signer<'info>,
}

#[derive(Accounts)]
pub struct SubmitMatchResults<'info> {
    #[account(mut)]
    pub match_account: Account<'info, MatchAccount>,
    pub platform_treasury: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelMatchDueToTimeout<'info> {
    #[account(mut)]
    pub match_account: Account<'info, MatchAccount>,
}

#[account]
pub struct Lobby {
    pub match_id: String,
    pub player_accounts: Vec<PlayerInfo>,
    pub total_pot: u64,
    pub life_value: u64,
    pub created_at: i64,
    pub team1_deposits: u8,
    pub team2_deposits: u8,
}

#[account]
pub struct MatchAccount {
    pub match_id: String,
    pub player_accounts: Vec<PlayerInfo>,
    pub total_pot: u64,
    pub life_value: u64,
    pub created_at: i64,
    pub completed_at: Option<i64>,
    pub is_flagged: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PlayerInfo {
    pub wallet: Pubkey,
    pub lives_held: u32,
    pub deposited: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Not enough deposits to start the match.")]
    NotEnoughDeposits,
    #[msg("Player not found in match.")]
    PlayerNotFound,
    #[msg("Match timeout not yet reached.")]
    TimeoutNotReached,
}
