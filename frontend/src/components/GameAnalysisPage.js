import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Statistic, Table, Spin } from 'antd';
import Navbar from './Navbar';
import './GameAnalysisPage.css';

const { Header, Content, Footer } = Layout;
const { Countdown } = Statistic;

const GameAnalysisPage = ({ user }) => {
  const { gameId } = useParams();
  const [matchDetails, setMatchDetails] = useState({});
  const [countdownDeadline, setCountdownDeadline] = useState(null);
  const [predictedLineup1, setPredictedLineup1] = useState([]);
  const [predictedLineup2, setPredictedLineup2] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const matchResponse = await fetch(`http://localhost:7077/api/matches/${gameId}`);
        if (!matchResponse.ok) {
          throw new Error('Failed to fetch match details');
        }
        const matchData = await matchResponse.json();

        const matchDateTimeString = `${matchData.date} ${matchData.time}`;
        const matchDateTime = new Date(matchDateTimeString);

        const [response1, response2, standingsResponse] = await Promise.all([
          fetch(`http://localhost:7077/api/predicted-lineups/${encodeURIComponent(matchData.team1)}`),
          fetch(`http://localhost:7077/api/predicted-lineups/${encodeURIComponent(matchData.team2)}`),
          fetch('http://localhost:7077/api/standings')
        ]);

        if (!response1.ok || !response2.ok || !standingsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [predictedLineup1, predictedLineup2, standingsData] = await Promise.all([
          response1.json(),
          response2.json(),
          standingsResponse.json()
        ]);

        setMatchDetails(matchData);
        setCountdownDeadline(matchDateTime);
        setPredictedLineup1(predictedLineup1);
        setPredictedLineup2(predictedLineup2);
        setStandings(standingsData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data: ', error);
        setLoading(false);
      }
    };

    if (gameId) {
      fetchData();
    }
  }, [gameId]);

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header className="header">
        <Navbar user={user} />
      </Header>
      <Content className="content">
        <div className="site-layout-background" style={{ padding: 24, minHeight: 380 }}>
          <div className="game-analysis">
            <h1>{matchDetails.team1} vs {matchDetails.team2}</h1>
            <div className="countdown">
              {countdownDeadline && (
                <Countdown title="Time Remaining" value={countdownDeadline} />
              )}
            </div>
            <div className="lineups">
              <h2>{matchDetails.team1} Predicted Lineup:</h2>
              <ul>
                {predictedLineup1.map((player, index) => (
                  <li key={index}>{player}</li>
                ))}
              </ul>
              <h2>{matchDetails.team2} Predicted Lineup:</h2>
              <ul>
                {predictedLineup2.map((player, index) => (
                  <li key={index}>{player}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Footer</Footer>
    </Layout>
  );
};

export default GameAnalysisPage;

