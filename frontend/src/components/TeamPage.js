import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar2 from './Navbar2';
import './TeamPage.css';

const TeamPage = ({ user }) => {
  const location = useLocation();
  const { team } = location.state || {};

  const [players, setPlayers] = useState([]);
  const [keyPlayer, setKeyPlayer] = useState(null);
  const [onesToWatch, setOnesToWatch] = useState(null);
  const [standings, setStandings] = useState({});
  const [euroPlayers, setEuroPlayers] = useState([]);
  const [highlightedTeam, setHighlightedTeam] = useState({ name: '', group: '' });

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('https://eurocopa-24-backend.onrender.com/api/players');
        const data = await response.json();
        const teamPlayers = data.filter((player) => player.nationality === team.name);
        setPlayers(teamPlayers);

        teamPlayers.forEach((player) => {
          if (player.keyPlayer) {
            player.description = player.keyPlayer;
            setKeyPlayer(player);
          }
          if (player.onesToWatch) {
            player.description = player.onesToWatch;
            setOnesToWatch(player);
          }
        });
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    const fetchEuroPlayers = async () => {
      try {
        const response = await fetch('https://eurocopa-24-backend.onrender.com/api/euro2024_players');
        const data = await response.json();
        const filteredPlayers = data.filter(player => player.Country === team.name);
        setEuroPlayers(filteredPlayers);
      } catch (error) {
        console.error('Error fetching players:', error);
      }
    };

    const fetchStandings = async (teamName) => {
      try {
        const response = await fetch('https://eurocopa-24-backend.onrender.com/api/standings');
        const data = await response.json();
        const groupedStandings = {};

        // Group standings by group
        data.forEach(team => {
          if (!groupedStandings[team.group]) {
            groupedStandings[team.group] = [];
          }
          groupedStandings[team.group].push(team);
        });
        console.log(groupedStandings);

        setStandings(groupedStandings);

        // Highlight the specific team
        const teamGroup = data.find(t => t.team === teamName).group;
        setHighlightedTeam({ name: teamName, group: teamGroup });
      } catch (error) {
        console.error('Error fetching standings:', error);
      }
    };

    fetchPlayers();
    fetchEuroPlayers();
    fetchStandings(team.name);
  }, [team]);

  return (
    <div className="team-page">
      <Navbar2 user={user} />
      <div className="team-page-content">
        <div className="intro-players">
          <h2>Player Introductions</h2>
          {keyPlayer && (
            <div className="intro-player">
              <h3>Key Player: {keyPlayer.name}</h3>
              <p>{keyPlayer.description}</p>
            </div>
          )}
          {onesToWatch && (
            <div className="intro-player">
              <h3>Ones to Watch: {onesToWatch.name}</h3>
              <p>{onesToWatch.description}</p>
            </div>
          )}
        </div>
        <div className="players-list">
          <h2>{team.name} Players</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Age</th>
                <th>Club</th>
                <th>Height</th>
                <th>Foot</th>
                <th>Caps</th>
                <th>Goals</th>
                <th>Market Value</th>
              </tr>
            </thead>
            <tbody>
              {euroPlayers.map(player => (
                <tr key={player.Name}>
                  <td>{player.Name}</td>
                  <td>{player.Position}</td>
                  <td>{player.Age}</td>
                  <td>{player.Club}</td>
                  <td>{player.Height}</td>
                  <td>{player.Foot}</td>
                  <td>{player.Caps}</td>
                  <td>{player.Goals}</td>
                  <td>{player.MarketValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="team-standings">
          <h2>Standings</h2>
          {highlightedTeam.group && (
            <div>
              <h3>Group {highlightedTeam.group}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Team</th>
                    <th>Points</th>
                    <th>Goals For</th>
                    <th>Goals Against</th>
                    <th>Goal Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {standings[highlightedTeam.group].map(team => (
                    <tr
                      key={team.team}
                      style={{
                        backgroundColor: team.team === highlightedTeam.name ? 'yellow' : 'white'
                      }}
                    >
                      <td>{team.team}</td>
                      <td>{team.points}</td>
                      <td>{team.gf}</td>
                      <td>{team.ga}</td>
                      <td>{team.gd}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
