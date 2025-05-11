const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const app = express();
const port = process.env.PORT || 3000;

dotenv.config();

// Middleware
app.use(express.json());

// Base URL for Solana Devnet
const BASE_URL = 'https://api.devnet.solana.com';

// =============================
// Initialize Lobby
// =============================
app.post('/initialize-lobby', async (req, res) => {
  const { match_id, life_value } = req.body;

  try {
    const response = await axios.post(`${BASE_URL}/initialize-lobby`, {
      match_id,
      life_value
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error initializing lobby:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// =============================
// Deposit to Lobby
// =============================
app.post('/deposit-to-lobby', async (req, res) => {
  const { lobby_address, player_wallet, lives_purchased, team } = req.body;

  try {
    const response = await axios.post(`${BASE_URL}/deposit-to-lobby`, {
      lobby_address,
      player_wallet,
      lives_purchased,
      team
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error depositing to lobby:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// =============================
// Start Match
// =============================
app.post('/start-match', async (req, res) => {
  const { lobby_address } = req.body;

  try {
    const response = await axios.post(`${BASE_URL}/start-match`, {
      lobby_address
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error starting match:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// =============================
// Buy Lives
// =============================
app.post('/buy-lives', async (req, res) => {
  const { match_address, player_wallet, additional_lives } = req.body;

  try {
    const response = await axios.post(`${BASE_URL}/buy-lives`, {
      match_address,
      player_wallet,
      additional_lives
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error buying lives:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// =============================
// Submit Match Results
// =============================
app.post('/submit-match-results', async (req, res) => {
  const { match_address, final_lives, is_valid_match } = req.body;

  try {
    const response = await axios.post(`${BASE_URL}/submit-match-results`, {
      match_address,
      final_lives,
      is_valid_match
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error submitting match results:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// =============================
// Cancel Match
// =============================
app.post('/cancel-match', async (req, res) => {
  const { match_address } = req.body;

  try {
    const response = await axios.post(`${BASE_URL}/cancel-match`, {
      match_address
    });
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error canceling match:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start the Server
app.listen(port, () => {
  console.log(`FrontStrike Wagering API running on http://localhost:${port}`);
});// Main Express server file
