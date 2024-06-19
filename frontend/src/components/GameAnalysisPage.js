import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Statistic, Spin } from 'antd';
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
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const matchResponse = await fetch(`https://eurocopa-24-backend.onrender.com/api/matches/${gameId}`);
        if (!matchResponse.ok) {
          throw new Error('Failed to fetch match details');
        }
        const matchData = await matchResponse.json();

        const matchDateTimeString = `${matchData.date} ${matchData.time}`;
        const matchDateTime = new Date(matchDateTimeString);

        setMatchDetails(matchData);
        setCountdownDeadline(matchDateTime);

        setLoading(false);

        if (isCountdownOver(matchDateTime)) {
          // Fetch match result if countdown is over
          const matchResultResponse = await fetch(`https://eurocopa-24-backend.onrender.com/api/match-result/${gameId}`);
          //const matchResultResponse = await fetch(`http://localhost:8000/api/match-result/${gameId}`);
          if (!matchResultResponse.ok) {
            throw new Error('Failed to fetch match result');
          }
          const matchResultData = await matchResultResponse.json();
          setMatchResult(matchResultData);
          console.log(matchResultData);
        } else {
          // Fetch predicted lineups and standings if countdown is not over
          const [predictedLineup1Response, predictedLineup2Response, standingsResponse] = await Promise.all([
            fetch(`https://eurocopa-24-backend.onrender.com/api/predicted-lineups/${encodeURIComponent(matchData.team1)}`),
            fetch(`https://eurocopa-24-backend.onrender.com/api/predicted-lineups/${encodeURIComponent(matchData.team2)}`),
            fetch('https://eurocopa-24-backend.onrender.com/api/standings')
          ]);

          if (!predictedLineup1Response.ok || !predictedLineup2Response.ok || !standingsResponse.ok) {
            throw new Error('Failed to fetch predicted lineups or standings');
          }

          const [predictedLineup1Data, predictedLineup2Data, standingsData] = await Promise.all([
            predictedLineup1Response.json(),
            predictedLineup2Response.json(),
            standingsResponse.json()
          ]);

          setPredictedLineup1(predictedLineup1Data);
          setPredictedLineup2(predictedLineup2Data);
          setStandings(standingsData);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
        setLoading(false);
      }
    };

    if (gameId) {
      fetchData();
    }
  }, [gameId]);

  const isCountdownOver = (deadline) => {
    const currentDateTime = new Date();
    return deadline && deadline.getTime() <= currentDateTime.getTime();
  };

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
            {!isCountdownOver(countdownDeadline) && (
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
            )}
            {isCountdownOver(countdownDeadline) && matchResult && (
              <div className="match-result">
                <h2>Match Result:</h2>
                <p>{matchResult.team1} {matchResult.score1} - {matchResult.score2} {matchResult.team2}</p>
                <h3>Goal Scorers:</h3>
                <ul>
                  {matchResult.goalScorers.map((scorer, index) => (
                    <li key={index}>
                      {scorer.player} ({scorer.minute}')
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Footer</Footer>
    </Layout>
  );
};

export default GameAnalysisPage;
