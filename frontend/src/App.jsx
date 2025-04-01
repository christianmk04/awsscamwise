import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// IMPORT NAVBAR AND FOOTER
import NavBar2 from './components/NavBar2';
import Footer from './components/Footer';

// USER MANAGEMENT PAGES
import LoginPage from './pages/LoginPage/LoginPage';
import RegistrationPage from './pages/RegistrationPage/RegistrationPage';
import RegistrationSuccess from './pages/RegistrationSuccess/RegistrationSuccess';
import VerificationSuccess from './pages/VerificationSuccess/VerificationSuccess';
import ForgotPassword from './pages/ForgotPasswordEmail/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import FirstTimeDetails from './pages/FirstTimeDetails/FirstTimeDetails';

// HOMEPAGE
import HomePage from './pages/HomePage/HomePage';

// ABOUT PAGE
import About from './pages/About/About';

// SCAM SPOTTER PAGES
import ScamSpotterLanding from './pages/ScamSpotter/ScamSpotterLanding';
import SSDailyPractice from './pages/ScamSpotter/SSDailyPractice';
import SSCustomPractice from './pages/ScamSpotter/SSCustomPractice';
import CreateCustomScam from './pages/ScamSpotter/CreateCustomScam';
import SSGuide from './pages/ScamSpotter/SSGuide'

// QUIZ MASTER PAGES
import QuizMasterLanding from './pages/QuizMaster/QuizMasterLanding';
import QMDailyPractice from './pages/QuizMaster/QMDailyPractice';
import QuizPage from './pages/QuizMaster/QuizPage';
import QMCustomPractice from './pages/QuizMaster/QMCustomPractice';
import CreateCustomQuiz from './pages/QuizMaster/CreateCustomQuiz';
import EditCustomQuiz from './pages/QuizMaster/EditCustomQuiz';
import QMCommunityQuizzes from './pages/QuizMaster/QMCommunityQuizzes';
import PrevQuizzes from './pages/QuizMaster/PrevQuizzes';
import QuizSummary from './pages/QuizMaster/QuizSummary';

// ANALYTICS DASHBOARD PAGES
import Dashboard from './pages/Dashboard/Dashboard';

// DAILY DIGEST PAGES
import DailyDigest from './pages/DailyDigest/DailyDigest';

// PROFILE PAGES
import ProfilePageMain from './pages/ProfilePages/ProfilePageMain';
import UserSettings from './pages/SettingsPage/UserSettings';

// ADMIN PAGES
import RequestManagement from './pages/AdminManagement/RequestManagement';

// PROTECTED ROUTE
import ProtectedRoute from './components/ProtectedRoute';
import ProtectionPage from './components/ProtectionPage';

// Layout Component
const Layout = ({ children }) => {
  const location = useLocation();
  const userId = localStorage.getItem('userId'); // Check if the user is logged in

  // Paths for user management routes
  const userManagementPaths = [
    '/registration',
    '/registration-success',
    '/verify-email',
    '/login',
    '/forgot-password',
    '/reset-password',
    '/first-time-details',
    '/login-required',
  ];

  // Check if the current path is in user management routes
  const isUserManagementRoute = userManagementPaths.includes(location.pathname);

  return (
    <>
      {/* Render NavBar2 only if not a user management route */}
      {userId && !isUserManagementRoute && <NavBar2 />}

      {/* Main content */}
      <div className="content-wrapper">
        {children}
      </div>

      {/* Render Footer only if not a user management route */}

      {userId && !isUserManagementRoute && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* USER MANAGEMENT ROUTES */}
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/verify-email" element={<VerificationSuccess />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/first-time-details" element={<FirstTimeDetails />} />

          {/* Protected Routes */}
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Routes>  
                  {/* HOMEPAGE */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/home" element={<HomePage />} />

                  {/* ABOUT PAGE */}
                  <Route path="/about" element={<About />} />

                  {/* SCAM SPOTTER PAGES */}
                  <Route path="/scam-spotter" element={<ScamSpotterLanding />} />
                  <Route path="/scam-spotter/daily-practice" element={<SSDailyPractice />} />
                  <Route path="/scam-spotter/custom-practice" element={<SSCustomPractice />} />
                  <Route path="/scam-spotter/scam-creation" element={<CreateCustomScam />} />
                  <Route path="/scam-spotter/ss-guide" element={<SSGuide/>}/>

                  {/* QUIZ MASTER PAGES */}
                  <Route path="/quiz-master" element={<QuizMasterLanding />} />
                  <Route path="/quiz-master/daily-practice" element={<QMDailyPractice />} />
                  <Route path="/quiz-master/quiz-page" element={<QuizPage />} />
                  <Route path="/quiz-master/custom-practice" element={<QMCustomPractice />} />
                  <Route path="/quiz-master/community-quizzes" element={<QMCommunityQuizzes />} />
                  <Route path="/quiz-master/quiz-creation" element={<CreateCustomQuiz />} />
                  <Route path="/quiz-master/edit-quiz" element={<EditCustomQuiz />} />
                  <Route path="/quiz-master/prev-quizzes" element={<PrevQuizzes />} />
                  <Route path="/quiz-master/quiz-summary" element={<QuizSummary />} />


                  {/* DAILY DIGEST PAGES */}
                  <Route path="/daily-digest" element={<DailyDigest />} />

                  {/* ANALYTICS DASHBOARD PAGES */}
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* PROFILE PAGES */}
                  <Route path="/profile" element={<ProfilePageMain />} />
                  <Route path="/profile/settings" element={<UserSettings />} />

                  {/* ADMIN PAGES */}
                  <Route path="/admin/requests" element={<RequestManagement />} />
                
                </Routes> 
              </ProtectedRoute>
            }

          />

          {/* Login Reminder Route */}
          <Route path="/login-required" element={<ProtectionPage />} />

          
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
