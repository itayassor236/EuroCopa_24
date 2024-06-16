import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { InputNumber, Button, Layout } from 'antd';
import './BetsPage.css'; // Import your custom CSS file for styling

const { Header, Content, Footer, Sider } = Layout;

const BetsPage = ({ user }) => {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [yourPlace, setYourPlace] = useState('1st'); // Replace with actual data
  const [points, setPoints] = useState('100'); // Replace with actual data

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('http://localhost:7077/api/matches');
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

      setUpcomingMatches(parsedMatches);
    } catch (error) {
      console.error('Error fetching match data:', error);
    }
  };

  const onChange = (value) => {
    console.log('changed', value);
  };

  const handleSaveBets = () => {
    // Handle saving all bets logic here
    console.log('Saving all bets...');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header">
        <Navbar user={user} />
      </Header>
      <Layout>
        <Sider width={250} className="sidebar">
          <div className="sidebar-content">
            <div className="sidebar-section">
              <div className="section-title">Your place</div>
              <div className="section-data">{yourPlace}</div>
            </div>
            <div className="sidebar-section">
              <div className="section-title">Points</div>
              <div className="section-data">{points}</div>
            </div>
            <Button type="primary" onClick={handleSaveBets} className="save-bets-button">
              Save Bets
            </Button>
          </div>
        </Sider>
        <Layout className="content-layout">
          <Content className="content">
            <div className="site-layout-background" style={{ padding: 24, minHeight: 380 }}>
              <div className="upcoming-matches">
                <h2>Upcoming Matches</h2>
                {upcomingMatches.map((match, index) => (
                  <div key={index} className="match">
                    <div className="match-details">
                      <span className="match-detail">{match.date}</span>
                      <span className="match-detail">{match.time}</span>
                      <span className="match-detail">{match.venue}</span>
                    </div>
                    <div className="teams-with-cubes">
                      <div className="team">
                        <span className="team-name">{match.team1}</span>
                        <InputNumber min={0} max={10} defaultValue={0} onChange={onChange} className="cube-input" />
                      </div>
                      <div className="vs">vs</div>
                      <div className="team">
                        <span className="team-name">{match.team2}</span>
                        <InputNumber min={0} max={10} defaultValue={0} onChange={onChange} className="cube-input" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>Footer</Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default BetsPage;

