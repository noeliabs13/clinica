import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { db, logOut, getCachedAccessToken } from "../lib/firebase";
import { Appointment, ClinicNotification } from "../types";
import { 
  Calendar, 
  Clock, 
  Heart, 
  Droplet, 
  Activity, 
  LogOut, 
  User, 
  Plus, 
  CalendarDays, 
  History, 
  Bell, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Loader2,
  CalendarCheck
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

interface DashboardPatientProps {
  user: any;
  onLogout: () => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
}

export default function DashboardPatient({ user, onLogout, darkMode, setDarkMode }: DashboardPatientProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "schedule" | "history">("dashboard");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingAppointment, setSavingAppointment] = useState(false);
  const [vitalsHeartRate, setVitalsHeartRate] = useState<number>(72);
  const [vitalsGlucose, setVitalsGlucose] = useState<number>(94);
  const [heartHistory, setHeartHistory] = useState([
    { name: "08:00", lpm: 68 },
    { name: "10:00", lpm: 75 },
    { name: "12:00", lpm: 72 },
    { name: "14:00", lpm: 80 },
    { name: "16:00", lpm: 71 },
    { name: "18:00", lpm: 73 },
  ]);

  // Appointment Form fields
  const [formDoctor, setFormDoctor] = useState("Dr. Alejandro Torres");
  const [formSpecialty, setFormSpecialty] = useState("Cardiología");
  const [formDate, setFormDate] = useState("2026-07-28");
  const [formTime, setFormTime] = useState("10:30");
  const [formNotes, setFormNotes] = useState("");
  
  // Notification States
  const [notifications, setNotifications] = useState<ClinicNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [gcalSyncing, setGcalSyncing] = useState(false);
  const [gcalStatus, setGcalStatus] = useState<"connected" | "not_connected" | "sync_done" | null>(null);

  useEffect(() => {
    fetchAppointments();
    loadSampleNotifications();
    checkGoogleCalendarStatus();
  }, []);

  const checkGoogleCalendarStatus = () => {
    const token = getCachedAccessToken();
    if (token) {
      setGcalStatus("connected");
    } else {
      setGcalStatus("not_connected");
    }
  };

  const loadSampleNotifications = () => {
    setNotifications([
      {
        id: "not-1",
        title: "Recordatorio de Cita",
        message: "Tiene una cita programada de Cardiología Preventiva con el Dr. Alejandro Torres el 28 de Julio.",
        timestamp: Date.now() - 3600000,
        read: false,
        userId: user.uid
      },
      {
        id: "not-2",
        title: "Tratamiento Activo",
        message: "Recuerde tomar su medicamento Amoxicilina 500mg (próxima dosis sugerida: 18:00h).",
        timestamp: Date.now() - 7200000,
        read: true,
        userId: user.uid
      }
    ]);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "appointments"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const list: Appointment[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Appointment);
      });
      // Sort list by date and time
      list.sort((a, b) => {
        const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
        const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
        return dateTimeA - dateTimeB;
      });
      setAppointments(list);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Google Calendar Sync Event Addition
  const syncToGoogleCalendar = async (appointment: Appointment) => {
    const token = getCachedAccessToken();
    if (!token) {
      console.warn("Google Calendar access token is not available in memory.");
      return null;
    }

    setGcalSyncing(true);
    try {
      // Calculate start and end ISO time
      const startDateTime = `${appointment.date}T${appointment.time}:00`;
      
      // End time is 30 mins later
      const [hours, minutes] = appointment.time.split(":").map(Number);
      let endMinutes = minutes + 30;
      let endHours = hours;
      if (endMinutes >= 60) {
        endMinutes -= 60;
        endHours += 1;
      }
      const formattedEndHours = String(endHours).padStart(2, "0");
      const formattedEndMinutes = String(endMinutes).padStart(2, "0");
      const endDateTime = `${appointment.date}T${formattedEndHours}:${formattedEndMinutes}:00`;

      const eventBody = {
        summary: `Cita Clínica Premium - ${appointment.specialty}`,
        description: `Consulta médica privada con el especialista ${appointment.doctorName}.\nNotas: ${appointment.notes || "Consulta general."}`,
        start: {
          dateTime: startDateTime,
          timeZone: "Europe/Madrid"
        },
        end: {
          dateTime: endDateTime,
          timeZone: "Europe/Madrid"
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 30 },
            { method: "email", minutes: 1440 }
          ]
        }
      };

      const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(eventBody)
      });

      if (!response.ok) {
        throw new Error("Google Calendar API returned an error");
      }

      const gcalEventData = await response.json();
      setGcalStatus("sync_done");
      // Add notification
      const newNotif: ClinicNotification = {
        id: `not-gcal-${Date.now()}`,
        title: "Sincronizado con Google Calendar",
        message: `La cita de ${appointment.specialty} con ${appointment.doctorName} se ha agendado en su calendario automáticamente.`,
        timestamp: Date.now(),
        read: false,
        userId: user.uid
      };
      setNotifications(prev => [newNotif, ...prev]);
      return gcalEventData.id;
    } catch (error) {
      console.error("Failed to sync to Google Calendar:", error);
      return null;
    } finally {
      setGcalSyncing(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAppointment(true);

    const newAppointmentData = {
      patientName: user.displayName || "Paciente Premium",
      patientEmail: user.email,
      date: formDate,
      time: formTime,
      doctorName: formDoctor,
      specialty: formSpecialty,
      status: "Próxima" as const,
      notes: formNotes,
      userId: user.uid,
      createdAt: Date.now()
    };

    try {
      // Save appointment in Firestore
      const docRef = await addDoc(collection(db, "appointments"), newAppointmentData);
      const appointmentWithId = { id: docRef.id, ...newAppointmentData } as Appointment;

      // Realize automated Google Calendar Sync if authorized
      const calendarEventId = await syncToGoogleCalendar(appointmentWithId);
      if (calendarEventId) {
        await updateDoc(doc(db, "appointments", docRef.id), { calendarEventId });
      }

      // Add push-like local notification
      const successNotif: ClinicNotification = {
        id: `not-appt-${Date.now()}`,
        title: "Nueva Cita Registrada",
        message: `Su cita de ${formSpecialty} ha sido agendada con éxito para el ${formDate} a las ${formTime}.`,
        timestamp: Date.now(),
        read: false,
        userId: user.uid
      };
      setNotifications(prev => [successNotif, ...prev]);

      // Reset form
      setFormNotes("");
      fetchAppointments();
      setActiveTab("dashboard");
    } catch (err) {
      console.error("Error creating appointment:", err);
    } finally {
      setSavingAppointment(false);
    }
  };

  const handleDeleteAppointment = async (id: string, calendarEventId?: string) => {
    const confirmed = window.confirm("¿Está seguro de que desea cancelar esta cita médica? Esta acción no se puede deshacer.");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "appointments", id));
      
      // If synced to Google Calendar, delete from Google Calendar
      const token = getCachedAccessToken();
      if (calendarEventId && token) {
        try {
          await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${calendarEventId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
        } catch (gcalErr) {
          console.error("Error canceling Google Calendar event:", gcalErr);
        }
      }

      // Notification
      const cancelNotif: ClinicNotification = {
        id: `not-cancel-${Date.now()}`,
        title: "Cita Cancelada",
        message: "Su cita médica ha sido cancelada satisfactoriamente.",
        timestamp: Date.now(),
        read: false,
        userId: user.uid
      };
      setNotifications(prev => [cancelNotif, ...prev]);

      fetchAppointments();
    } catch (err) {
      console.error("Error deleting appointment:", err);
    }
  };

  const handleDoctorChange = (docName: string) => {
    setFormDoctor(docName);
    if (docName === "Dra. Elena Valdés") setFormSpecialty("Cardiología");
    else if (docName === "Dr. Julian Marcos") setFormSpecialty("Neurocirugía");
    else if (docName === "Dra. Sofía Rivas") setFormSpecialty("Dermatología");
    else setFormSpecialty("Consulta General");
  };

  const handleLogVitalHeartRate = () => {
    const hr = prompt("Ingrese su frecuencia cardíaca actual (lpm):", vitalsHeartRate.toString());
    if (hr) {
      const num = parseInt(hr);
      if (!isNaN(num) && num > 30 && num < 220) {
        setVitalsHeartRate(num);
        setHeartHistory(prev => [
          ...prev.slice(1),
          { name: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), lpm: num }
        ]);
        const vitalsNotif: ClinicNotification = {
          id: `not-vital-${Date.now()}`,
          title: "Frecuencia Cardíaca Registrada",
          message: `Frecuencia registrada con éxito: ${num} lpm.`,
          timestamp: Date.now(),
          read: false,
          userId: user.uid
        };
        setNotifications(prev => [vitalsNotif, ...prev]);
      }
    }
  };

  const handleLogVitalGlucose = () => {
    const gl = prompt("Ingrese su nivel de glucosa en sangre (mg/dL):", vitalsGlucose.toString());
    if (gl) {
      const num = parseInt(gl);
      if (!isNaN(num) && num > 10 && num < 600) {
        setVitalsGlucose(num);
        const glNotif: ClinicNotification = {
          id: `not-vital-gl-${Date.now()}`,
          title: "Nivel de Glucosa Registrado",
          message: `Nivel de glucosa registrado con éxito: ${num} mg/dL.`,
          timestamp: Date.now(),
          read: false,
          userId: user.uid
        };
        setNotifications(prev => [glNotif, ...prev]);
      }
    }
  };

  // Find next upcoming appointment
  const nextAppointment = appointments.find(appt => {
    const apptDate = new Date(`${appt.date}T${appt.time}`);
    return apptDate.getTime() > Date.now();
  }) || appointments[0];

  const toggleNotifications = () => setShowNotifications(!showNotifications);

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Step counts for clinical activity tracker
  const stepsData = [
    { name: "Lunes", pasos: 8400 },
    { name: "Martes", pasos: 5200 },
    { name: "Miércoles", pasos: 10100 },
    { name: "Jueves", pasos: 7300 },
    { name: "Viernes", pasos: 9000 },
    { name: "Sábado", pasos: 11200 },
    { name: "Domingo", pasos: 3500 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col py-6 px-4 shrink-0">
        
        {/* Profile header */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-lg border border-emerald-200 dark:border-emerald-800">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : "P"}
          </div>
          <div className="truncate">
            <h4 className="font-display font-bold text-sm text-slate-950 dark:text-white truncate">
              {user.displayName || "Paciente Premium"}
            </h4>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Paciente
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 space-y-1.5">
          <button
            id="tab-patient-dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all ${
              activeTab === "dashboard"
                ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md"
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4" /> Resumen General
          </button>
          
          <button
            id="tab-patient-schedule"
            onClick={() => setActiveTab("schedule")}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all ${
              activeTab === "schedule"
                ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md"
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Calendar className="w-4 h-4" /> Agendar Nueva Cita
          </button>
          
          <button
            id="tab-patient-history"
            onClick={() => setActiveTab("history")}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-semibold tracking-tight transition-all ${
              activeTab === "history"
                ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md"
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <History className="w-4 h-4" /> Mis Citas & Historial
          </button>
        </nav>

        {/* Google Calendar Sync Indicator */}
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <CalendarCheck className="w-4 h-4 text-emerald-600" /> Google Calendar
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {gcalStatus === "connected" || gcalStatus === "sync_done"
                ? "Sincronización automatizada activada."
                : "Autentíquese vía Google para autoprogramar."
              }
            </p>
          </div>

          <button
            id="btn-patient-logout"
            onClick={onLogout}
            className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* Top Header Controls */}
        <header className="flex justify-between items-center mb-8 relative">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hola, {user.displayName ? user.displayName.split(" ")[0] : "Paciente"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Hoy es {new Date().toLocaleDateString("es-ES", { weekday: 'long', day: 'numeric', month: 'long' })}. Su salud evoluciona de manera óptima.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {setDarkMode && (
              <button
                id="btn-patient-theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
                title="Alternar modo oscuro"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>
            )}

            {/* Notifications Center Toggle */}
            <div className="relative">
              <button
                id="btn-toggle-notifications"
                onClick={toggleNotifications}
                className="p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm relative transition-all"
              >
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white animate-bounce">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div 
                id="notification-panel-dropdown"
                className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-30 animate-in fade-in"
              >
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Notificaciones Recientes</span>
                  <button 
                    onClick={markAllNotificationsAsRead}
                    className="text-[10px] font-semibold text-emerald-600 hover:underline"
                  >
                    Marcar leídas
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">Sin notificaciones de recordatorio.</div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors ${!n.read ? "bg-emerald-500/[0.02]" : ""}`}>
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h5 className={`font-bold text-xs ${!n.read ? "text-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                            {n.title}
                          </h5>
                          {!n.read && <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1"></span>}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{n.message}</p>
                        <span className="block text-[9px] text-slate-400 mt-2">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          </div>
        </header>

        {/* Tab Content Staging */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* Upper Grid: Next Appointment vs Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Highlighted Next Appointment Widget (Large) */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
                
                <div className="absolute top-0 right-0 p-8 opacity-5 text-slate-500">
                  <CalendarDays className="w-48 h-48" />
                </div>

                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold rounded-full mb-4 uppercase tracking-widest">
                    Próxima Cita Programada
                  </span>

                  {nextAppointment ? (
                    <div>
                      <h3 className="text-2xl font-display font-bold text-slate-950 dark:text-white mb-1">
                        {nextAppointment.specialty}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Especialista: {nextAppointment.doctorName}
                      </p>
                      {nextAppointment.notes && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl max-w-xl">
                          &ldquo;{nextAppointment.notes}&rdquo;
                        </p>
                      )}

                      {/* Date & Time pills */}
                      <div className="mt-8 flex flex-wrap gap-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Fecha</span>
                            <p className="text-base font-bold text-slate-950 dark:text-white">
                              {new Date(nextAppointment.date).toLocaleDateString("es-ES", { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                            <Clock className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Hora</span>
                            <p className="text-base font-bold text-slate-950 dark:text-white">
                              {nextAppointment.time} h
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8">
                      <p className="text-slate-500 dark:text-slate-400 text-sm italic">No tiene citas programadas actualmente.</p>
                      <button
                        onClick={() => setActiveTab("schedule")}
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
                      >
                        Agendar Primera Cita
                      </button>
                    </div>
                  )}
                </div>

                {nextAppointment && (
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3 relative z-10">
                    <button
                      id="btn-cancel-next-appt"
                      onClick={() => handleDeleteAppointment(nextAppointment.id, nextAppointment.calendarEventId)}
                      className="border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 font-semibold text-xs px-5 py-2.5 rounded-xl transition-all"
                    >
                      Cancelar Cita
                    </button>
                  </div>
                )}
              </div>

              {/* Side Widget: Interactive Health Log Vitals */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Heart Rate widget */}
                <div 
                  onClick={handleLogVitalHeartRate}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all group"
                  title="Pulse para registrar nueva frecuencia"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Ritmo Cardíaco</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Registrar</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-display font-extrabold text-slate-950 dark:text-white">
                      {vitalsHeartRate}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">lpm</span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Normal en reposo (Último registro)</p>
                </div>

                {/* Glucose widget */}
                <div 
                  onClick={handleLogVitalGlucose}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all group"
                  title="Pulse para registrar nuevo nivel de glucosa"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Droplet className="w-5 h-5 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Glucosa Basal</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Registrar</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-display font-extrabold text-slate-950 dark:text-white">
                      {vitalsGlucose}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">mg/dL</span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">Nivel óptimo en ayunas</p>
                </div>

                {/* Medicine reminder */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-l-4 border-emerald-500 dark:border-emerald-600 shadow-sm">
                  <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5 block">
                    Tratamiento Activo
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Amoxicilina 500mg</h4>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Próxima toma sugerida: 18:00h</span>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="w-2 h-2 rounded-full bg-emerald-100 dark:bg-emerald-950 shrink-0" />
                      <span className="w-2 h-2 rounded-full bg-emerald-100 dark:bg-emerald-950 shrink-0" />
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Middle Grid: Activity evolution chart & Vitals Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Daily Steps Bar Chart */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="font-display font-bold text-slate-950 dark:text-white text-base">Evolución de Actividad</h4>
                    <span className="text-slate-400 text-xs">Pasos diarios - Últimos 7 días</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                    <TrendingUp className="w-3.5 h-3.5" /> +15.4% de meta
                  </div>
                </div>
                
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stepsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#0f172a", 
                          border: "none", 
                          borderRadius: "12px", 
                          color: "#fff" 
                        }} 
                      />
                      <Bar dataKey="pasos" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Heart rate real-time tracker */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h4 className="font-display font-bold text-slate-950 dark:text-white text-base">Tendencia Cardíaca Reciente</h4>
                  <span className="text-slate-400 text-xs">Lecturas del día (lpm)</span>
                </div>

                <div className="h-56 mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={heartHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[50, 110]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "#0f172a", 
                          border: "none", 
                          borderRadius: "12px", 
                          color: "#fff" 
                        }} 
                      />
                      <Line type="monotone" dataKey="lpm" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Schedule tab content */}
        {activeTab === "schedule" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm max-w-3xl">
            <h3 className="text-xl font-display font-bold text-slate-950 dark:text-white mb-2">Agendar Nueva Cita Médica</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-8">
              Complete los campos a continuación para registrar su consulta. Al confirmar, su cita se sincronizará automáticamente con Google Calendar (si inició sesión con Google).
            </p>

            <form onSubmit={handleCreateAppointment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    Especialista Médico
                  </label>
                  <select
                    value={formDoctor}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
                  >
                    <option value="Dra. Elena Valdés">Dra. Elena Valdés (Cardiología)</option>
                    <option value="Dr. Julian Marcos">Dr. Julian Marcos (Neurocirugía)</option>
                    <option value="Dra. Sofía Rivas">Dra. Sofía Rivas (Dermatología)</option>
                    <option value="Dr. Alejandro Torres">Dr. Alejandro Torres (Medicina General)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    Unidad Especializada
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formSpecialty}
                    className="w-full text-sm bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    Fecha de la Cita
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                    Hora (Franja Disponible)
                  </label>
                  <select
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="09:30">09:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="12:30">12:30 PM</option>
                    <option value="15:00">15:00 PM</option>
                    <option value="16:00">16:00 PM</option>
                    <option value="17:00">17:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                  Motivo de la consulta / Notas adicionales
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Por favor describa brevemente sus síntomas o motivo de su consulta preventiva..."
                  rows={4}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  id="btn-confirm-appt"
                  type="submit"
                  disabled={savingAppointment}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.01] transition-all flex items-center gap-2"
                >
                  {savingAppointment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Registrando...
                    </>
                  ) : (
                    "Confirmar y Agendar Cita"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className="border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs px-6 py-3.5 rounded-xl transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* History tab content */}
        {activeTab === "history" && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-slate-950 dark:text-white text-base">Su Expediente de Consultas</h3>
                <span className="text-xs text-slate-400">Listado histórico completo de citas agendadas</span>
              </div>
              <button
                onClick={() => setActiveTab("schedule")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Nueva Consulta
              </button>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  <p className="text-xs">Cargando expediente...</p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="p-16 text-center text-slate-400 text-xs">
                  Aún no cuenta con registros en su historial. ¡Agende su primera cita!
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="px-6 py-3">Médico / Especialidad</th>
                      <th className="px-6 py-3">Fecha programada</th>
                      <th className="px-6 py-3">Hora</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3">Notas</th>
                      <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-bold text-slate-950 dark:text-white block">{appt.doctorName}</span>
                            <span className="text-[10px] text-slate-400">{appt.specialty}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                          {appt.date}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">
                          {appt.time} h
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            appt.status === "Completada"
                              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                              : appt.status === "Urgente"
                              ? "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
                              : appt.status === "En espera"
                              ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                              : "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate text-slate-500 dark:text-slate-400 italic">
                          {appt.notes || "Sin especificaciones."}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteAppointment(appt.id, appt.calendarEventId)}
                            className="text-[10px] font-bold text-red-500 hover:underline"
                          >
                            Cancelar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
