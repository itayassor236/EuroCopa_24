import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import LandingPage from './components/LandingPage';
import Euro2024 from './components/Euro2024';
import CopaAmerica2024 from './components/CopaAmerica2024';
import LoginModal from './components/LoginModal';
import BetsPage from './components/BetsPage';
import SquadsPage from './components/SquadsPage';
import TeamPage from './components/TeamPage';
import GameAnalysisPage from './components/GameAnalysisPage';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage setUser={setUser} />} />
        <Route path="/HomePage" element={<HomePage user={user} />} />
        <Route path="/euro2024" element={<Euro2024 user={user} />} />
        <Route path="/copaamerica2024" element={<CopaAmerica2024 user={user} />} />
        <Route path="/login" element={<LoginModal setUser={setUser} />} />
        <Route path="/betspage" element={<BetsPage user={user} />} />
        <Route path="/squadspage" element={<SquadsPage user={user} />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/game-analysis/:gameId" element={<GameAnalysisPage />} />
      </Routes>
    </Router>
  );
}

export default App;
