import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, initAuth, logOut } from "./lib/firebase";
import LandingPage from "./components/LandingPage";
import AuthScreen from "./components/AuthScreen";
import DashboardPatient from "./components/DashboardPatient";
import DashboardAdmin from "./components/DashboardAdmin";
import GeminiChatbot from "./components/GeminiChatbot";
import { Loader2 } from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<"patient" | "doctor">("patient");
  const [currentScreen, setCurrentScreen] = useState<"landing" | "auth" | "dashboard">("landing");
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Monitor Dark Mode state and update document tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Auth observer initialization
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setCurrentUser(user);
        
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || "patient");
          } else {
            setUserRole("patient");
          }
        } catch (err) {
          console.error("Error reading role:", err);
          setUserRole("patient");
        }
        
        setCurrentScreen("dashboard");
        setAuthLoading(false);
      },
      () => {
        setCurrentUser(null);
        setCurrentScreen("landing");
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (user: any, role: "patient" | "doctor") => {
    setCurrentUser(user);
    setUserRole(role);
    setCurrentScreen("dashboard");
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      await logOut();
      setCurrentScreen("landing");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
        <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Clínica Premium • Cargando...</p>
      </div>
    );
  }

  return (
    <>
      {currentScreen === "landing" && (
        <LandingPage
          onNavigateToAuth={() => setCurrentScreen("auth")}
          onNavigateToDashboard={() => setCurrentScreen("dashboard")}
          isAuthenticated={!!currentUser}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      {currentScreen === "auth" && (
        <AuthScreen
          onBack={() => setCurrentScreen("landing")}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {currentScreen === "dashboard" && (
        userRole === "doctor" ? (
          <DashboardAdmin user={currentUser} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
        ) : (
          <DashboardPatient user={currentUser} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
        )
      )}

      {/* Persistent Virtual Clinical Chatbot */}
      <GeminiChatbot />
    </>
  );
}
