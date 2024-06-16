import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar2 from './Navbar2';
import './SquadsPage.css'; // Style file for SquadsPage

const SquadsPage = ({ user }) => {
  const [teams, setTeams] = useState([]);
  const { state } = useLocation();
  const { page } = state || {};
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        let teamsData = [];
        if (page === 'euro24') {
          teamsData = await fetchEuroTeamsData();
        } else if (page === 'copaamerica') {
          teamsData = await fetchCopaTeamsData();
        }
        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchTeams();
  }, [page]); // Add 'page' as a dependency to re-fetch teams when the page changes

  const fetchEuroTeamsData = async () => {
    try {
      const response = await fetch('/data/euroteams.json'); // Corrected path
      const data = await response.json();
      return data.teams;
    } catch (error) {
      console.error('Error fetching Euro teams:', error);
      return [];
    }
  };

  const fetchCopaTeamsData = async () => {
    try {
      const response = await fetch('/data/copateams.json'); // Corrected path
      const data = await response.json();
      return data.teams;
    } catch (error) {
      console.error('Error fetching Copa teams:', error);
      return [];
    }
  };

  const handleTeamClick = (team) => {
    navigate('/team', { state: { team } });
  };

  return (
    <div className="squads-page">
      <Navbar2 user={user} />
      <div className="squads-content">
        <h2>Teams</h2>
        <div className="teams-list">
          {teams.map((team) => (
            <button key={team.name} className="team-button" onClick={() => handleTeamClick(team)}>
              {team.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SquadsPage;
