import React, { useState, useEffect } from "react";
import { storage, Trip, Partner } from "../lib/storage";
import { format, differenceInDays } from "date-fns";
import { generateTripPlan } from "../lib/gemini";
import { cn } from "../lib/utils";
import {
  MapPin,
  Calendar,
  Clock,
  Plane,
  Bed,
  Plus,
  Loader2,
  Sparkles,
  X,
  Check,
  ChevronLeft,
  Trash2,
  MoreHorizontal,
  Archive,
  ChevronRight,
  MessageCircle,
  Ticket,
  TrainFront,
  Share2,
  Navigation,
  Image as ImageIcon,
  CalendarPlus,
  Settings2,
  HeartHandshake,
  ExternalLink,
  Download,
  ArrowRight,
  Users,
  WifiOff,
  Leaf,
  Globe,
  Youtube,
  Home,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";

export function TripPage() {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const location = useLocation();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('intent') === 'ai-planner') {
      setShowAIModal(true);
      // Remove intent parameter to avoid re-opening on reload
      navigate('/app', { replace: true });
    }
  }, [location.search, navigate]);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [shareModalUrl, setShareModalUrl] = useState<string | null>(null);

  const [prefs, setPrefs] = useState(storage.getPrefs());

  // Add Activity State
  const [addingActivityDay, setAddingActivityDay] = useState<number | null>(
    null,
  );
  
  const [actType, setActType] = useState<"activity" | "flight" | "hotel">(
    "activity",
  );
  const [actTitle, setActTitle] = useState("");
  const [actTime, setActTime] = useState("");
  const [actLoc, setActLoc] = useState("");
  const [actConfNum, setActConfNum] = useState("");
  const [actFlightNum, setActFlightNum] = useState("");
  const [actDepTime, setActDepTime] = useState("");
  const [actArrTime, setActArrTime] = useState("");

  const { t, cycleLang, getLangLabel } = useI18n();

  // Trip Building State
  const [showAIModal, setShowAIModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiFlowStep, setAiFlowStep] = useState(1);
  const [aiDest, setAiDest] = useState("");
  const [aiDays, setAiDays] = useState("5");
  const [aiCompanions, setAiCompanions] = useState("Solo");
  const [aiBudget, setAiBudget] = useState("Moderate");
  const [aiInterests, setAiInterests] = useState<string[]>([]);
  const [aiAdditional, setAiAdditional] = useState("");
  const [aiNotFirstTime, setAiNotFirstTime] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [manualDests, setManualDests] = useState([
    { name: "", tours: "", activities: "", stay: "", flight: "" },
  ]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleAddDest = () =>
    setManualDests([...manualDests, { name: "", tours: "", activities: "", stay: "", flight: "" }]);

  const handleApplyTemplate = (template: string) => {
    if (template === 'Backpacking Adventure') {
      setManualDests([
        { name: "Hanoi", tours: "Old Quarter Walking Tour", activities: "Street food crawl, Bia Hoi", stay: "Old Quarter Hostel", flight: "Bus from Airport" },
        { name: "Sapa", tours: "2-Day Trekking", activities: "Homestay, Local markets", stay: "Village Homestay", flight: "Night Train from Hanoi" },
        { name: "Ha Giang", tours: "Motorbike Loop", activities: "Scenic viewpoints", stay: "Guest House", flight: "Sleeper Bus" }
      ]);
    } else if (template === 'Luxury City Break') {
      setManualDests([
        { name: "Ho Chi Minh City", tours: "Private Helicopter Tour", activities: "Rooftop bars, Fine dining, Spa", stay: "5-Star District 1 Hotel", flight: "Business Class to SGN" }
      ]);
    } else if (template === 'Family Beach Vacation') {
      setManualDests([
        { name: "Da Nang", tours: "Ba Na Hills (Sun World)", activities: "My Khe Beach day, Seafood dinner", stay: "Beachfront Resort", flight: "Direct to DAD" },
        { name: "Hoi An", tours: "Lantern Making Class", activities: "Night market, Basket boat ride", stay: "Boutique Villa", flight: "Private Transfer from Da Nang" }
      ]);
    }
  };

  const updateDest = (
    idx: number,
    field: "name" | "tours" | "activities" | "stay" | "flight",
    val: string,
  ) => {
    const newDests = [...manualDests];
    newDests[idx] = { ...newDests[idx], [field]: val };
    setManualDests(newDests);
  };
  const removeDest = (idx: number) => {
    if (manualDests.length > 1) {
      setManualDests(manualDests.filter((_, i) => i !== idx));
    }
  };

  const handleGenerateIdea = async (promptOverride?: string | any) => {
    const finalPrompt = typeof promptOverride === 'string' ? promptOverride : aiPrompt;
    if (!finalPrompt || !finalPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const generatedData = await generateTripPlan(finalPrompt);
      const newTrip: Trip = {
        ...generatedData,
        id: Date.now().toString(),
      };

      const existing = storage.getTrips();
      storage.saveTrips([newTrip, ...existing]);

      // Save to Vault
      const vaultFiles = storage.getVaultFiles();
      let markdownContent = `# Trip Plan: ${newTrip.destination}\n\n`;
      if (newTrip.notes) markdownContent += newTrip.notes + "\n\n";
      newTrip.itinerary.forEach((day, i) => {
        markdownContent += `## Day ${i + 1} - ${format(new Date(day.date), "MMMM d")}\n`;
        day.activities.forEach((act) => {
          markdownContent += `- **${act.time || "Anytime"}**: ${act.title} ${act.location ? `(@ ${act.location})` : ""}\n`;
        });
        markdownContent += `\n`;
      });

      vaultFiles.push({
        id: "trip_" + Date.now().toString(),
        name: `Trip to ${newTrip.destination}`,
        type: "text/markdown",
        uri: markdownContent,
        createdAt: new Date().toISOString(),
      });
      storage.saveVaultFiles(vaultFiles);

      setShowAIModal(false);
      setAiFlowStep(1);
      setAiDest("");
      setAiDays("5");
      setAiCompanions("Solo");
      setAiBudget("Moderate");
      setAiInterests([]);
      setAiAdditional("");
      setAiNotFirstTime(false);
      refreshTrip();
    } catch (e) {
      alert("Failed to generate trip. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualCreate = () => {
    const mainDest = manualDests
      .map((d) => d.name)
      .filter(Boolean)
      .join(" - ");
    if (!mainDest || !startDate || !endDate) return;

    const notes = manualDests
      .filter((d) => d.tours || d.activities || d.stay || d.flight)
      .map(
        (d) =>
          `${d.name}:\n` +
          (d.flight ? `Flight/Transport: ${d.flight}\n` : "") +
          (d.stay ? `Accommodation: ${d.stay}\n` : "") +
          (d.tours ? `Tours: ${d.tours}\n` : "") +
          (d.activities ? `Activities: ${d.activities}\n` : ""),
      )
      .join("\n\n");

    const newTrip: Trip = {
      id: Date.now().toString(),
      destination: mainDest,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      notes: notes,
      itinerary: [],
    };

    // Generate empty days based on start and end dates
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    const dayPlans = [];
    while (currentDate <= end) {
      dayPlans.push({
        date: currentDate.toISOString(),
        activities: [],
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    if (dayPlans.length > 0) {
      newTrip.itinerary = dayPlans;
    }

    const existing = storage.getTrips();
    storage.saveTrips([newTrip, ...existing]);

    // Save to Vault
    const vaultFiles = storage.getVaultFiles();
    let markdownContent = `# Trip Plan: ${newTrip.destination}\n\n`;
    if (newTrip.notes) markdownContent += newTrip.notes + "\n\n";
    newTrip.itinerary.forEach((day, i) => {
      markdownContent += `## Day ${i + 1} - ${format(new Date(day.date), "MMMM d")}\n`;
      day.activities.forEach((act) => {
        markdownContent += `- **${act.time || "Anytime"}**: ${act.title} ${act.location ? `(@ ${act.location})` : ""}\n`;
      });
      markdownContent += `\n`;
    });

    vaultFiles.push({
      id: "trip_" + Date.now().toString(),
      name: `Trip to ${newTrip.destination}`,
      type: "text/markdown",
      uri: markdownContent,
      createdAt: new Date().toISOString(),
    });
    storage.saveVaultFiles(vaultFiles);

    setShowManualModal(false);
    refreshTrip();
  };

  const refreshTrip = () => {
    const trips = storage.getTrips();
    if (trips && trips.length > 0) {
      setTrip(trips[0]);
    } else {
      setTrip(null);
    }
  };

  const handleDownloadOffline = () => {
    if (!trip) return;
    let md = `# Trip Itinerary: ${trip.destination}\n\n`;
    if (trip.notes) {
      md += `## Notes\n${trip.notes}\n\n`;
    }
    trip.itinerary.forEach((day, i) => {
      md += `## Day ${i + 1} - ${format(new Date(day.date), "MMMM d")}\n\n`;
      day.activities.forEach((act) => {
        md += `- **${act.time || "Anytime"}** [${act.type}]: ${act.title}`;
        if (act.location) md += ` (@ ${act.location})`;
        md += `\n`;
        if (act.confirmationNumber) md += `  - Confirmation: ${act.confirmationNumber}\n`;
        if (act.flightNumber) md += `  - Flight: ${act.flightNumber}\n`;
        if (act.departureTime) md += `  - Departs: ${act.departureTime}\n`;
        if (act.arrivalTime) md += `  - Arrives: ${act.arrivalTime}\n`;
      });
      md += `\n`;
    });
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${trip.destination.replace(/[\s\W]+/g, '_')}_Offline_Guide.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(t("Trip details downloaded successfully!", "Đã tải xuống thông tin chuyến đi thành công!", "Detaliile călătoriei au fost descărcate cu succes!"));
  };

  const handleShareTrip = async () => {
    if (!trip) return;
    try {
      const tripData = encodeURIComponent(btoa(encodeURIComponent(JSON.stringify(trip))));
      const shareUrl = `${window.location.origin}${window.location.pathname}#/shared-trip?data=${tripData}`;
      setShareModalUrl(shareUrl);
    } catch (e) {
      console.error(e);
      alert('Could not generate share link.');
    }
  };

  const handleToggleActivityCompleted = (dayIndex: number, activityId: string) => {
    if (!trip) return;
    const updated = JSON.parse(JSON.stringify(trip));
    const day = updated.itinerary[dayIndex];
    if (day) {
      const activityIndex = day.activities.findIndex((a: any) => a.id === activityId);
      if (activityIndex !== -1) {
        day.activities[activityIndex].completed = !day.activities[activityIndex].completed;
        const trips = storage.getTrips();
        const existingIndex = trips.findIndex((t) => t.id === trip.id);
        if (existingIndex !== -1) {
          trips[existingIndex] = updated;
        } else {
          trips.push(updated);
        }
        storage.saveTrips(trips);
        setTrip(updated);
      }
    }
  };

  const handleAddToCalendar = (day: any, act: any) => {
    const startDate = new Date(day.date);
    const startStr = format(startDate, 'yyyyMMdd');
    const icsStr = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Voyage Trip Planning//EN
BEGIN:VEVENT
DTSTART:${startStr}
DTEND:${startStr}
SUMMARY:${act.title}
LOCATION:${act.location || ''}
DESCRIPTION:${act.notes || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsStr], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${act.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    refreshTrip();
  }, []);

  const handleAddActivity = () => {
    const targetTrip = trip;
    if (!targetTrip || addingActivityDay === null || !actTitle) return;
    const updated = { ...targetTrip };
    const day = updated.itinerary[addingActivityDay];
    if (day) {
      day.activities.push({
        id: Date.now().toString(),
        title: actTitle,
        time: actTime,
        type: actType,
        location: actLoc,
        confirmationNumber: actConfNum,
        flightNumber: actType === "flight" ? actFlightNum : undefined,
        departureTime: actType === "flight" ? actDepTime : undefined,
        arrivalTime: actType === "flight" ? actArrTime : undefined,
      });

      const all = storage.getTrips();
      const newAll = all.map((t) => (t.id === trip.id ? updated : t));
      storage.saveTrips(newAll);
      setTrip(updated);
    }
    setAddingActivityDay(null);
    setActTitle("");
    setActTime("");
    setActLoc("");
    setActType("activity");
    setActConfNum("");
    setActFlightNum("");
    setActDepTime("");
    setActArrTime("");
  };

  const displayTrip = trip;

  const availableInterests = [
    "Culture & History",
    "Street Food",
    "Nature & Scenery",
    "Adventure",
    "Nightlife",
    "Relaxation",
    "Shopping",
    "Cafes",
  ];

  const toggleAiInterest = (interest: string) => {
    setAiInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleAiFlowSubmit = () => {
    let prompt = "";
    if (aiFlowStep === 3) {
      prompt = `I am planning a trip to ${aiDest} for ${aiDays} days. I am traveling with ${aiCompanions} and we have a ${aiBudget} budget. We are interested in ${aiInterests.join(", ")}.${aiNotFirstTime ? " I have visited this destination before, so please focus on hidden gems, off-the-beaten-path locations, and local favorites rather than typical tourist traps." : ""} ${aiAdditional}`;
      handleGenerateIdea(prompt);
    } else {
      setAiFlowStep(aiFlowStep + 1);
    }
  };

  const renderModals = () => (
    <>
  {/* AI Creation Modal */}
  {showAIModal && (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex flex-col justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl mx-auto flex flex-col shadow-2xl animate-in fade-in zoom-in-95 text-left overflow-hidden relative">
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-brand-100 text-brand-600 p-2 rounded-xl">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-slate-900 leading-tight">
                AI Itinerary Planner
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Customized itineraries built for first-timers
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!isGenerating) {
                setShowAIModal(false);
                setAiFlowStep(1);
              }
            }}
            className="text-slate-400 p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 flex flex-col gap-6 relative z-10 transition-all">
          <div className="flex gap-2 mb-2">
            {[1, 2, 3].map((step) => (
              <div 
                key={step} 
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  aiFlowStep >= step ? "bg-brand-600" : "bg-slate-200"
                )} 
              />
            ))}
          </div>

          {aiFlowStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  Where do you want to go?
                </label>
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  placeholder="E.g., Hanoi and Sapa, or entire Vietnam"
                  value={aiDest}
                  onChange={(e) => setAiDest(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  How many days?
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  value={aiDays}
                  onChange={(e) => setAiDays(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>
          )}

          {aiFlowStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  Who are you traveling with?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Solo", "Couple", "Family", "Friends"].map((comp) => (
                    <button
                      key={comp}
                      onClick={() => setAiCompanions(comp)}
                      className={cn(
                        "p-4 rounded-xl font-medium border text-center transition-colors",
                        aiCompanions === comp 
                          ? "bg-brand-50 border-brand-500 text-brand-700 font-bold" 
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                      )}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  What is your budget style?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["Budget", "Moderate", "Luxury"].map((bOption) => (
                    <button
                      key={bOption}
                      onClick={() => setAiBudget(bOption)}
                      className={cn(
                        "p-4 rounded-xl font-medium border text-center transition-colors",
                        aiBudget === bOption 
                          ? "bg-brand-50 border-brand-500 text-brand-700 font-bold" 
                          : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                      )}
                    >
                      {bOption}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {aiFlowStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  What are your main interests?
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map(interest => (
                    <button 
                      key={interest} 
                      className={cn(
                        "px-4 py-2 border rounded-full text-sm font-medium transition-colors",
                        aiInterests.includes(interest) 
                          ? "bg-brand-600 border-brand-600 text-white" 
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                      onClick={() => toggleAiInterest(interest)}
                    >
                       {interest}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block">
                  Any specific requests? (Optional)
                </label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none min-h-[80px]"
                  placeholder="E.g., Must include a cooking class, slow pace, vegetarian food options..."
                  value={aiAdditional}
                  onChange={(e) => setAiAdditional(e.target.value)}
                  disabled={isGenerating}
                ></textarea>
              </div>
              
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="notFirstTime"
                  className="w-5 h-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  checked={aiNotFirstTime}
                  onChange={(e) => setAiNotFirstTime(e.target.checked)}
                  disabled={isGenerating}
                />
                <label htmlFor="notFirstTime" className="text-sm font-medium text-slate-700 cursor-pointer">
                  I've been here before (show me hidden gems)
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 mt-2 border-t border-slate-100">
            {aiFlowStep > 1 ? (
              <button
                onClick={() => setAiFlowStep(aiFlowStep - 1)}
                className="text-slate-500 font-bold px-6 py-2 hover:bg-slate-100 rounded-xl transition-colors"
                disabled={isGenerating}
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            <button
              onClick={handleAiFlowSubmit}
              disabled={isGenerating || (aiFlowStep === 1 && (!aiDest.trim() || !aiDays))}
              className="bg-brand-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:bg-brand-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />{" "}
                  Generating...
                </>
              ) : aiFlowStep === 3 ? (
                "Create Trip"
              ) : (
                "Next"
              )}
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-x-0 bottom-0 top-[88px] bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
            <Loader2
              className="animate-spin text-brand-500 mb-4"
              size={48}
            />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Crafting your perfect trip...
            </h3>
            <p className="text-slate-500 max-w-sm">
              We're generating a custom itinerary based on local insights
              and optimal travel mapping.
            </p>
          </div>
        )}
      </div>
    </div>
  )}

  {/* Manual Creation Modal */}
  {showManualModal && (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex flex-col justify-end sm:justify-center sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-4xl mx-auto h-auto max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom text-left pb-safe relative">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
            <MapPin className="text-brand-500" size={20} /> New Trip
          </h3>
          <button
            onClick={() => setShowManualModal(false)}
            className="text-slate-400 p-2"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-6 flex-1 overflow-y-auto pr-2 pb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="mb-4 mt-2">
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">
              {t("Trip Resources", "Tài nguyên Chuyến đi", "Resurse Călătorie")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <a
                href="https://www.booking.com"
                target="_blank"
                rel="noreferrer"
                className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-2 rounded-lg text-xs font-bold text-center hover:bg-indigo-100 transition-colors flex flex-col items-center gap-1"
              >
                <Bed size={16} /> Booking.com
              </a>
              <a
                href="https://www.kayak.com"
                target="_blank"
                rel="noreferrer"
                className="bg-orange-50 text-orange-600 border border-orange-200 px-3 py-2 rounded-lg text-xs font-bold text-center hover:bg-orange-100 transition-colors flex flex-col items-center gap-1"
              >
                <Plane size={16} /> Kayak
              </a>
              <a
                href="https://www.skyscanner.net"
                target="_blank"
                rel="noreferrer"
                className="bg-brand-50 text-brand-600 border border-brand-200 px-3 py-2 rounded-lg text-xs font-bold text-center hover:bg-brand-100 transition-colors flex flex-col items-center gap-1"
              >
                <Plane size={16} /> Skyscanner
              </a>
            </div>

          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">
                Destinations & Plans
              </label>
              <button
                onClick={handleAddDest}
                className="text-brand-500 text-xs font-bold flex items-center gap-1 bg-brand-50 px-2 py-1 rounded-md"
              >
                <Plus size={14} /> Add Option
              </button>
            </div>

            <div className="space-y-4">
              {manualDests.map((destObj, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative"
                >
                  {manualDests.length > 1 && (
                    <button
                      onClick={() => removeDest(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                        City / Region {idx + 1}
                      </label>
                      <input
                        type="text"
                        value={destObj.name}
                        onChange={(e) =>
                          updateDest(idx, "name", e.target.value)
                        }
                        className="w-full border border-slate-200 bg-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500"
                        placeholder="e.g. Hanoi, Vietnam"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                          Accommodation
                        </label>
                        <input
                          type="text"
                          value={destObj.stay}
                          onChange={(e) =>
                            updateDest(idx, "stay", e.target.value)
                          }
                          className="w-full border border-slate-200 bg-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500"
                          placeholder="e.g. Hotel / Resort"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                          Flight / Transport
                        </label>
                        <input
                          type="text"
                          value={destObj.flight}
                          onChange={(e) =>
                            updateDest(idx, "flight", e.target.value)
                          }
                          className="w-full border border-slate-200 bg-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500"
                          placeholder="e.g. Flight VN123"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                          Planned Tours
                        </label>
                        <input
                          type="text"
                          value={destObj.tours}
                          onChange={(e) =>
                            updateDest(idx, "tours", e.target.value)
                          }
                          className="w-full border border-slate-200 bg-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500"
                          placeholder="e.g. Ha Long Bay Cruise"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                          Key Activities
                        </label>
                        <input
                          type="text"
                          value={destObj.activities}
                          onChange={(e) =>
                            updateDest(idx, "activities", e.target.value)
                          }
                          className="w-full border border-slate-200 bg-white rounded-lg p-2.5 text-sm focus:outline-none focus:border-brand-500"
                          placeholder="e.g. Street food tour, Night market"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={handleManualCreate}
          disabled={!manualDests[0].name || !startDate || !endDate}
          className="shrink-0 bg-brand-600 text-white py-4 rounded-full font-bold w-full shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
        >
          Create Empty Trip
        </button>
      </div>
    </div>
  )}

    </>
  );

if (!displayTrip) {
    return (
      <div className="flex flex-col h-[100dvh] bg-slate-50 pb-24 overflow-y-auto overflow-x-hidden">
        {/* Hero Image */}
        <div className="relative h-[40vh] min-h-[300px] w-full shrink-0">
          <img
            src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070"
            className="w-full h-full object-cover"
            alt="Vietnam"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent"></div>

          <div className="absolute top-4 left-4 z-10 pt-safe">
            <button
              onClick={() => navigate('/')}
              className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold hover:bg-white/30 transition shadow-sm border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Home size={16} />
              {t("Home", "Trang chủ", "Acasă")}
            </button>
          </div>

          <div className="absolute top-4 right-4 z-10 pt-safe">
            <button
              onClick={cycleLang}
              className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold hover:bg-white/30 transition shadow-sm border border-white/10 flex items-center gap-1.5"
            >
              <Globe size={14} />
              {getLangLabel()}
            </button>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <div className="w-full max-w-5xl">
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                {t("Your AI-powered companion for discovering Vietnam", "Người bạn đồng hành AI của bạn để khám phá Việt Nam", "Companionul tău AI pentru a descoperi Vietnamul")}
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-8 pb-10 relative z-10 -mt-6 bg-slate-50 rounded-t-[32px]">
          <div className="max-w-5xl mx-auto w-full space-y-8">
            {!isOnline && (
              <div className="w-full bg-slate-800 text-white rounded-2xl p-4 shadow-sm border border-slate-700 flex items-start gap-3">
                <WifiOff className="text-slate-300 mt-0.5 shrink-0" size={20} />
                <div>
                  <h3 className="font-bold text-sm">{t("Offline Mode", "Chế độ ngoại tuyến", "Modul Offline")}</h3>
                  <p className="text-xs text-slate-300 mb-2 mt-1">{t("You are currently offline. New trip generation with AI is unavailable, but you can create trips manually.", "Bạn đang ngoại tuyến. Không thể tạo chuyến đi mới bằng AI, nhưng bạn có thể tạo thủ công.", "În prezent ești offline. Generarea noilor călătorii cu AI indisponibilă, dar poți crea manual.")}</p>
                </div>
              </div>
            )}
            <div className="w-full mb-6">
              <a
                href="https://www.youtube.com/@VoyageAI-VN"
                target="_blank"
                rel="noreferrer"
                className="bg-red-50 text-red-600 border border-red-200 px-6 py-4 rounded-3xl shadow-sm font-bold flex items-center justify-center gap-3 hover:bg-red-100 transition-colors w-full text-base"
              >
                <Youtube size={24} />
                {t("Upload & Share Trip Videos on YouTube", "Tải lên & Chia sẻ Video lên YouTube", "Încarcă și partajează videoclipuri pe YouTube")}
              </a>
            </div>

            {/* Let's build your itinerary */}
            <div className="w-full bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 text-left mb-8 mt-2">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                {t(
                  "Let's build your itinerary",
                  "Hãy xây dựng lịch trình của bạn",
                  "Să construim itinerariul tău"
                )}
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                {t(
                  "Start with an AI-crafted plan tailored for first-timers, or build your own.",
                  "Bắt đầu với kế hoạch do AI tạo ra dành riêng cho người mới, hoặc tự xây dựng.",
                  "Începe cu un plan creat de AI sau construiește-l pe al tău."
                )}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  onClick={() => {
                    setAiPrompt("");
                    setShowAIModal(true);
                  }}
                  disabled={!isOnline}
                  className={cn(
                    "text-white p-4 rounded-2xl font-bold w-full flex flex-col items-center justify-center gap-1 shadow-lg transition-transform",
                    !isOnline ? "bg-slate-400 shadow-none cursor-not-allowed opacity-80" : "bg-brand-600 shadow-brand-600/20 active:scale-95"
                  )}
                >
                  <Sparkles size={24} />
                  <span className="text-center text-sm leading-tight mt-1">
                    {t("AI Itinerary Planner", "Kế Hoạch AI", "Planificator Itinerar AI")}
                  </span>
                </button>

                <button
                  onClick={() => setShowManualModal(true)}
                  className="bg-white text-slate-700 p-4 rounded-2xl font-bold w-full border border-slate-200 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform hover:bg-slate-50"
                >
                  <Calendar size={24} className="text-brand-500" />
                  <span className="text-center text-sm leading-tight mt-1">
                    {t("Create Your Itinerary", "Tạo Lịch Trình", "Creează Itinerariul Tău")}
                  </span>
                </button>
              </div>
            </div>

            {/* Download for Offline */}
            <div className="mb-6">
              <div onClick={handleDownloadOffline} className="bg-[#EAF3EB] rounded-[24px] p-5 flex items-center justify-between cursor-pointer active:scale-95 transition-transform overflow-hidden relative border border-[#D5E9DA]">
                <div className="absolute right-[-10%] top-[-50%] w-48 h-48 bg-[#D5E9DA]/50 rounded-full border border-[#D5E9DA] pointer-events-none"></div>
                <div className="absolute right-[5%] top-[10%] w-32 h-32 bg-[#D5E9DA]/50 rounded-full border border-[#D5E9DA] pointer-events-none"></div>
                <div className="absolute right-[-20%] bottom-[-20%] w-40 h-40 bg-[#D5E9DA]/40 rounded-full border border-[#D5E9DA] pointer-events-none"></div>
                
                <div className="flex items-center gap-4 relative z-10 w-full pl-1">
                  <div className="bg-[#0A2E19] text-white w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 shadow-[0_2px_8px_rgba(10,46,25,0.2)]">
                    <Download size={22} />
                  </div>
                  <div className="flex-1 pr-2">
                    <h3 className="font-bold text-slate-900 text-[15px] mb-[2px]">
                      {t("Download for Offline", "Tải xuống ngoại tuyến", "Descarcă pentru Offline")}
                    </h3>
                    <p className="text-[12px] text-slate-500 leading-[1.3] opacity-90">
                      {t("Maps, guides & your itinerary — available without internet.", "Bản đồ, cẩm nang & lịch trình - sử dụng không cần mạng.", "Hărți, ghiduri și itinerariul tău – disponibile fără internet.")}
                    </p>
                  </div>
                </div>

                <div className="bg-[#0A2E19] text-white w-8 h-8 flex items-center justify-center rounded-full relative z-10 shrink-0 shadow-[0_2px_8px_rgba(10,46,25,0.2)]">
                  <ArrowRight size={16} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Why VoyageAI */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100/60 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Leaf className="text-[#2F5A44]" strokeWidth={2.5} size={20} />
                <h2 className="text-[20px] font-serif font-bold text-slate-900">
                  {t("Why VoyageAI?", "Tại sao là VoyageAI?", "De ce VoyageAI?")}
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-3.5">
                  <div className="bg-[#EAF3EB] text-[#2F5A44] p-2.5 rounded-full shrink-0">
                    <Sparkles size={18} strokeWidth={2} />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="font-bold text-slate-900 text-[14px] leading-none mb-1.5">
                      {t("AI-Powered Itineraries", "Lịch trình thông minh", "Itinerarii generate de AI")}
                    </h4>
                    <p className="text-[12.5px] text-slate-500 leading-snug">
                      {t("Personalized day-by-day plans built around your travel style", "Được cá nhân hóa theo phong cách du lịch của bạn", "Planuri personalizate zilnice, bazate pe stilul tău de călătorie")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="bg-[#EAF3EB] text-[#2F5A44] p-2.5 rounded-full shrink-0">
                    <Users size={18} strokeWidth={2} />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="font-bold text-slate-900 text-[14px] leading-none mb-1.5">
                      {t("Verified Local Partners", "Đối tác địa phương uy tín", "Parteneri Locali Verificați")}
                    </h4>
                    <p className="text-[12.5px] text-slate-500 leading-snug">
                      {t("Book directly with trusted Vietnamese businesses", "Đặt trực tiếp với các đơn vị uy tín của Việt Nam", "Rezervă direct la afaceri de încredere din Vietnam")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="bg-[#EAF3EB] text-[#2F5A44] p-2.5 rounded-full shrink-0">
                    <WifiOff size={18} strokeWidth={2} />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="font-bold text-slate-900 text-[14px] leading-none mb-1.5">
                      {t("Works Offline", "Sử dụng ngoại tuyến", "Funcționează Offline")}
                    </h4>
                    <p className="text-[12.5px] text-slate-500 leading-snug">
                      {t("Full access to maps, guides and your trip without internet", "Truy cập toàn bộ mà không cần kết nối internet", "Acces complet la hărți, ghiduri și călătoria ta fără internet")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="bg-[#EAF3EB] text-[#2F5A44] p-2.5 rounded-full shrink-0">
                    <Clock size={18} strokeWidth={2} />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="font-bold text-slate-900 text-[14px] leading-none mb-1.5">
                      {t("Real-Time Updates", "Cập nhật thời gian thực", "Actualizări în Timp Real")}
                    </h4>
                    <p className="text-[12.5px] text-slate-500 leading-snug">
                      {t("Live weather, transport alerts and local event notifications", "Thời tiết, giao thông và các sự kiện trong khu vực", "Vreme, alerte de transport și notificări de evenimente locale live")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        {renderModals()}
      </div>
    );
  }

  const daysToTrip = differenceInDays(
    new Date(displayTrip.startDate),
    new Date(),
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Hero Section */}
      <div className="relative h-64 bg-slate-900">
        <img
          src={
            displayTrip.coverImage ||
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
          }
          alt={displayTrip.destination}
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={() => setTrip(null)}
            className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition shadow-sm border border-white/10"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={cycleLang}
            className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold hover:bg-white/30 transition shadow-sm border border-white/10 flex items-center gap-1.5"
          >
            <Globe size={14} />
            {getLangLabel()}
          </button>
          <button
            onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*';
              fileInput.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64Data = reader.result as string;
                    const updatedTrip = { ...displayTrip, coverImage: base64Data };
                    const existingTrips = storage.getTrips();
                    const tripIndex = existingTrips.findIndex((t) => t.id === displayTrip.id);
                    if (tripIndex !== -1) {
                      existingTrips[tripIndex] = updatedTrip;
                      storage.saveTrips(existingTrips);
                      setTrip(updatedTrip);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              };
              fileInput.click();
            }}
            className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition shadow-sm border border-white/10"
            title="Change cover image"
          >
            <ImageIcon size={18} />
          </button>
          <button
            onClick={() => handleShareTrip()}
            className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition shadow-sm border border-white/10"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={() => setShowActionModal(true)}
            className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition shadow-sm border border-white/10"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 p-6 w-full flex justify-center">
          <div className="flex items-end justify-between w-full max-w-5xl">
            <div>
              <p className="text-brand-100 font-medium text-sm mb-1 uppercase tracking-wider">
                {daysToTrip > 0
                  ? t(`${daysToTrip} days to go`, `Còn ${daysToTrip} ngày`, `Mai sunt ${daysToTrip} zile`)
                  : t("Trip ongoing", "Đang trong chuyến đi", "Călătorie în curs")}
              </p>
              <h1 className="text-3xl font-bold text-white leading-tight">
                {displayTrip.destination}
              </h1>
              <div className="text-slate-300 mt-2 text-sm flex items-center flex-wrap gap-2">
                <p className="flex items-center gap-2">
                  <Calendar size={14} />
                  {format(new Date(displayTrip.startDate), "MMM d")} -{" "}
                  {format(new Date(displayTrip.endDate), "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 text-center min-w-[70px]">
              <span className="block text-2xl font-bold text-white">32°</span>
              <span className="text-xs text-white/80">
                {t("Sunny", "Nắng")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 -mt-4 relative z-10">
        <div className="max-w-5xl mx-auto w-full">
          {!isOnline && (
            <div className="w-full bg-slate-800 text-white rounded-3xl p-4 shadow-sm border border-slate-700 flex items-start gap-3 mb-6">
              <WifiOff className="text-slate-300 mt-0.5 shrink-0" size={20} />
              <div>
                <h3 className="font-bold text-sm">Offline Mode Active</h3>
                <p className="text-xs text-slate-300 mb-0 mt-1">Showing cached trip data. Your itinerary and notes are available offline.</p>
              </div>
            </div>
          )}

          {displayTrip.notes && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                {t("Trip Plan", "Kế Hoạch Chuyến Đi", "Plan de călătorie")}
              </h3>
              <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                {displayTrip.notes}
              </pre>
            </div>
          )}

          {/* Packing List & Flight Info (Placeholder) */}
          {!displayTrip.notes && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-brand-50 text-brand-600 p-2.5 rounded-xl">
                  <Plane size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    VN123 • {t("On Time", "Đúng giờ")}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("Departure: 14:00 today", "Khởi hành: 14:00 hôm nay")}
                  </p>
                </div>
              </div>
              <button className="text-brand-500 text-sm font-bold">
                {t("View", "Xem")}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {t("Itinerary", "Lịch Trình", "Itinerar")}
            </h2>
          </div>

          {displayTrip.itinerary.map((day, idx) => (
            <div key={idx} className="mb-8">
              <div className="flex items-center justify-between mb-3 sticky top-0 py-2 bg-slate-50 z-10 -mx-4 px-4 shadow-sm border-b border-slate-100">
                <h3 className="font-bold text-slate-900">
                  <span className="text-brand-500 mr-2">
                    {t(`Day ${idx + 1}`, `Ngày ${idx + 1}`)}
                  </span>
                  <span className="text-slate-500 font-normal text-sm">
                    {format(new Date(day.date), "EEEE, MMM d")}
                  </span>
                </h3>
                <button
                  onClick={() => setAddingActivityDay(idx)}
                  className="text-brand-500 bg-brand-50 p-1.5 rounded-full hover:bg-brand-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-4 pl-2 border-l-2 border-slate-200 ml-3">
                {day.activities.map((act) => (
                  <div key={act.id} className="relative pl-6">
                    {/* Timeline dot */}
                    <div
                      className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border-4 border-slate-50 box-content ${act.type === "flight" ? "bg-blue-500" : act.type === "hotel" ? "bg-emerald-500" : "bg-brand-500"}`}
                    />

                    <div
                      className={cn("block bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-colors", act.completed && "opacity-60 bg-slate-50")}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={!!act.completed}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleToggleActivityCompleted(idx, act.id);
                            }}
                            className="mt-0.5 shrink-0 w-5 h-5 rounded border-slate-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                          />
                          
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-1">
                              {act.type === "flight" && (
                                <span className="bg-blue-50 text-blue-500 p-1 rounded-md">
                                  <Plane size={14} />
                                </span>
                              )}
                              {act.type === "hotel" && (
                                <span className="bg-emerald-50 text-emerald-500 p-1 rounded-md">
                                  <Bed size={14} />
                                </span>
                              )}
                              <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(act.title + " " + (act.location || displayTrip.destination))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn("font-bold text-slate-900 text-sm hover:text-brand-600 transition-colors", act.completed && "line-through text-slate-500")}
                              >
                                {act.title}
                              </a>
                            </div>

                            {(act.flightNumber || act.confirmationNumber) && (
                              <div className="flex flex-wrap gap-2 mb-2 mt-1">
                                {act.flightNumber && (
                                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">
                                    {t("Flight", "Chuyến Bay")}: {act.flightNumber}
                                  </span>
                                )}
                                {act.confirmationNumber && (
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase">
                                    {t("Conf", "Mã Đặt")}: {act.confirmationNumber}
                                  </span>
                                )}
                              </div>
                            )}

                            {act.location && (
                              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                                <MapPin size={12} className="text-slate-400" />
                                {act.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                          {(act.time || act.departureTime) && (
                            <span
                              className={`text-xs font-bold px-2 py-1 rounded-md ${act.type === "flight" ? "bg-blue-50 text-blue-600" : act.type === "hotel" ? "bg-emerald-50 text-emerald-600" : "bg-brand-50 text-brand-600"}`}
                            >
                              {act.type === "flight"
                                ? `${act.departureTime}${act.arrivalTime ? ` - ${act.arrivalTime}` : ""}`
                                : act.time}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCalendar(day, act);
                            }}
                            className="text-slate-400 hover:text-brand-500 transition-colors p-1"
                            title={t("Add to Calendar", "Thêm vào Lịch")}
                          >
                            <CalendarPlus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Packing List & Expenses (Placeholder) */}
          <div className="grid grid-cols-2 gap-4 mt-8 mb-4">
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 cursor-pointer">
              <div className="w-10 h-10 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z" />
                  <path d="M22 10v6" />
                  <path d="M18 12h-4" />
                  <path d="M12 2v4" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mt-1">
                {t("Packing List", "Danh sách đóng gói", "Listă de bagaje")}
              </h4>
              <span className="text-xs text-brand-500 bg-brand-50 px-2 py-0.5 rounded-full font-bold">
                12/15 {t("Packed", "Đã gói")}
              </span>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 cursor-pointer">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 18V6" />
                </svg>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mt-1">
                {t("Expenses", "Chi tiêu", "Cheltuieli")}
              </h4>
              <span className="text-xs text-slate-500 font-bold">
                $450 / $1000
              </span>
            </div>
          </div>
        </div>

        {/* Add Activity Modal */}
        {addingActivityDay !== null && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex flex-col justify-end sm:justify-center sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-5xl mx-auto h-auto max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom text-left pb-safe">
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  {t("Add Activity", "Thêm Hoạt Động", "Adaugă Activitate")}
                </h3>
                <button
                  onClick={() => setAddingActivityDay(null)}
                  className="text-slate-400 p-2"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-4">
                <div className="flex gap-2">
                  {["activity", "flight", "hotel"].map((tType) => (
                    <button
                      key={tType}
                      onClick={() => setActType(tType as any)}
                      className={`flex-1 py-2 px-1 text-xs font-bold rounded-lg border transition-colors flex items-center justify-center gap-1.5 capitalize ${actType === tType ? "bg-brand-50 border-brand-200 text-brand-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                    >
                      {tType === "activity" ? <MapPin size={14} /> : tType === "flight" ? <Plane size={14} /> : <Bed size={14} />}
                      {tType === "activity"
                        ? t("Activity", "Hoạt \u0111\u1ed9ng")
                        : tType === "flight"
                          ? t("Flight", "Chuy\u1ebfn bay")
                          : t("Hotel", "Kh\u00e1ch s\u1ea1n")}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                    {t("Title", "Tiêu đề")}
                  </label>
                  <input
                    type="text"
                    value={actTitle}
                    onChange={(e) => setActTitle(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:border-brand-500"
                    placeholder={
                      actType === "flight"
                        ? t("e.g. Flight to Hanoi", "vd: Chuyến bay đến Hà Nội")
                        : actType === "hotel"
                          ? t(
                              "e.g. Check-in at Sofitel",
                              "vd: Nhận phòng Sofitel",
                            )
                          : t("e.g. Dinner at Pho 10", "vd: Ăn tối ở Phở 10")
                    }
                  />
                </div>

                {actType === "flight" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                        {t("Flight Number", "Số Chuyến Bay")}
                      </label>
                      <input
                        type="text"
                        value={actFlightNum}
                        onChange={(e) => setActFlightNum(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:border-brand-500"
                        placeholder="e.g. VN123"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                        {t("Confirmation #", "Mã xác nhận")}
                      </label>
                      <input
                        type="text"
                        value={actConfNum}
                        onChange={(e) => setActConfNum(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:border-brand-500"
                        placeholder="e.g. ABCDEF"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                        {t("Departure Time", "Giờ Khởi Hành")}
                      </label>
                      <input
                        type="time"
                        value={actDepTime}
                        onChange={(e) => setActDepTime(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                        {t("Arrival Time", "Giờ Đến")}
                      </label>
                      <input
                        type="time"
                        value={actArrTime}
                        onChange={(e) => setActArrTime(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                )}

                {actType === "hotel" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                        {t("Confirmation #", "Mã xác nhận")}
                      </label>
                      <input
                        type="text"
                        value={actConfNum}
                        onChange={(e) => setActConfNum(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:border-brand-500"
                        placeholder="e.g. 12345678"
                      />
                    </div>
                  </div>
                )}

                {(actType === "activity" || actType === "hotel") && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                        {t("Time (Optional)", "Thời gian (Tùy chọn)")}
                      </label>
                      <input
                        type="time"
                        value={actTime}
                        onChange={(e) => setActTime(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">
                    {t("Location (Optional)", "Khu vực (Tùy chọn)")}
                  </label>
                  <input
                    type="text"
                    value={actLoc}
                    onChange={(e) => setActLoc(e.target.value)}
                    className="w-full border border-slate-200 bg-white rounded-xl p-3 focus:outline-none focus:border-brand-500"
                    placeholder={
                      actType === "flight"
                        ? t("e.g. Terminal 2", "vd: Nhà ga số 2")
                        : t("e.g. Hoan Kiem District", "vd: Quận Hoàn Kiếm")
                    }
                  />
                </div>
              </div>
              <button
                onClick={handleAddActivity}
                disabled={!actTitle}
                className="shrink-0 bg-brand-600 text-white py-4 rounded-full font-bold w-full shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {t("Save Activity", "Lưu Hoạt Động")}
              </button>
            </div>
          </div>
        )}

        {/* Share Trip Modal */}
        {shareModalUrl && (
          <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                  <Share2 size={24} className="text-brand-500" />
                  {t("Share Trip", "Chia Sẻ Chuyến Đi")}
                </h3>
                <button
                  onClick={() => setShareModalUrl(null)}
                  className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-slate-600 mb-4 text-sm">
                {t("Copy the link below to share this itinerary:", "Sao chép liên kết bên dưới để chia sẻ:")}
              </p>
              <div className="bg-slate-100 rounded-xl p-3 flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value={shareModalUrl}
                  className="bg-transparent w-full outline-none text-slate-700 text-sm font-medium"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  id="shareUrlInput"
                />
              </div>
              <button
                onClick={() => {
                  try {
                    const input = document.getElementById("shareUrlInput") as HTMLInputElement;
                    input.select();
                    document.execCommand('copy');
                    alert(t("Link copied to clipboard!", "Đã sao chép liên kết!"));
                    setShareModalUrl(null);
                  } catch (e) {
                      alert(t("Please copy the link text manually.", "Vui lòng sao chép liên kết thủ công."));
                  }
                }}
                className="mt-6 bg-brand-600 text-white font-bold w-full py-4 rounded-xl hover:bg-brand-700 active:scale-95 transition-all shadow-lg"
              >
                {t("Copy Link", "Sao Chép Liên Kết")}
              </button>
            </div>
          </div>
        )}

        {/* Action Modal */}
        {showActionModal && displayTrip && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-900">
                  {t("Trip Actions", "Hành Động")}
                </h3>
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setShowDeleteConfirm(false);
                  }}
                  className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setShowDeleteConfirm(false);
                    setTrip(null);
                  }}
                  className="bg-slate-100 text-slate-700 font-bold px-6 py-5 rounded-2xl flex items-center justify-center gap-3 w-full transition-all hover:bg-slate-200 hover:shadow-sm active:scale-95 text-lg"
                >
                  <Plus size={24} />
                  {t("Create New Trip", "Tạo Chuyến Đi Mới")}
                </button>
                <button
                  onClick={() => {
                    const vaultFiles = storage.getVaultFiles();
                    let markdownContent = `# Trip Plan: ${displayTrip.destination}\n\n`;
                    if (displayTrip.notes)
                      markdownContent += displayTrip.notes + "\n\n";
                    displayTrip.itinerary.forEach((day, i) => {
                      markdownContent += `## Day ${i + 1} - ${format(new Date(day.date), "MMMM d")}\n`;
                      day.activities.forEach((act) => {
                        markdownContent += `- **${act.time || "Anytime"}**: ${act.title} ${act.location ? `(@ ${act.location})` : ""}\n`;
                      });
                      markdownContent += `\n`;
                    });

                    vaultFiles.push({
                      id: "trip_" + Date.now().toString(),
                      name: `Trip to ${displayTrip.destination}`,
                      type: "text/markdown",
                      uri: markdownContent,
                      createdAt: new Date().toISOString(),
                    });
                    storage.saveVaultFiles(vaultFiles);

                    const all = storage.getTrips();
                    storage.saveTrips(
                      all.filter((t) => t.id !== displayTrip.id),
                    );

                    setTrip(null);
                    setShowActionModal(false);
                    setShowDeleteConfirm(false);
                  }}
                  className="bg-brand-50 text-brand-600 font-bold px-6 py-5 rounded-2xl flex items-center justify-center gap-3 w-full transition-all hover:bg-brand-100 hover:shadow-sm active:scale-95 text-lg"
                >
                  <Archive size={24} />
                  {t("Move to Vault", "Chuyển vào Két")}
                </button>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-50 text-red-600 font-bold px-6 py-5 rounded-2xl flex items-center justify-center gap-3 w-full transition-all hover:bg-red-100 hover:shadow-sm active:scale-95 text-lg"
                  >
                    <Trash2 size={24} />
                    {t("Delete Trip", "Xóa Chuyến Đi")}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const all = storage.getTrips();
                      storage.saveTrips(
                        all.filter((t) => t.id !== displayTrip.id),
                      );
                      setTrip(null);
                      setShowActionModal(false);
                      setShowDeleteConfirm(false);
                    }}
                    className="bg-red-600 text-white font-bold px-6 py-5 rounded-2xl flex items-center justify-center gap-3 w-full transition-all hover:bg-red-700 shadow-lg active:scale-95 text-lg animate-in fade-in zoom-in-95"
                  >
                    <Trash2 size={24} />
                    {t("Yes, Delete", "Có, Hãy Xóa")}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      {renderModals()}
      </div>
    </div>
  );
}
