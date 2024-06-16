import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar2 from './Navbar2';
import { Table } from 'antd';
import './Tournament.css';
import * as xlsx from 'xlsx';

const CopaAmerica24 = ({ user }) => {
  const [matches, setMatches] = useState([]);
  const location = useLocation();
  const { page } = location.state || {};
  const [stats] = useState({
    topScorers: [],
    topAssists: [],
    yellowCards: [],
    redCards: [],
    cleanSheets: [],
    topRatings: [],
  });

  const standingsData = []; // Placeholder for standings data

  const statsColumns = {
    topScorers: [
      { title: 'Player', dataIndex: 'name', key: 'name' },
      { title: 'Team', dataIndex: 'team', key: 'team' },
      { title: 'Goals', dataIndex: 'goals', key: 'goals' },
    ],
    topAssists: [
      { title: 'Player', dataIndex: 'name', key: 'name' },
      { title: 'Team', dataIndex: 'team', key: 'team' },
      { title: 'Assists', dataIndex: 'assists', key: 'assists' },
    ],
    yellowCards: [
      { title: 'Player', dataIndex: 'name', key: 'name' },
      { title: 'Team', dataIndex: 'team', key: 'team' },
      { title: 'Cards', dataIndex: 'cards', key: 'cards' },
    ],
    redCards: [
      { title: 'Player', dataIndex: 'name', key: 'name' },
      { title: 'Team', dataIndex: 'team', key: 'team' },
      { title: 'Cards', dataIndex: 'cards', key: 'cards' },
    ],
    cleanSheets: [
      { title: 'Player', dataIndex: 'name', key: 'name' },
      { title: 'Team', dataIndex: 'team', key: 'team' },
      { title: 'Clean Sheets', dataIndex: 'cleanSheets', key: 'cleanSheets' },
    ],
    topRatings: [
      { title: 'Player', dataIndex: 'name', key: 'name' },
      { title: 'Team', dataIndex: 'team', key: 'team' },
      { title: 'Rating', dataIndex: 'rating', key: 'rating' },
    ],
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const workbook = xlsx.readFile('C:\\Users\\OWNER\\Desktop\\COPA_AMERICA_2024.xlsx');
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet);

        // Assuming the Excel data has columns: Date, Time, Team 1, Team 2, Match No., Teams and Venue
        const parsedMatches = jsonData.map((row) => ({
          id: row['Match No.'],
          teams: `${row['Team 1']} vs ${row['Team 2']}`,
          time: row['Time'],
          date: row['Date'],
          venue: row['Teams and Venue'],
        }));

        setMatches(parsedMatches);

        // Here you can also set the stats if they are available in the Excel file or other source
        // setStats(parsedStatsData);

      } catch (error) {
        console.error('Error reading Excel file:', error);
      }
    };

    fetchMatches();
  }, []);

  const matchesColumns = [
    { title: 'Match', dataIndex: 'teams', key: 'teams' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Time', dataIndex: 'time', key: 'time' },
    { title: 'Venue', dataIndex: 'venue', key: 'venue' },
    { title: 'Action', key: 'action', render: () => <button>Game Analysis</button> },
  ];

  const standingsColumns = [
    { title: 'Team', dataIndex: 'team', key: 'team' },
    { title: 'Points', dataIndex: 'points', key: 'points' },
    { title: 'GF', dataIndex: 'gf', key: 'gf' },
    { title: 'GA', dataIndex: 'ga', key: 'ga' },
    { title: 'GD', dataIndex: 'gd', key: 'gd' },
  ];

  return (
    <div className="tournament-container">
      <Navbar2 user={user} page={page} />
      <div className="main-content">
        <div className="stats-table">
          <h3>Top Scorers</h3>
          <Table columns={statsColumns.topScorers} dataSource={stats.topScorers} pagination={false} />

          <h3>Top Assists</h3>
          <Table columns={statsColumns.topAssists} dataSource={stats.topAssists} pagination={false} />

          <h3>Yellow Cards</h3>
          <Table columns={statsColumns.yellowCards} dataSource={stats.yellowCards} pagination={false} />

          <h3>Red Cards</h3>
          <Table columns={statsColumns.redCards} dataSource={stats.redCards} pagination={false} />

          <h3>Clean Sheets</h3>
          <Table columns={statsColumns.cleanSheets} dataSource={stats.cleanSheets} pagination={false} />

          <h3>Top Ratings</h3>
          <Table columns={statsColumns.topRatings} dataSource={stats.topRatings} pagination={false} />
        </div>
        <div className="matches-container">
          <h2>Upcoming Matches</h2>
          <div className='games-list'>
            {matches.map((match) => (
              <div key={match.id} className='match'>
                <h3>{match.teams}</h3>
                <p>{match.time}</p>
                <button>Game Analysis</button>
              </div>
            ))}
          </div>
          <Table columns={matchesColumns} dataSource={matches} pagination={false} />
        </div>
        <div className="standings-table">
          <h2>Standings</h2>
          <Table columns={standingsColumns} dataSource={standingsData} pagination={false} />
        </div>
      </div>
    </div>
  );
}

export default CopaAmerica24;
