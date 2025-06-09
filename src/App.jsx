import { createContext, useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import "./App.css";
import Navbar from "./components/Navbar";
import RoleManagement from "./components/RoleManagement";
import Analytics from "./pages/Analytics";
import BundleRegistration from "./pages/BundleRegistration";
import Dashboard from "./pages/Dashboard";
import DefectTrack from "./pages/DefectTrack.jsx";
import Details from "./pages/Details";
import DownloadData from "./pages/DownloadData";
import EmpData from "./pages/EmpData.jsx";
import Home from "./pages/Home";
import Inspection from "./pages/Inspection";
import IroningPage from "./pages/Ironing";
import LiveDashboard from "./pages/LiveDashboard";
import Logs from "./pages/Logs";
import OPAPage from "./pages/OPA";
import PackingPage from "./pages/Packing";
import PowerBI from "./pages/PowerBI.jsx";
import QC2InspectionPage from "./pages/QC2Inspection";
import QCSunriseReport from "./pages/QCSunriseReport.jsx";
import Return from "./pages/Return";
import RovingPage from "./pages/Roving";
import SCCPage from "./pages/SCC.jsx";
import Setting from "./pages/Setting";
import SystemAdmin from "./pages/SystemAdmin.jsx";
import WashingPage from "./pages/Washing";
import QAInspectionEvaluation from "./pages/QAInspectionEvaluation.jsx";

//Languages
import "../src/lang/i18n";

// Authentication components
import UserList from "./components/users/userList";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Login from "./pages/Auth/Login";
import Profile from "./pages/Auth/Profile";
import Register from "./pages/Auth/Register";

// Context
import { AuthProvider } from "./components/authentication/AuthContext.jsx";
import { BluetoothProvider } from "./components/context/BluetoothContext.jsx";
import { FormDataProvider } from "./components/context/FormDataContext";
import CuttingPage from "./pages/Cutting.jsx";
import QAAudit from "./pages/QAAudit.jsx";

export const BluetoothContext = createContext(null);

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!(
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  });
  const [detailsSubmitted, setDetailsSubmitted] = useState(false);
  const [sharedState, setSharedState] = useState({
    cumulativeChecked: 0,
    cumulativeDefects: 0,
    cumulativeGoodOutput: 0,
    cumulativeDefectPieces: 0,
    returnDefectList: [],
    returnDefectArray: [],
    returnDefectQty: 0,
    cumulativeReturnDefectQty: 0,
    defectArray: [],
  });
  const [inspectionState, setInspectionState] = useState(null);
  const [returnState, setReturnState] = useState(null);
  const [logsState, setLogsState] = useState({
    details: null,
    logs: [],
    startTime: null,
    lastActionTime: null,
  });
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inspectionStartTime, setInspectionStartTime] = useState(null);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleUpdateSharedState = (newState) => {
    setSharedState((prev) => ({
      ...prev,
      ...newState,
    }));
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    setIsAuthenticated(false);
    resetAllStates();
  };

  const resetAllStates = () => {
    setInspectionState(null);
    setReturnState(null);
    setSharedState({
      cumulativeChecked: 0,
      cumulativeDefects: 0,
      cumulativeGoodOutput: 0,
      cumulativeDefectPieces: 0,
      returnDefectList: [],
      returnDefectArray: [],
      returnDefectQty: 0,
      cumulativeReturnDefectQty: 0,
      defectArray: [],
    });
    setLogsState({
      details: null,
      logs: [],
      startTime: null,
      lastActionTime: null,
    });
    setDetailsSubmitted(false);
    setTimer(0);
    setIsPlaying(false);
    setInspectionStartTime(null);
  };

  const handleDetailsSubmit = (details) => {
    const initialState = {
      inspectionData: details,
      defects: {},
      currentDefectCount: {},
      checkedQuantity: 0,
      goodOutput: 0,
      defectPieces: 0,
      language: "english",
      view: "list",
      hasDefectSelected: false,
    };

    setInspectionState(initialState);
    setReturnState({
      ...initialState,
      returnDefects: {},
      returnDefectQty: 0,
    });
    setLogsState((prev) => ({
      ...prev,
      details,
    }));
    setDetailsSubmitted(true);
  };

  const handleLogEntry = (entry) => {
    const currentTime = new Date().getTime();
    let inspectionTime;

    if (logsState.logs.length === 0) {
      inspectionTime = (currentTime - inspectionStartTime.getTime()) / 60000;
    } else {
      inspectionTime = (currentTime - logsState.lastActionTime) / 60000;
    }

    const newEntry = {
      ...entry,
      inspectionTime: inspectionTime.toFixed(2),
    };

    setLogsState((prev) => ({
      ...prev,
      logs: [...prev.logs, newEntry],
      lastActionTime: currentTime,
    }));
  };

  const handlePlayPause = () => {
    const currentTime = new Date();
    setIsPlaying(!isPlaying);

    if (!inspectionStartTime) {
      setInspectionStartTime(currentTime);
      setLogsState((prev) => ({
        ...prev,
        startTime: currentTime.getTime(),
      }));
    }
  };

  const handleSubmit = () => {
    resetAllStates();
  };

  const handleInspectionStateChange = (newState) => {
    setInspectionState((prev) => ({
      ...prev,
      ...newState,
    }));
  };

  const handleReturnStateChange = (newState) => {
    setReturnState((prev) => ({
      ...prev,
      ...newState,
    }));
    if (newState.goodOutput !== inspectionState?.goodOutput) {
      setInspectionState((prev) => ({
        ...prev,
        goodOutput: newState.goodOutput,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar onLogout={handleLogout} />}
      <div className={isAuthenticated ? "pt-16" : ""}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/home" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
          {isAuthenticated ? (
            <>
              <Route path="/home" element={<Home />} />
              <Route
                path="/details"
                element={
                  <Details
                    onDetailsSubmit={handleDetailsSubmit}
                    isSubmitted={detailsSubmitted}
                    savedDetails={logsState.details}
                  />
                }
              />
              <Route
                path="/inspection"
                element={
                  detailsSubmitted ? (
                    <Inspection
                      savedState={inspectionState}
                      onStateChange={handleInspectionStateChange}
                      onLogEntry={handleLogEntry}
                      onStartTime={(time) =>
                        setLogsState((prev) => ({
                          ...prev,
                          startTime: time,
                          lastActionTime: time,
                        }))
                      }
                      onSubmit={handleSubmit}
                      timer={timer}
                      isPlaying={isPlaying}
                      onPlayPause={handlePlayPause}
                      sharedState={sharedState}
                      onUpdateSharedState={handleUpdateSharedState}
                    />
                  ) : (
                    <Navigate to="/details" replace />
                  )
                }
              />
              <Route
                path="/return"
                element={
                  detailsSubmitted ? (
                    <Return
                      savedState={returnState}
                      onStateChange={handleReturnStateChange}
                      onLogEntry={handleLogEntry}
                      timer={timer}
                      isPlaying={isPlaying}
                      sharedState={sharedState}
                      onUpdateSharedState={handleUpdateSharedState}
                    />
                  ) : (
                    <Navigate to="/details" replace />
                  )
                }
              />
              <Route
                path="/logs"
                element={
                  detailsSubmitted ? (
                    <Logs logsState={logsState} />
                  ) : (
                    <Navigate to="/details" replace />
                  )
                }
              />
              <Route path="/user-list" element={<UserList />} />
              <Route path="/role-management" element={<RoleManagement />} />
              <Route path="/settings" element={<Setting />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/analytics"
                element={
                  detailsSubmitted ? (
                    <Analytics
                      savedState={inspectionState}
                      defects={inspectionState?.defects || {}}
                      checkedQuantity={inspectionState?.checkedQuantity || 0}
                      logsState={logsState}
                      timer={timer}
                    />
                  ) : (
                    <Navigate to="/details" replace />
                  )
                }
              />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/live-dashboard" element={<LiveDashboard />} />
              <Route path="/qc1-sunrise" element={<QCSunriseReport />} />
              <Route path="/powerbi" element={<PowerBI />} />
              <Route path="/qc2-repair-tracking" element={<DefectTrack />} />
              <Route
                path="/bundle-registration"
                element={<BundleRegistration />}
              />
              <Route path="/ironing" element={<IroningPage />} />
              <Route path="/washing" element={<WashingPage />} />
              <Route path="/roving" element={<RovingPage />} />
              <Route path="/cutting" element={<CuttingPage />} />
              <Route path="/scc" element={<SCCPage />} />
              <Route path="/sysadmin" element={<SystemAdmin />} />
              <Route path="/audit" element={<QAAudit />} />
              <Route path="/qa-pivot" element={<QAInspectionEvaluation />} />
              <Route path="/inline-emp" element={<EmpData />} />
              <Route path="/opa" element={<OPAPage />} />
              <Route path="/packing" element={<PackingPage />} />
              <Route path="/qc2-inspection" element={<QC2InspectionPage />} />
              <Route path="/download-data" element={<DownloadData />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" replace />} />
          )}
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <FormDataProvider>
          <BluetoothProvider>
            <AppContent />
          </BluetoothProvider>
        </FormDataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
