import { useState, useEffect } from 'react';
import { Card, ProgressBar, Container, Row, Col, Image, Nav, Tab, Badge } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Mail, Brain, BookOpen, Award, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import ProgressCard from '../../components/Dashboard/ProgressCard';
import EmailStatsChart from '../../components/Dashboard/EmailStatsChart';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Dashboard = () => {
  const [userProgress, setUserProgress] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [userName, setUserName] = useState(null);
  const [badges, setBadges] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allQuizData, setAllQuizData] = useState(null);
  const [userSessions, setUserSessions] = useState(null);
  const [quizProgressData, setQuizProgressData] = useState(null);
  const [emailData, setEmailData] = useState(null);

  // Sample data - in a real app, this would come from props or an API
  // const xpData = [
  //   { day: 'Mon', xp: 120 },
  //   { day: 'Tue', xp: 250 },
  //   { day: 'Wed', xp: 180 },
  //   { day: 'Thu', xp: 300 },
  //   { day: 'Fri', xp: 220 }
  // ];

  // const emailData = [
  //   {"date": "2024-10-1", "emails_scanned": 19, "phishing_emails": 5}, {"date": "2024-10-2", "emails_scanned": 49, "phishing_emails": 2}, {"date": "2024-10-3", "emails_scanned": 86, "phishing_emails": 4}, {"date": "2024-10-4", "emails_scanned": 33, "phishing_emails": 2}, {"date": "2024-10-5", "emails_scanned": 77, "phishing_emails": 6}, {"date": "2024-10-6", "emails_scanned": 54, "phishing_emails": 3}, {"date": "2024-10-7", "emails_scanned": 71, "phishing_emails": 1}, {"date": "2024-10-8", "emails_scanned": 76, "phishing_emails": 2}, {"date": "2024-10-9", "emails_scanned": 77, "phishing_emails": 5}, {"date": "2024-10-10", "emails_scanned": 5, "phishing_emails": 5}, {"date": "2024-10-11", "emails_scanned": 83, "phishing_emails": 3}, {"date": "2024-10-12", "emails_scanned": 16, "phishing_emails": 4}, {"date": "2024-10-13", "emails_scanned": 2, "phishing_emails": 8}, {"date": "2024-10-14", "emails_scanned": 68, "phishing_emails": 4}, {"date": "2024-10-15", "emails_scanned": 30, "phishing_emails": 9}, {"date": "2024-10-16", "emails_scanned": 77, "phishing_emails": 4}, {"date": "2024-10-17", "emails_scanned": 67, "phishing_emails": 4}, {"date": "2024-10-18", "emails_scanned": 69, "phishing_emails": 7}, {"date": "2024-10-19", "emails_scanned": 68, "phishing_emails": 8}, {"date": "2024-10-20", "emails_scanned": 83, "phishing_emails": 1}, {"date": "2024-10-21", "emails_scanned": 65, "phishing_emails": 8}, {"date": "2024-10-22", "emails_scanned": 12, "phishing_emails": 3}, {"date": "2024-10-23", "emails_scanned": 31, "phishing_emails": 9}, {"date": "2024-10-24", "emails_scanned": 84, "phishing_emails": 2}, {"date": "2024-10-25", "emails_scanned": 53, "phishing_emails": 10}, {"date": "2024-10-26", "emails_scanned": 59, "phishing_emails": 7}, {"date": "2024-10-27", "emails_scanned": 62, "phishing_emails": 10}, {"date": "2024-10-28", "emails_scanned": 48, "phishing_emails": 4}, {"date": "2024-10-29", "emails_scanned": 38, "phishing_emails": 7}, {"date": "2024-10-30", "emails_scanned": 39, "phishing_emails": 4}, {"date": "2024-11-1", "emails_scanned": 86, "phishing_emails": 3}, {"date": "2024-11-2", "emails_scanned": 49, "phishing_emails": 1}, {"date": "2024-11-3", "emails_scanned": 16, "phishing_emails": 8}, {"date": "2024-11-4", "emails_scanned": 20, "phishing_emails": 9}, {"date": "2024-11-5", "emails_scanned": 38, "phishing_emails": 2}, {"date": "2024-11-6", "emails_scanned": 2, "phishing_emails": 9}, {"date": "2024-11-7", "emails_scanned": 100, "phishing_emails": 8}, {"date": "2024-11-8", "emails_scanned": 82, "phishing_emails": 7}, {"date": "2024-11-9", "emails_scanned": 67, "phishing_emails": 3}, {"date": "2024-11-10", "emails_scanned": 55, "phishing_emails": 2}, {"date": "2024-11-11", "emails_scanned": 3, "phishing_emails": 2}, {"date": "2024-11-12", "emails_scanned": 40, "phishing_emails": 7}, {"date": "2024-11-13", "emails_scanned": 9, "phishing_emails": 6}, {"date": "2024-11-14", "emails_scanned": 72, "phishing_emails": 3}, {"date": "2024-11-15", "emails_scanned": 56, "phishing_emails": 10}, {"date": "2024-11-16", "emails_scanned": 77, "phishing_emails": 3}, {"date": "2024-11-17", "emails_scanned": 76, "phishing_emails": 8}, {"date": "2024-11-18", "emails_scanned": 42, "phishing_emails": 10}, {"date": "2024-11-19", "emails_scanned": 42, "phishing_emails": 9}, {"date": "2024-11-20", "emails_scanned": 50, "phishing_emails": 8}, {"date": "2024-11-21", "emails_scanned": 42, "phishing_emails": 9}, {"date": "2024-11-22", "emails_scanned": 82, "phishing_emails": 10}, {"date": "2024-11-23", "emails_scanned": 17, "phishing_emails": 7}, {"date": "2024-11-24", "emails_scanned": 11, "phishing_emails": 5}, {"date": "2024-11-25", "emails_scanned": 64, "phishing_emails": 5}, {"date": "2024-11-26", "emails_scanned": 99, "phishing_emails": 5}, {"date": "2024-11-27", "emails_scanned": 51, "phishing_emails": 3}, {"date": "2024-11-28", "emails_scanned": 48, "phishing_emails": 8}, {"date": "2024-11-29", "emails_scanned": 66, "phishing_emails": 5}, {"date": "2024-11-30", "emails_scanned": 85, "phishing_emails": 5}, {"date": "2024-12-1", "emails_scanned": 44, "phishing_emails": 2}, {"date": "2024-12-2", "emails_scanned": 12, "phishing_emails": 7}, {"date": "2024-12-3", "emails_scanned": 30, "phishing_emails": 5}, {"date": "2024-12-4", "emails_scanned": 11, "phishing_emails": 5}, {"date": "2024-12-5", "emails_scanned": 38, "phishing_emails": 3}, {"date": "2024-12-6", "emails_scanned": 36, "phishing_emails": 1}, {"date": "2024-12-7", "emails_scanned": 100, "phishing_emails": 8}, {"date": "2024-12-8", "emails_scanned": 85, "phishing_emails": 7}, {"date": "2024-12-9", "emails_scanned": 38, "phishing_emails": 1}, {"date": "2024-12-10", "emails_scanned": 32, "phishing_emails": 10}, {"date": "2024-12-11", "emails_scanned": 40, "phishing_emails": 7}, {"date": "2024-12-12", "emails_scanned": 6, "phishing_emails": 1}, {"date": "2024-12-13", "emails_scanned": 85, "phishing_emails": 8}, {"date": "2024-12-14", "emails_scanned": 13, "phishing_emails": 10}, {"date": "2024-12-15", "emails_scanned": 16, "phishing_emails": 6}, {"date": "2024-12-16", "emails_scanned": 9, "phishing_emails": 10}, {"date": "2024-12-17", "emails_scanned": 78, "phishing_emails": 2}, {"date": "2024-12-18", "emails_scanned": 44, "phishing_emails": 10}, {"date": "2024-12-19", "emails_scanned": 85, "phishing_emails": 6}, {"date": "2024-12-20", "emails_scanned": 75, "phishing_emails": 2}, {"date": "2024-12-21", "emails_scanned": 8, "phishing_emails": 6}, {"date": "2024-12-22", "emails_scanned": 32, "phishing_emails": 10}, {"date": "2024-12-23", "emails_scanned": 70, "phishing_emails": 9}, {"date": "2024-12-24", "emails_scanned": 61, "phishing_emails": 3}, {"date": "2024-12-25", "emails_scanned": 98, "phishing_emails": 8}, {"date": "2024-12-26", "emails_scanned": 71, "phishing_emails": 8}, {"date": "2024-12-27", "emails_scanned": 55, "phishing_emails": 9}, {"date": "2024-12-28", "emails_scanned": 2, "phishing_emails": 9}, {"date": "2024-12-29", "emails_scanned": 33, "phishing_emails": 1}, {"date": "2024-12-30", "emails_scanned": 35, "phishing_emails": 8}, {"date": "2025-1-1", "emails_scanned": 59, "phishing_emails": 7}, {"date": "2025-1-2", "emails_scanned": 59, "phishing_emails": 7}, {"date": "2025-1-3", "emails_scanned": 31, "phishing_emails": 7}, {"date": "2025-1-4", "emails_scanned": 50, "phishing_emails": 6}, {"date": "2025-1-5", "emails_scanned": 31, "phishing_emails": 1}, {"date": "2025-1-6", "emails_scanned": 19, "phishing_emails": 2}, {"date": "2025-1-7", "emails_scanned": 91, "phishing_emails": 7}, {"date": "2025-1-8", "emails_scanned": 69, "phishing_emails": 1}, {"date": "2025-1-9", "emails_scanned": 52, "phishing_emails": 3}, {"date": "2025-1-10", "emails_scanned": 82, "phishing_emails": 9}, {"date": "2025-1-11", "emails_scanned": 33, "phishing_emails": 6}, {"date": "2025-1-12", "emails_scanned": 16, "phishing_emails": 2}, {"date": "2025-1-13", "emails_scanned": 97, "phishing_emails": 9}, {"date": "2025-1-14", "emails_scanned": 7, "phishing_emails": 2}, {"date": "2025-1-15", "emails_scanned": 3, "phishing_emails": 6}, {"date": "2025-1-16", "emails_scanned": 46, "phishing_emails": 3}, {"date": "2025-1-17", "emails_scanned": 89, "phishing_emails": 5}, {"date": "2025-1-18", "emails_scanned": 70, "phishing_emails": 1}, {"date": "2025-1-19", "emails_scanned": 60, "phishing_emails": 3}, {"date": "2025-1-20", "emails_scanned": 33, "phishing_emails": 5}, {"date": "2025-1-21", "emails_scanned": 86, "phishing_emails": 10}, {"date": "2025-1-22", "emails_scanned": 97, "phishing_emails": 2}, {"date": "2025-1-23", "emails_scanned": 99, "phishing_emails": 6}, {"date": "2025-1-24", "emails_scanned": 49, "phishing_emails": 8}, {"date": "2025-1-25", "emails_scanned": 60, "phishing_emails": 8}, {"date": "2025-1-26", "emails_scanned": 30, "phishing_emails": 5}, {"date": "2025-1-27", "emails_scanned": 15, "phishing_emails": 1}, {"date": "2025-1-28", "emails_scanned": 96, "phishing_emails": 7}, {"date": "2025-1-29", "emails_scanned": 25, "phishing_emails": 1}, {"date": "2025-1-30", "emails_scanned": 93, "phishing_emails": 4}, {"date": "2025-2-1", "emails_scanned": 77, "phishing_emails": 4}, {"date": "2025-2-2", "emails_scanned": 90, "phishing_emails": 7}, {"date": "2025-2-3", "emails_scanned": 99, "phishing_emails": 7}, {"date": "2025-2-4", "emails_scanned": 36, "phishing_emails": 8}, {"date": "2025-2-5", "emails_scanned": 42, "phishing_emails": 8}, {"date": "2025-2-6", "emails_scanned": 46, "phishing_emails": 8}, {"date": "2025-2-7", "emails_scanned": 4, "phishing_emails": 5}, {"date": "2025-2-8", "emails_scanned": 15, "phishing_emails": 9}, {"date": "2025-2-9", "emails_scanned": 61, "phishing_emails": 1}, {"date": "2025-2-10", "emails_scanned": 46, "phishing_emails": 9}, {"date": "2025-2-11", "emails_scanned": 45, "phishing_emails": 4}, {"date": "2025-2-12", "emails_scanned": 53, "phishing_emails": 6}, {"date": "2025-2-13", "emails_scanned": 71, "phishing_emails": 6}, {"date": "2025-2-14", "emails_scanned": 19, "phishing_emails": 1}, {"date": "2025-2-15", "emails_scanned": 38, "phishing_emails": 2}, {"date": "2025-2-16", "emails_scanned": 44, "phishing_emails": 10}, {"date": "2025-2-17", "emails_scanned": 55, "phishing_emails": 10}, {"date": "2025-2-18", "emails_scanned": 91, "phishing_emails": 5}, {"date": "2025-2-19", "emails_scanned": 100, "phishing_emails": 4}, {"date": "2025-2-20", "emails_scanned": 40, "phishing_emails": 2}, {"date": "2025-2-21", "emails_scanned": 60, "phishing_emails": 6}, {"date": "2025-2-22", "emails_scanned": 23, "phishing_emails": 6}, {"date": "2025-2-23", "emails_scanned": 36, "phishing_emails": 9}, {"date": "2025-2-24", "emails_scanned": 61, "phishing_emails": 2}, {"date": "2025-2-25", "emails_scanned": 3, "phishing_emails": 6}, {"date": "2025-2-26", "emails_scanned": 40, "phishing_emails": 1}, {"date": "2025-2-27", "emails_scanned": 56, "phishing_emails": 10}, {"date": "2025-2-28", "emails_scanned": 2, "phishing_emails": 8}, {"date": "2025-2-29", "emails_scanned": 40, "phishing_emails": 2}, {"date": "2025-2-30", "emails_scanned": 22, "phishing_emails": 10}, {"date": "2025-3-1", "emails_scanned": 11, "phishing_emails": 7}, {"date": "2025-3-2", "emails_scanned": 96, "phishing_emails": 3}, {"date": "2025-3-3", "emails_scanned": 6, "phishing_emails": 8}, {"date": "2025-3-4", "emails_scanned": 83, "phishing_emails": 10}, {"date": "2025-3-5", "emails_scanned": 89, "phishing_emails": 1}, {"date": "2025-3-6", "emails_scanned": 50, "phishing_emails": 9}, {"date": "2025-3-7", "emails_scanned": 20, "phishing_emails": 3}, {"date": "2025-3-8", "emails_scanned": 51, "phishing_emails": 9}, {"date": "2025-3-9", "emails_scanned": 36, "phishing_emails": 9}, {"date": "2025-3-10", "emails_scanned": 73, "phishing_emails": 3}, {"date": "2025-3-11", "emails_scanned": 11, "phishing_emails": 10}, {"date": "2025-3-12", "emails_scanned": 40, "phishing_emails": 9}, {"date": "2025-3-13", "emails_scanned": 32, "phishing_emails": 4}, {"date": "2025-3-14", "emails_scanned": 10, "phishing_emails": 5}, {"date": "2025-3-15", "emails_scanned": 26, "phishing_emails": 10}, {"date": "2025-3-16", "emails_scanned": 53, "phishing_emails": 5}, {"date": "2025-3-17", "emails_scanned": 70, "phishing_emails": 9}, {"date": "2025-3-18", "emails_scanned": 75, "phishing_emails": 5}, {"date": "2025-3-19", "emails_scanned": 91, "phishing_emails": 1}, {"date": "2025-3-20", "emails_scanned": 86, "phishing_emails": 10}, {"date": "2025-3-21", "emails_scanned": 4, "phishing_emails": 9}, {"date": "2025-3-22", "emails_scanned": 44, "phishing_emails": 5}, {"date": "2025-3-23", "emails_scanned": 27, "phishing_emails": 9}, {"date": "2025-3-24", "emails_scanned": 87, "phishing_emails": 6}, {"date": "2025-3-25", "emails_scanned": 22, "phishing_emails": 1}, {"date": "2025-3-26", "emails_scanned": 73, "phishing_emails": 4}, {"date": "2025-3-27", "emails_scanned": 74, "phishing_emails": 8}, {"date": "2025-3-28", "emails_scanned": 67, "phishing_emails": 6}, {"date": "2025-3-29", "emails_scanned": 37, "phishing_emails": 1}, {"date": "2025-3-30", "emails_scanned": 17, "phishing_emails": 7}
  // ]

  const emailStats = {
    total: 156,
    scams: 23,
    dailyStreak: 7
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User ID not found.');
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch profile details from the backend
        const profileResponse = await fetch('http://18.214.76.26:5002/get_profile_details/' + userId);
        if (!profileResponse.ok) {
          throw new Error(`Error: ${profileResponse.status} ${profileResponse.statusText}`);
        }
        const profileData = await profileResponse.json();
        setProfileData(profileData);
        setUserName(profileData.fullName);

        // 2. Fetch user quizzes from the backend
        const quizzesResponse = await fetch('http://18.214.76.26:5004/get_user_quizzes/' + userId);
        if (!quizzesResponse.ok) {
          throw new Error(`Error: ${quizzesResponse.status} ${quizzesResponse.statusText}`);
        }
        const quizzesData = await quizzesResponse.json();

        // Extract quizXP, spotterXP and numQuizzes from the profile details
        // Pass into endpoint as JSON object
        const userProgress = {
          quizXP: profileData.quizXP,
          spotterXP: profileData.spotterXP,
          numQuizzes: quizzesData.filter((quiz) => quiz.status === 'accepted').length,
        };

        // 3. Fetch user progress from the backend
        const progressResponse = await fetch('http://18.214.76.26:5008/get_progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userProgress),
        });
        if (!progressResponse.ok) {
          throw new Error(`Error: ${progressResponse.status} ${progressResponse.statusText}`);
        }
        const progressData = await progressResponse.json();
        setUserProgress(progressData);

        // 4. Fetch Badges from the backend
        const badgesResponse = await fetch('http://18.214.76.26:5008/get_badges', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userProgress),
        });
        if (!badgesResponse.ok) {
          throw new Error(`Error: ${badgesResponse.status} ${badgesResponse.statusText}`);
        }
        const badgesData = await badgesResponse.json();
        setBadges(badgesData);

        // 5. Fetch all quiz data from the backend
        const allQuizResponse = await fetch('http://18.214.76.26:5004/get_custom_quizzes_details');
        if (!allQuizResponse.ok) {
          throw new Error(`Error: ${allQuizResponse.status} ${allQuizResponse.statusText}`);
        }
        const allQuizData = await allQuizResponse.json();
        setAllQuizData(allQuizData);

        // 6. Fetch user sessions from the backend
        const userSessionsResponse = await fetch('http://18.214.76.26:5006/get_user_quiz_sessions/' + userId);
        if (!userSessionsResponse.ok) {
          throw new Error(`Error: ${userSessionsResponse.status} ${userSessionsResponse.statusText}`);
        }
        const userSessionsData = await userSessionsResponse.json();
        setUserSessions(userSessionsData);

        // Process quiz progress data
        if (allQuizData && userSessionsData) {
          processQuizProgressData(allQuizData, userSessionsData);
        }

        // 7. Fetch email data from the backend
      const emailDataResponse = await fetch('http://18.214.76.26:5015/get_email_records/' + userId);
      if (!emailDataResponse.ok) {
        throw new Error(`Error: ${emailDataResponse.status} ${emailDataResponse.statusText}`);
      }
      const emailDataResult = await emailDataResponse.json();

      // Update the emailData state with the fetched data
      setEmailData(emailDataResult);
        

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Process quiz progress data when allQuizData or userSessions change
  useEffect(() => {
    if (allQuizData && userSessions) {
      processQuizProgressData(allQuizData, userSessions);
    }
  }, [allQuizData, userSessions]);

  // Process quiz data and user sessions to build progress metrics
  const processQuizProgressData = (quizData, sessions) => {
    const topicProgressMap = {};

    // Initialize topic progress map with all topics from quizData
    quizData.forEach(topicData => {
      const mainTopic = topicData.mainTopic;
      const allQuizzesInTopic = topicData.subTopicList.reduce((acc, subTopic) => {
        return acc.concat(subTopic.quizzes);
      }, []);

      topicProgressMap[mainTopic] = {
        mainTopic,
        totalQuizzes: allQuizzesInTopic.length,
        attempted: 0,
        completed: 0,
        subTopics: {}
      };

      // Initialize subtopic progress
      topicData.subTopicList.forEach(subTopicData => {
        const subTopic = subTopicData.subTopic;
        topicProgressMap[mainTopic].subTopics[subTopic] = {
          subTopic,
          totalQuizzes: subTopicData.quizzes.length,
          attempted: 0,
          completed: 0,
          quizzes: subTopicData.quizzes.map(quiz => ({
            ...quiz,
            attempted: false,
            completed: false
          }))
        };
      });
    });

    // Update progress based on user sessions
    sessions.forEach(session => {
      const { quiz_id, topic, subtopic, session_xp } = session;
      
      if (topicProgressMap[topic]) {
        // Update subtopic level data if it exists
        if (topicProgressMap[topic].subTopics[subtopic]) {
          const subTopicData = topicProgressMap[topic].subTopics[subtopic];
          
          // Find the quiz in the subtopic
          const quizIndex = subTopicData.quizzes.findIndex(q => q.quizId === quiz_id);
          
          if (quizIndex !== -1) {
            // Mark as attempted
            if (!subTopicData.quizzes[quizIndex].attempted) {
              subTopicData.quizzes[quizIndex].attempted = true;
              subTopicData.attempted++;
              topicProgressMap[topic].attempted++;
            }
            
            // Mark as completed if session_xp > 0
            if (session_xp > 0 && !subTopicData.quizzes[quizIndex].completed) {
              subTopicData.quizzes[quizIndex].completed = true;
              subTopicData.completed++;
              topicProgressMap[topic].completed++;
            }
          }
        }
      }
    });

    // Convert to array for easier rendering
    const progressDataArray = Object.values(topicProgressMap);
    setQuizProgressData(progressDataArray);
  };

  const LevelProgress = ({ xp }) => {
    const xpPerLevel = 250;
    const level = Math.floor(xp / xpPerLevel); // Determine current level
    const xpToNextLevel = xp % xpPerLevel; // XP within current level
    const progressPercent = (xpToNextLevel / xpPerLevel) * 100; // Calculate progress percentage
  
    return (
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <Card.Title className="mb-0 d-flex align-items-center">
            <Trophy className="me-2" />
            Level Progress
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="fs-5">Current Level: <strong>{level}</strong></span>
            <span className="badge bg-primary px-3 py-2">{xpToNextLevel} / {xpPerLevel} XP</span>
          </div>
          <ProgressBar 
            now={progressPercent} 
            variant="primary" 
            style={{ height: '12px' }} 
          />
          <div className="d-flex justify-content-between mt-2">
            <small>Next Level: {level + 1}</small>
            <small>{progressPercent.toFixed(1)}% Complete</small>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // Stats Card Component
  const StatsCard = ({ icon, title, value, color }) => (
    <Card className="mb-4 shadow-sm">
      <Card.Body className="d-flex align-items-center">
        <div className={`rounded-circle p-3 me-3 text-white bg-${color}`}>
          {icon}
        </div>
        <div>
          <div className="text-muted fs-6">{title}</div>
          <div className="fs-4 fw-bold">{value}</div>
        </div>
      </Card.Body>
    </Card>
  );
  
  // Quiz Topic Progress Card Component
  const QuizTopicCard = ({ topic }) => {
    const totalProgress = topic.totalQuizzes > 0 
      ? Math.round((topic.completed / topic.totalQuizzes) * 100) 
      : 0;
    
    const progressColorClass = totalProgress < 30 ? 'danger' : 
                              totalProgress < 70 ? 'warning' : 'success';
    
    // Generate pie chart data
    const pieData = [
      { name: 'Completed', value: topic.completed, color: '#28a745' },
      { name: 'Attempted', value: topic.attempted - topic.completed, color: '#ffc107' },
      { name: 'Not Started', value: topic.totalQuizzes - topic.attempted, color: '#e9ecef' }
    ];

    return (
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <Card.Title className="mb-0 d-flex align-items-center justify-content-between">
            <div>
              <BookOpen className="me-2" size={18} />
              {topic.mainTopic}
            </div>
            <Badge bg={progressColorClass} className="px-3 py-2">
              {totalProgress}% Complete
            </Badge>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={7}>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Progress</span>
                  <span>{topic.completed} of {topic.totalQuizzes} complete</span>
                </div>
                <ProgressBar>
                  <ProgressBar variant="success" now={(topic.completed / topic.totalQuizzes) * 100} key={1} />
                  <ProgressBar variant="warning" now={((topic.attempted - topic.completed) / topic.totalQuizzes) * 100} key={2} />
                </ProgressBar>
              </div>
              <div className="d-flex justify-content-between mt-3">
                <div>
                  <div className="d-flex align-items-center">
                    <CheckCircle className="me-2 text-success" size={16} />
                    <span className="fw-bold">Completed</span>
                  </div>
                  <span className="fs-4 ms-4">{topic.completed}</span>
                </div>
                <div>
                  <div className="d-flex align-items-center">
                    <Clock className="me-2 text-warning" size={16} />
                    <span className="fw-bold">In Progress</span>
                  </div>
                  <span className="fs-4 ms-4">{topic.attempted - topic.completed}</span>
                </div>
                <div>
                  <div className="d-flex align-items-center">
                    <ArrowRight className="me-2 text-secondary" size={16} />
                    <span className="fw-bold">Not Started</span>
                  </div>
                  <span className="fs-4 ms-4">{topic.totalQuizzes - topic.attempted}</span>
                </div>
              </div>
            </Col>
            <Col md={5} className="d-flex align-items-center justify-content-center">
              <div style={{ width: '150px', height: '150px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      innerRadius={40}
                      paddingAngle={2}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className='content-container text-center my-5 pt-5'>
        <DotLottieReact
          src="https://lottie.host/c4ebbe3c-45f7-4cbc-a483-0a4016d9d250/SHoYfui1im.lottie"
          loop
          autoplay
          className="w-50 h-auto mx-auto"
        />
        <h3 className='my-5 fw-bold'>Setting up your Dashboard, Please Wait for a Moment!</h3>
      </div>  
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-5">
        <h4>Error</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <Container fluid className="p-4 bg-light">
      <Row className="mb-4">
        <Col>
          <div className="bg-white p-4 rounded shadow-sm">
            <h1 className="mb-2 fw-bold">Hello {userName}!</h1>
            <p className="text-muted">
              Welcome to your personalized dashboard. Here you can track your progress, view your achievements, and see how you're doing in your daily tasks.
            </p>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {/* Level Progress Card */}
          {profileData && <LevelProgress xp={profileData.overallXP} />}

          {/* Tier Progress Section - Using ProgressCard */}
          {userProgress && (
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-success text-white">
                <Card.Title className="mb-0 d-flex align-items-center">
                  <Trophy className="me-2" />
                  Tier Progress
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <ProgressCard progress={userProgress} />
              </Card.Body>
            </Card>
          )}

          {/* Tabbed Quiz Progress Section */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <Card.Title className="mb-0 d-flex align-items-center">
                <Brain className="me-2" />
                Quiz Progress
              </Card.Title>
            </Card.Header>
            <Card.Body>
              {quizProgressData ? (
                quizProgressData.length > 0 ? (
                  <>
                    <Tab.Container defaultActiveKey={quizProgressData[0].mainTopic}>
                      <Nav variant="pills" className="mb-3">
                        {quizProgressData.map((topic) => (
                          <Nav.Item key={topic.mainTopic}>
                            <Nav.Link eventKey={topic.mainTopic} className="d-flex align-items-center">
                              {topic.mainTopic}
                              <Badge bg="primary" className="ms-2">
                                {topic.completed}/{topic.totalQuizzes}
                              </Badge>
                            </Nav.Link>
                          </Nav.Item>
                        ))}
                      </Nav>
                      <Tab.Content>
                        {quizProgressData.map((topic) => (
                          <Tab.Pane key={topic.mainTopic} eventKey={topic.mainTopic}>
                            <QuizTopicCard topic={topic} />
                            <div className="mt-3">
                              <h6 className="mb-3">Sub-topics</h6>
                              <Row>
                                {Object.values(topic.subTopics).map((subTopic) => (
                                  <Col md={6} key={subTopic.subTopic}>
                                    <Card className="mb-3 shadow-sm">
                                      <Card.Body>
                                        <h6>{subTopic.subTopic}</h6>
                                        <div className="d-flex justify-content-between mb-2">
                                          <span>Progress</span>
                                          <span>{subTopic.completed}/{subTopic.totalQuizzes}</span>
                                        </div>
                                        <ProgressBar>
                                          <ProgressBar variant="success" now={(subTopic.completed / subTopic.totalQuizzes) * 100} key={1} />
                                          <ProgressBar variant="warning" now={((subTopic.attempted - subTopic.completed) / subTopic.totalQuizzes) * 100} key={2} />
                                        </ProgressBar>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                ))}
                              </Row>
                            </div>
                          </Tab.Pane>
                        ))}
                      </Tab.Content>
                    </Tab.Container>
                  </>
                ) : (
                  <div className="text-center py-5">
                    <h5>No quiz data available</h5>
                    <p className="text-muted">Start taking quizzes to see your progress here!</p>
                  </div>
                )
              ) : (
                <div className="text-center py-5">
                  <p>Loading quiz progress data...</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Stats Cards */}
          <Row>
            <Col md={6} lg={12}>
              <StatsCard 
                icon={<Trophy size={24} />} 
                title="Total XP" 
                value={profileData ? profileData.overallXP : 0} 
                color="success" 
              />
            </Col>
            <Col md={6} lg={12}>
              <StatsCard 
                icon={<Award size={24} />} 
                title="Badges Earned" 
                value={badges ? Object.values(badges).filter(badge => badge.icon).length : 0} 
                color="warning" 
              />
            </Col>
            <Col md={6} lg={12}>
              <StatsCard 
                icon={<Brain size={24} />} 
                title="Quizzes Completed" 
                value={quizProgressData ? quizProgressData.reduce((acc, topic) => acc + topic.completed, 0) : 0} 
                color="primary" 
              />
            </Col>
            <Col md={6} lg={12}>
              <StatsCard 
                icon={<Mail size={24} />} 
                title="Emails Screened" 
                value={emailStats.total} 
                color="info" 
              />
            </Col>
          </Row>

          {/* Badges Section */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-warning text-dark">
              <Card.Title className="mb-0 d-flex align-items-center">
                <Award className="me-2" />
                Badges Earned
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Row>
                {badges && Object.keys(badges).length > 0 ? (
                  Object.entries(badges).map(([key, badge]) =>
                    badge.icon ? (
                      <Col key={key} xs={6} md={4} lg={6} className="text-center mb-3">
                        <div className="badge-container">
                          <Image
                            src={badge.icon}
                            alt={badge.name || "Badge"}
                            fluid
                            className="mb-2"
                            style={{ maxHeight: "100px" }}
                          />
                          <p className="small">{badge.name || "Unnamed Badge"}</p>
                        </div>
                      </Col>
                    ) : null
                  )
                ) : (
                  <Col>
                    <p className="text-muted">
                      Complete scam spotter exercises and quizzes to earn badges!
                    </p>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* XP Progress Chart */}
      {/* <Row>
        <Col>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-success text-white">
              <Card.Title className="mb-0 d-flex align-items-center">
                <Trophy className="me-2" />
                XP Progress
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={xpData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="xp" stroke="#28a745" strokeWidth={2} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row> */}

      {/* Email Stats */}
      <Row>
        <Col>
          <EmailStatsChart emailData={emailData} />
        </Col>
      </Row>         


    </Container>
  );
};

export default Dashboard;