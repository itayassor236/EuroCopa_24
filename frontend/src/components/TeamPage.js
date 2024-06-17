import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar2 from './Navbar2';
import './TeamPage.css';
//import Papa from 'papaparse';

const TeamPage = ({ user }) => {
  const location = useLocation();
  const { team } = location.state || {};

  const [players, setPlayers] = useState([]);
  const [keyPlayer, setKeyPlayer] = useState(null);
  const [onesToWatch, setOnesToWatch] = useState(null);
  const [standings, setStandings] = useState([]);
  const [euroPlayers, setEuroPlayers] = useState([]);


  useEffect(() => {
    const fetchPlayers = async () => {
        try {
          const response = await fetch('http://localhost:8000/api/players');
          const data = await response.json();
      
          const teamPlayers = data.filter((player) => player.nationality === team.name);
          console.log(teamPlayers);
          setPlayers(teamPlayers);
      
          teamPlayers.forEach((player) => {
            if (player.keyPlayer) {
              player.description = player.keyPlayer; // Assuming description field name
              setKeyPlayer(player);
            }
            if (player.onesToWatch) {
              player.description = player.onesToWatch; // Assuming description field name
              setOnesToWatch(player);
            }
          });
        } catch (error) {
          console.error('Error fetching players:', error);
        }
      };
      
      const fetchEuroPlayers = async () => {
        try {
          const response = await fetch('http://localhost:7077/api/euro2024_players');
          const data = await response.json();
          console.log(data);
  
          const filteredPlayers = data.filter(player => player.Country === team.name);
          console.log(filteredPlayers)
          setEuroPlayers(filteredPlayers);
        } catch (error) {
          console.error('Error fetching players:', error);
        }
      };

    const fetchStandings = async () => {
      try {
        const response = await fetch('/data/standings.json');
        const data = await response.json();
        setStandings(data.standings);
      } catch (error) {
        console.error('Error fetching standings:', error);
      }
    };

    fetchPlayers();
    fetchEuroPlayers();
    fetchStandings();
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
          <table>
            <thead>
              <tr>
                <th>Position</th>
                <th>Team</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing, index) => (
                <tr key={index}>
                  <td>{standing.position}</td>
                  <td>{standing.team}</td>
                  <td>{standing.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
};

export default TeamPage;
