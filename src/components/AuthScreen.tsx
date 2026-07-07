import React, { useState } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleSignIn } from "../lib/firebase";
import { ShieldAlert, ArrowLeft, Loader2, Bot, Sparkles, LogIn, UserPlus } from "lucide-react";

interface AuthScreenProps {
  onBack: () => void;
  onAuthSuccess: (user: any, role: "patient" | "doctor") => void;
}

export default function AuthScreen({ onBack, onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Sign In
        const result = await signInWithEmailAndPassword(auth, email, password);
        
        // Fetch or create profile
        const userDoc = await getDoc(doc(db, "users", result.user.uid));
        let userRole = role;
        if (userDoc.exists()) {
          userRole = userDoc.data().role || "patient";
        } else {
          // Create document if doesn't exist
          await setDoc(doc(db, "users", result.user.uid), {
            uid: result.user.uid,
            name: result.user.displayName || "Paciente Premium",
            email: result.user.email,
            role: userRole,
            createdAt: Date.now()
          });
        }
        
        onAuthSuccess(result.user, userRole);
      } else {
        // Sign Up
        if (!fullName.trim()) {
          throw new Error("Por favor, introduzca su nombre completo.");
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: fullName });
        
        // Save user details to Firestore
        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          name: fullName,
          email: result.user.email,
          role: role,
          createdAt: Date.now()
        });

        onAuthSuccess(result.user, role);
      }
    } catch (err: any) {
      console.error("Email auth error:", err);
      let errMsg = "Ocurrió un error en la autenticación.";
      if (err.code === "auth/wrong-password") errMsg = "Contraseña incorrecta.";
      else if (err.code === "auth/user-not-found") errMsg = "Usuario no registrado.";
      else if (err.code === "auth/email-already-in-use") errMsg = "El correo ya está registrado.";
      else if (err.message) errMsg = err.message;
      
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        // Fetch or create profile
        const userDoc = await getDoc(doc(db, "users", result.user.uid));
        let userRole = role; // Default to chosen tab
        
        if (userDoc.exists()) {
          userRole = userDoc.data().role || "patient";
        } else {
          // If first time, we create the user with chosen role
          await setDoc(doc(db, "users", result.user.uid), {
            uid: result.user.uid,
            name: result.user.displayName || "Usuario Google",
            email: result.user.email,
            role: userRole,
            createdAt: Date.now()
          });
        }
        onAuthSuccess(result.user, userRole);
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError("Fallo al iniciar sesión con Google o denegó los permisos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-0"></div>

      {/* Back Button */}
      <button
        id="btn-auth-back"
        onClick={onBack}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a Inicio
      </button>

      <div className="w-full max-w-md z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/10 mb-4 font-extrabold text-2xl font-display">
            P
          </div>
          <h2 className="text-3xl font-display font-extrabold tracking-tight text-slate-950 dark:text-white">
            Clínica <span className="text-emerald-600">Premium</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Acceso unificado para pacientes y profesionales de la salud.
          </p>
        </div>

        {/* Card Frame */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl relative">
          
          {/* Tab Selector for ROLE */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl mb-8">
            <button
              id="tab-auth-patient"
              type="button"
              onClick={() => setRole("patient")}
              className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                role === "patient"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Portal Paciente
            </button>
            <button
              id="tab-auth-doctor"
              type="button"
              onClick={() => setRole("doctor")}
              className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                role === "doctor"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              Panel Médico (Admin)
            </button>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5 text-emerald-600" /> Iniciar Sesión como {role === "patient" ? "Paciente" : "Médico"}
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 text-emerald-600" /> Crear Cuenta como {role === "patient" ? "Paciente" : "Médico"}
                </>
              )}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {role === "doctor" && isLogin 
                ? "Inicie sesión con su usuario asignado de administración."
                : "Ingrese sus credenciales de acceso privadas."
              }
            </p>
          </div>

          {error && (
            <div className="flex gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-xl p-4 text-xs text-red-700 dark:text-red-400 mb-6">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Dr. Martínez o Sra. García"
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@clinicapremium.com o paciente@correo.com"
                className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
              />
            </div>

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLogin ? (
                "Acceder al Panel"
              ) : (
                "Crear mi Registro"
              )}
            </button>
          </form>

          {/* OR divider */}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">o continuar con</span>
            <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
          </div>

          {/* Official Google Sign-In Button */}
          <button
            id="btn-auth-google"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 py-3 rounded-xl transition-all shadow-sm bg-white dark:bg-slate-900"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            </svg>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Sign in with Google</span>
          </button>

          {/* Toggle Login/Signup */}
          <div className="text-center mt-6">
            <button
              id="btn-auth-toggle-mode"
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {isLogin 
                ? "¿No tiene una cuenta? Regístrese aquí" 
                : "¿Ya tiene una cuenta? Inicie sesión"
              }
            </button>
          </div>
        </div>

        {/* Info notice for Google Calendar */}
        <div className="text-center mt-6 flex justify-center items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <p className="text-[10px] text-slate-400 dark:text-slate-500 max-w-sm">
            La sincronización con Google Calendar se activa al autenticarse con su cuenta Google.
          </p>
        </div>
      </div>
    </div>
  );
}
