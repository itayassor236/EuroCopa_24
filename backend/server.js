const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const xlsx = require('xlsx');
const fs = require('fs'); // Import fs module for file system operations
const euroTeamsData = require('./euroteams.json');

dotenv.config();

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Passport configuration for Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
  // Handle user profile and save to database if necessary
  return done(null, profile);
}));

// Routes
app.use('/api/auth', authRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

// Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // Redirect to your frontend's home page or dashboard
  }
);

// Extract team names from euroTeamsData
const euroTeams = euroTeamsData.teams.map(team => team.name);

// Endpoint to fetch all players data
app.get('/api/players', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'excels', 'PLAYERS.xlsx');
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const players = xlsx.utils.sheet_to_json(sheet);
    res.json(players.map(player => ({
      name: player.player,
      nationality: player.nationality,
      description: player.description,
      keyPlayer: player.key_player,
      onesToWatch: player.ones_to_watch
    })));
  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.status(500).json({ error: 'Error reading Excel file' });
  }
});

// Endpoint to fetch euro 2024 players data
app.get('/api/euro2024_players', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'excels', 'euro2024_players.xlsx');
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const players = xlsx.utils.sheet_to_json(sheet);
    const filteredPlayers = players.map(player => {
      const { Name, Position, Age, Club, Height, Foot, Caps, Goals, MarketValue, Country } = player;
      return { Name, Position, Age, Club, Height, Foot, Caps, Goals, MarketValue, Country };
    });
    res.json(filteredPlayers);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.status(500).json({ error: 'Error reading Excel file' });
  }
});

// Endpoint to fetch matches data
app.get('/api/matches/:gameId', (req, res) => {
  const gameId = req.params.gameId;

  try {
    const filePath = path.join(__dirname, 'excels', 'EURO_2024.xlsx');
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    const workbook = xlsx.readFile(filePath);
    const sheetName = 'Daily schedule';
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    // Filter out non-match rows based on '__EMPTY_4' existence and value
    const matchesData = jsonData.filter(row => row['__EMPTY_4'] && row['__EMPTY_4'].toString() === gameId.toString());

    if (matchesData.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Take the first match found (assuming gameId is unique)
    const match = matchesData[0];

    const parsedMatch = {
      id: match['__EMPTY_4'],
      date: parseDate(match['Daily schedule']),
      time: adjustTime(match['__EMPTY_1']),
      team1: convertTeamName(match['__EMPTY_2']),
      team2: convertTeamName(match['__EMPTY_3']),
      venue: match['__EMPTY_7']
    };

    res.json(parsedMatch);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.status(500).json({ error: 'Error reading Excel file' });
  }
});



app.get('/api/matches', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'excels', 'EURO_2024.xlsx');
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    const workbook = xlsx.readFile(filePath);
    const sheetName = 'Daily schedule';
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    // Parse and adjust dates and times
    const parsedMatches = jsonData.map((row) => ({
      id: row['__EMPTY_4'],
      date:  row['Daily schedule'], // Parse and format the date
      time:  row['__EMPTY_1'], // Adjust the time
      team1: row['__EMPTY_2'],
      team2: row['__EMPTY_3'],
      venue: row['__EMPTY_7'],
    }));

    const validMatches = processMatches(parsedMatches);
    res.json(validMatches);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.status(500).json({ error: 'Error reading Excel file' });
  }
});

// Endpoint to fetch predicted lineups for a specific team
app.get('/api/predicted-lineups/:team', (req, res) => {
  const { team } = req.params;
  const filePath = path.join(__dirname, 'excels', 'euro2024_players.xlsx');

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Excel file not found' });
  }

  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Filter players for the specified team with 'v' in Line_up column
    const predictedLineup = data
      .filter(player => player.Country === team && player.Line_up === 'v')
      .map(player => player.Name);

    res.json(predictedLineup);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.status(500).json({ error: 'Failed to fetch predicted lineups' });
  }
});

// Function to convert Excel date serial number to JavaScript Date object
const excelDateToJSDate = (serial) => {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);
  
  const fractionalDay = serial - Math.floor(serial) + 0.0000001;

  let totalSeconds = Math.floor(86400 * fractionalDay);

  const seconds = totalSeconds % 60;
  totalSeconds -= seconds;

  const hours = Math.floor(totalSeconds / (60 * 60));
  const minutes = Math.floor(totalSeconds / 60) % 60;

  return new Date(dateInfo.getFullYear(), dateInfo.getMonth(), dateInfo.getDate(), hours, minutes, seconds);
};

// Function to convert Excel time serial number to HH:mm format
const excelTimeToHHMM = (serial) => {
  if (!serial) return null;

  const totalSeconds = Math.floor(serial%1 * 86400); // Total seconds in a day
  const hours = Math.floor(totalSeconds / 3600) + 1; // Hours
  const minutes = Math.floor((totalSeconds % 3600) / 60); // Minutes

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const parseDate = (excelDate) => {
  if (!excelDate) return null;
  
  // Convert Excel date serial number to JavaScript Date object
  const date = excelDateToJSDate(excelDate);
  
  // Format as desired, e.g., "Monday, June 13, 2024"
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const adjustTime = (excelTime) => {
  if (!excelTime) return null;
  
  // Convert Excel time serial number to HH:mm format
  return excelTimeToHHMM(excelTime);
};

const convertTeamName = (teamName) => {
  if (teamName === 'Czechia') return 'Czech Republic';
  if (teamName === 'Türkiye') return 'Turkiye';
  return teamName;
};

// Function to validate if a team name exists in euroTeams
const isValidTeam = (team) => euroTeams.includes(team);

// Function to validate a match
const isValidMatch = (match) => isValidTeam(match.team1) && isValidTeam(match.team2);

// Function to process and validate matches
const processMatches = (matches) => {
  return matches.map(match => {
    match.team1 = convertTeamName(match.team1);
    match.team2 = convertTeamName(match.team2);
    match.date = parseDate(match.date);
    match.time = adjustTime(match.time);
    return match;
  }).filter(isValidMatch);
};

app.get('/api/standings', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'excels', 'EURO_2024.xlsx');
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    const workbook = xlsx.readFile(filePath);
    const sheetName = 'EURO';
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    let standings = [];

    // Determine the relevant rows based on the provided indices (2, 3, 4, 5 in zero-based index)
    let relevantRows = [2, 3, 4, 5]; // This corresponds to rows 3, 4, 5, 6 in Excel (since Excel is 1-based index)

    for (let rowIndex of relevantRows) {
      let row = jsonData[rowIndex];
      if (row.length === 0 || !row[1] || !row[2]) {
        console.log(`Invalid data in row ${rowIndex + 1}: ${row}`);
        continue;  // Skip empty rows or rows without valid team data
      }

      for (let columnIndex = 1; columnIndex < row.length; columnIndex += 1) {
        if (typeof row[columnIndex] === 'string' && typeof row[columnIndex + 1] === 'string') {
          let teamName = row[columnIndex].trim();
          let pointsAndGoals = row[columnIndex + 1].trim().split(/\s+/);
          if (pointsAndGoals.length >= 2) {
            let points = parseInt(pointsAndGoals[0], 10);
            let goals = pointsAndGoals[1];
            let goalsAgainst = pointsAndGoals[3];
            let groupIndex = Math.floor((columnIndex+2)/3); // Calculate group index (0-based)
            let group = String.fromCharCode(64 + groupIndex); // Convert index to group letter ('A' to 'F')

            standings.push({
              team: teamName,
              points: points,
              gf: goals,
              ga: goalsAgainst,
              gd: goals - goalsAgainst,
              group: group
            });
          }
        }
      }
    }
    res.json(standings);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.status(500).json({ error: 'Failed to read Excel file' });
  }
});

app.get('/api/top-players', (req, res) => {
  const filePath = path.join(__dirname, 'excels', 'euro2024_players.xlsx');

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Excel file not found' });
  }

  try {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Function to get top N players based on a field
    const getTopPlayers = (data, field, n = 5) => {

      // Sort data based on the field in descending order
      const sortedData = data.sort((a, b) => {
        const aValue = a[field] !== undefined ? a[field] : -Infinity;
        const bValue = b[field] !== undefined ? b[field] : -Infinity;
        return bValue - aValue;
      });

      // Return top N players with name and stat
      return sortedData.slice(0, n).map(player => ({
        name: player.Name,
        team: player.Country,
        stat: player[field]
      }));
    };

    // Initialize object to hold top players data
    const topPlayersData = {
      topScorers: getTopPlayers(data, 'Euro_goals'),
      topAssists: getTopPlayers(data, 'Euro_assists'),
      yellowCards: getTopPlayers(data, 'Euro_yellow_cards'),
      redCards: getTopPlayers(data, 'Euro_red_cards'),
      cleanSheets: getTopPlayers(data, 'Euro_clean_sheet'),
      topRatings: getTopPlayers(data, 'Euro_ratings')
    };

    res.json(topPlayersData);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.status(500).json({ error: 'Failed to fetch top players data' });
  }
});

app.get('/',  (req, res) => {

  res.send('Hello, the server is running!');
});

app.get('/api/match-result/:gameId', (req, res) => {
  try {
    const workbook = xlsx.readFile(path.join(__dirname, 'excels', 'results.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = xlsx.utils.sheet_to_json(worksheet);

    const gameId = req.params.gameId;
    const matchData = data.find(match => match.match === gameId);

    if (!matchData) {
      return res.status(404).json({ message: 'Match not found' });
    }

    const scoreParts = matchData.match.split(' ')[1].split('-');
    const team1 = matchData.match.split(' ')[0];
    const team2 = matchData.match.split(' ')[2];

    const result = {
      team1: team1,
      score1: parseInt(scoreParts[0]),
      team2: team2,
      score2: parseInt(scoreParts[1]),
      goalScorers: []
    };

    for (let i = 1; i <= 10; i++) {
      const scorerKey = `Scorer_${i}`;
      if (matchData[scorerKey]) {
        const scorerParts = matchData[scorerKey].split(', ');
        const scorer = {
          player: scorerParts[0],
          minute: scorerParts[1],
          team: scorerParts[2]
        };
        result.goalScorers.push(scorer);
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error reading Excel file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

