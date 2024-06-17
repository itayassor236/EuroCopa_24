import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar2 from './Navbar2';
import './Tournament.css';
import { Table, Button } from 'antd';

const Euro2024 = ({ user }) => {
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [topAssists, setTopAssists] = useState([]);
  const [yellowCards, setYellowCards] = useState([]);
  const [redCards, setRedCards] = useState([]);
  const [cleanSheets, setCleanSheets] = useState([]);
  const [topRatings, setTopRatings] = useState([]);
  
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('https://eurocopa-24-backend.onrender.com/api/matches');
        if (!response.ok) {
          throw new Error('Failed to fetch match data');
        }
        const data = await response.json();

        const parsedMatches = data.map((row) => ({
          id: row.id,
          date: row.date,
          time: row.time,
          team1: row.team1,
          team2: row.team2,
          venue: row.venue,
        }));

        setMatches(parsedMatches);
      } catch (error) {
        console.error('Error fetching match data:', error);
      }
    };

    const fetchStandings = async () => {
      try {
        const response = await fetch('https://eurocopa-24-backend.onrender.com/api/standings');
        if (!response.ok) {
          throw new Error('Failed to fetch standings data');
        }
        const data = await response.json();

        // Group standings by group (A-F) and sort by place within each group
        const groupedStandings = {};
        data.forEach((team) => {
          const { group, place, ...rest } = team;
          if (!groupedStandings[group]) {
            groupedStandings[group] = [];
          }
          groupedStandings[group].push({ place, ...rest });
        });

        // Sort teams within each group by place
        Object.keys(groupedStandings).forEach((group) => {
          groupedStandings[group].sort((a, b) => a.place - b.place);
        });

        setStandings(groupedStandings);
      } catch (error) {
        console.error('Error fetching standings data:', error);
      }
    };

    const fetchTopPlayers = async () => {
      try {
        const response = await fetch('https://eurocopa-24-backend.onrender.com/api/top-players'); // Example API endpoint for top players
        if (!response.ok) {
          throw new Error('Failed to fetch top players data');
        }
        const topPlayersData = await response.json();
        setTopScorers(topPlayersData.topScorers);
        setTopAssists(topPlayersData.topAssists);
        setYellowCards(topPlayersData.yellowCards);
        setRedCards(topPlayersData.redCards);
        setCleanSheets(topPlayersData.cleanSheets);
        setTopRatings(topPlayersData.topRatings);
      } catch (error) {
        console.error('Error fetching top players data:', error);
      }
    };

    fetchMatches();
    fetchStandings();
    fetchTopPlayers();
  }, []);

  const handleGameAnalysis = (matchId) => {
    navigate(`/game-analysis/${matchId}`);
  };

  const renderStandingsTables = () => {
    return Object.keys(standings).map((group) => (
      <div key={group}>
        <h3>Group {group}</h3>
        <Table
          columns={[
            { title: 'Place', dataIndex: 'place', key: 'place' },
            { title: 'Team', dataIndex: 'team', key: 'team' },
            { title: 'Points', dataIndex: 'points', key: 'points' },
            { title: 'GF', dataIndex: 'gf', key: 'gf' },
            { title: 'GA', dataIndex: 'ga', key: 'ga' },
            { title: 'GD', dataIndex: 'gd', key: 'gd' },
          ]}
          dataSource={standings[group]}
          pagination={false}
        />
      </div>
    ));
  };

  return (
    <div className="tournament-container">
      <Navbar2 user={user} />
      <div className="main-content">
        <div className="stats-table">
          <h3>Top Scorers</h3>
          <Table
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Team', dataIndex: 'team', key: 'team'},
              { title: 'Goals', dataIndex: 'stat', key: 'stat' },
            ]}
            dataSource={topScorers}
            pagination={false}
          />

          <h3>Top Assists</h3>
          <Table
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Team', dataIndex: 'team', key: 'team'},
              { title: 'Assists', dataIndex: 'stat', key: 'stat' },
            ]}
            dataSource={topAssists}
            pagination={false}
          />

          <h3>Yellow Cards</h3>
          <Table
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Team', dataIndex: 'team', key: 'team'},
              { title: 'Yellow Cards', dataIndex: 'stat', key: 'stat' },
            ]}
            dataSource={yellowCards}
            pagination={false}
          />

          <h3>Red Cards</h3>
          <Table
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Team', dataIndex: 'team', key: 'team'},
              { title: 'Red Cards', dataIndex: 'stat', key: 'stat' },
            ]}
            dataSource={redCards}
            pagination={false}
          />

          <h3>Clean Sheets</h3>
          <Table
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Team', dataIndex: 'team', key: 'team'},
              { title: 'Clean Sheets', dataIndex: 'stat', key: 'stat' },
            ]}
            dataSource={cleanSheets}
            pagination={false}
          />

          <h3>Top Ratings</h3>
          <Table
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Team', dataIndex: 'team', key: 'team'},
              { title: 'Rating', dataIndex: 'stat', key: 'stat' },
            ]}
            dataSource={topRatings}
            pagination={false}
          />
        </div>
        <div className="games-list">
          <h2>Upcoming Matches</h2>
          <ul>
            {matches.map((match) => (
              <li key={match.id}>
                <strong>{match.date}</strong> - {match.time} - {match.team1} vs {match.team2} at {match.venue}
                <Button onClick={() => handleGameAnalysis(match.id)}>Game Analysis</Button>
              </li>
            ))}
          </ul>
        </div>
        <div className="standings-table">
          <h2>Standings</h2>
          {renderStandingsTables()}
        </div>
      </div>
    </div>
  );
};

export default Euro2024;
