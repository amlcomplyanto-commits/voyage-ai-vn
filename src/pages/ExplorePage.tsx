import React, { useState, useEffect } from "react";
import {
  Search,
  Navigation,
  Star,
  Coffee,
  Utensils,
  Camera,
  Map as MapIcon,
  Compass,
  Loader2,
  Settings2,
  Plus,
  X,
  HeartHandshake,
  ExternalLink,
  Sparkles,
  Calendar,
  Trash2,
  ChefHat,
  ArrowRight,
  Home,
  Plane,
  Bed,
  Ticket,
} from "lucide-react";
import { cn } from "../lib/utils";
import { generateExploreSuggestions, generateTripPlan } from "../lib/gemini";
import { storage, ExplorePlace, Partner, Trip } from "../lib/storage";
import { format } from "date-fns";
import { useNavigate } from 'react-router-dom';
import { useI18n } from "../lib/i18n";

const LOCATIONS = [
  "Ho Chi Minh City, Vietnam",
  "Hanoi, Vietnam",
  "Da Nang, Vietnam",
  "Hoi An, Vietnam",
  "Nha Trang, Vietnam",
  "Phu Quoc, Vietnam",
  "Da Lat, Vietnam",
  "Sa Pa, Vietnam",
  "Hue, Vietnam",
  "Ha Long Bay, Vietnam",
];

export function ExplorePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [activeCategory, setActiveCategory] = useState("Must-See Attractions & Culture");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ExplorePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlace, setNewPlace] = useState({
    name: "",
    type: "",
    distance: "",
    rating: "4.5",
    image: "",
  });

  const [showRestaurantSearch, setShowRestaurantSearch] = useState(false);
  const [cuisine, setCuisine] = useState("");
  const [restaurantResults, setRestaurantResults] = useState<ExplorePlace[]>([]);
  const [isSearchingRestaurants, setIsSearchingRestaurants] = useState(false);

  const categories = [
    {
      name: "Restaurants",
      displayName: t("Restaurants", "Nhà hàng", "Restaurante"),
      icon: ChefHat,
      color: "bg-purple-100 text-purple-600",
      action: () => setShowRestaurantSearch(true)
    },
    {
      name: "Must-See Attractions & Culture",
      displayName: t("Must-See Attractions & Culture", "Các điểm tham quan & Văn hóa PHẢI xem", "Atracții de văzut & Cultură"),
      icon: Camera,
      color: "bg-orange-100 text-orange-600",
    },
    {
      name: "Street Food & Markets",
      displayName: t("Street Food & Markets", "Thức ăn đường phố & Chợ", "Mâncare stradală & Piețe"),
      icon: Utensils,
      color: "bg-red-100 text-red-600",
    },
    {
      name: "Best Local Coffee",
      displayName: t("Best Local Coffee", "Cà phê địa phương tốt nhất", "Cea mai bună cafea locală"),
      icon: Coffee,
      color: "bg-amber-100 text-amber-600",
    },
    {
      name: "Connect with Locals",
      displayName: t("Connect with Locals", "Kết nối với người dân", "Conectează-te cu localnicii"),
      icon: HeartHandshake,
      color: "bg-teal-100 text-teal-600",
      action: () => navigate('/local-experiences')
    },
    {
      name: "Safety & Scams",
      displayName: t("Safety & Scams", "An toàn & Lừa đảo", "Securitate și Escrocherii"),
      icon: Compass,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  const handleGlobalSearch = async () => {
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim();
    setActiveCategory(query);

    const cached = storage.getExplorePlaces(location, query);
    if (cached) {
      setSuggestions(cached);
      return;
    }

    setIsLoading(true);
    try {
      const data = await generateExploreSuggestions(location, query);
      setSuggestions(data);
      storage.saveExplorePlaces(location, query, data);
    } catch (e) {
      alert("Failed to search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCategory = async () => {
    setIsLoading(true);
    try {
      const data = await generateExploreSuggestions(location, activeCategory);
      setSuggestions(data);
      storage.saveExplorePlaces(location, activeCategory, data);
    } catch (e) {
      alert("Failed to generate suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchSuggestions = async () => {
      // Check cache first
      const cached = storage.getExplorePlaces(location, activeCategory);
      if (isMounted) {
        setSuggestions(cached || []);
      }
    };
    fetchSuggestions();

    return () => {
      isMounted = false;
    };
  }, [location, activeCategory]);

  const handleRemovePlace = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newSuggestions = suggestions.filter((s) => s.id !== id);
    setSuggestions(newSuggestions);
    storage.saveExplorePlaces(location, activeCategory, newSuggestions);
  };

  const handleAddPlace = () => {
    if (!newPlace.name) return;
    const place: ExplorePlace = {
      id: Math.random().toString(36).substring(7),
      name: newPlace.name,
      type: newPlace.type,
      distance: newPlace.distance
        ? newPlace.distance.includes("km")
          ? newPlace.distance
          : `${newPlace.distance} km`
        : "0.5 km",
      rating: newPlace.rating || "4.5",
      image:
        newPlace.image ||
        "https://images.unsplash.com/photo-1546412414-e1885259563a?w=800&q=80",
      location: location,
    };
    const newSuggestions = [place, ...suggestions];
    setSuggestions(newSuggestions);
    storage.saveExplorePlaces(location, activeCategory, newSuggestions);
    setShowAddModal(false);
    setNewPlace({ name: "", type: "", distance: "", rating: "4.5", image: "" });
  };

  const handleSearchRestaurants = async () => {
    if (!cuisine.trim()) return;
    setIsSearchingRestaurants(true);
    
    // Check cache first
    const cacheKey = `Restaurants serving ${cuisine.trim()}`;
    const cached = storage.getExplorePlaces(location, cacheKey);
    if (cached) {
      setRestaurantResults(cached);
      setIsSearchingRestaurants(false);
      return;
    }

    try {
      const data = await generateExploreSuggestions(location, `${cacheKey} cuisine`, 10);
      setRestaurantResults(data);
      storage.saveExplorePlaces(location, cacheKey, data);
    } catch (e) {
      alert("Failed to find restaurants. Please try again.");
    } finally {
      setIsSearchingRestaurants(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 pb-20 pt-safe font-sans relative">
      <div className="px-5 pt-4 pb-2 shrink-0 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
             <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors" title="Home">
               <Home size={20} />
             </button>
             <h1 className="text-xl md:text-2xl font-bold text-slate-900">{t('Feel the true heartbeat of Vietnam', 'Cảm nhận nhịp đập thực sự của Việt Nam', 'Simte adevărata inimă a Vietnamului')}</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/local-experiences')}
              className="p-2 bg-brand-100 text-brand-600 rounded-full hover:bg-brand-200 transition-colors"
              title="Connect with Locals"
            >
              <HeartHandshake size={20} />
            </button>
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={cn(
                "p-2 rounded-full transition-colors",
                isAdminMode
                  ? "bg-slate-200 text-slate-700"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200",
              )}
              title="Administrator Mode"
            >
              <Settings2 size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-4 mb-5">
          <Navigation size={16} className="text-brand-500 shrink-0" />
          <select
            value={location.startsWith("My Location:") ? "Current Location" : location}
            onChange={(e) => {
              if (e.target.value !== "Current Location") {
                setLocation(e.target.value);
              }
            }}
            className="bg-transparent text-slate-800 font-semibold focus:outline-none w-full appearance-none pr-8 cursor-pointer relative z-10"
            style={{
              backgroundImage:
                'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
              backgroundSize: "0.65em auto",
            }}
          >
            {location.startsWith("My Location:") && (
              <option value="Current Location">Current Location</option>
            )}
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (navigator.geolocation) {
                setIsLoading(true);
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation(`My Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    setIsLoading(false);
                  },
                  (error) => {
                    console.error(error);
                    alert("Could not get your location. Please check your browser permissions.");
                    setIsLoading(false);
                  }
                );
              } else {
                alert("Geolocation is not supported by your browser.");
              }
            }}
            className="p-2 ml-2 bg-slate-100 text-brand-600 rounded-full hover:bg-slate-200 transition-colors"
            title="Use My Current Location"
          >
             <MapIcon size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="px-5 max-w-5xl mx-auto w-full">
          {/* Search */}
          <div className="relative mb-6 shadow-sm mt-2 flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-sm placeholder:text-slate-400 text-slate-800"
                placeholder={t("Search places, food, activities...", "Tìm kiếm địa điểm, thức ăn, hoạt động...", "Caută locuri, mâncare, activități...")}
              />
            </div>
            <button
              onClick={handleGlobalSearch}
              disabled={!searchQuery.trim() || isLoading}
              className="bg-brand-600 text-white px-5 rounded-2xl font-bold hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : t("Search", "Tìm kiếm", "Caută")}
            </button>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-6 gap-x-3 mb-8">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.name;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if ((cat as any).action) {
                      (cat as any).action();
                    } else {
                      setActiveCategory(cat.name);
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 text-center",
                    isActive ? "opacity-100" : "opacity-60 hover:opacity-100",
                  )}
                >
                  <div
                    className={cn(
                      "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-sm",
                      cat.color,
                      isActive && "ring-2 ring-brand-500 ring-offset-2",
                    )}
                  >
                    <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs font-bold leading-tight",
                      isActive ? "text-brand-600" : "text-slate-600",
                    )}
                  >
                    {cat.displayName}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Hidden Featured Partners Section logic as horizontal scroller */}

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {suggestions.length > 0
                ? t(`Top ${suggestions.length} ${categories.find(c => c.name === activeCategory)?.displayName || activeCategory}`, `Top ${suggestions.length} ${categories.find(c => c.name === activeCategory)?.displayName || activeCategory}`, `Top ${suggestions.length} ${categories.find(c => c.name === activeCategory)?.displayName || activeCategory}`)
                : categories.find(c => c.name === activeCategory)?.displayName || activeCategory}
            </h2>
            <div className="flex items-center gap-2">
              {suggestions.length > 0 && (
                <button
                  onClick={() => {
                    storage.saveExplorePlaces(location, activeCategory, []);
                    setSuggestions([]);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-colors"
                >
                  <Trash2 size={14} /> {t("Clear", "Xóa", "Golește")}
                </button>
              )}
              {isAdminMode && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <Plus size={14} /> {t("Add New", "Thêm Mới", "Adaugă Nou")}
                </button>
              )}
            </div>
          </div>

          {/* List cards */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="animate-spin mb-4 text-brand-500" size={32} />
              <p className="text-sm font-semibold">
                {t(`Discovering ${activeCategory.toLowerCase()} in`, `Đang khám phá ${activeCategory.toLowerCase()} tại`, `Descoperă ${activeCategory.toLowerCase()} în`)}{" "}
                {location.split(",")[0]}...
              </p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div
                className="bg-brand-50 w-24 h-24 rounded-full flex items-center justify-center mb-5 cursor-pointer hover:scale-105 active:scale-95 transition-transform ring-4 ring-brand-50"
                onClick={handleGenerateCategory}
              >
                {categories.find((c) => c.name === activeCategory)?.icon &&
                  React.createElement(
                    categories.find((c) => c.name === activeCategory)!.icon,
                    { size: 40, className: "text-brand-500" },
                  )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t("Discover", "Khám phá", "Descoperă")} {(categories.find(c => c.name === activeCategory)?.displayName || activeCategory).toLowerCase()}
              </h3>
              <p className="text-slate-500 text-sm mb-6 max-w-[280px]">
                {t(
                  "Get AI-curated recommendations for the best",
                  "Nhận các đề xuất do AI tuyển chọn cho",
                  "Primește recomandări curatoriate de AI pentru cele mai bune"
                )}{" "}
                {(categories.find(c => c.name === activeCategory)?.displayName || activeCategory).toLowerCase()}{" "}
                {t("in", "tại", "în")} {location.split(",")[0]}.
              </p>
              <button
                onClick={handleGenerateCategory}
                className="bg-brand-600 text-white px-6 py-3 rounded-full font-bold shadow-md shadow-brand-600/20 active:scale-95 transition-transform flex items-center gap-2"
              >
                <Sparkles size={18} /> {t("Generate Suggestions", "Tạo Thuyết Minh", "Generează Sugestii")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-4">
              {suggestions.map((place) => (
                <a
                  key={place.id}
                  href={`https://www.google.com/search?q=${encodeURIComponent(place.name + " " + location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex gap-4 items-center hover:bg-slate-50 transition-colors"
                >
                  <div className="h-20 w-20 relative shrink-0">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2 leading-tight">
                      {place.name}
                    </h3>
                    <div className="text-xs text-slate-500 truncate">
                      {place.type}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 font-bold text-brand-500">
                        <Navigation size={12} />
                        {place.distance}
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md">
                        <Star
                          size={10}
                          className="text-amber-500 fill-amber-500"
                        />
                        <span className="font-bold text-amber-700">
                          {place.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isAdminMode && (
                    <button
                      onClick={(e) => handleRemovePlace(e, place.id)}
                      className="p-2 text-red-500 bg-red-50 rounded-full hover:bg-red-100 shrink-0 ml-2 shadow-sm border border-red-100 active:scale-95 transition-transform"
                      title="Remove item"
                    >
                      <X size={16} />
                    </button>
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin Add Modal */}
      {showAddModal && isAdminMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">
                Add New Place
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 bg-slate-100 rounded-full text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  Place Name
                </label>
                <input
                  type="text"
                  value={newPlace.name}
                  onChange={(e) =>
                    setNewPlace({ ...newPlace, name: e.target.value })
                  }
                  placeholder="e.g. Secret Coffee Shop"
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-brand-500 bg-slate-50"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">
                    Type
                  </label>
                  <input
                    type="text"
                    value={newPlace.type}
                    onChange={(e) =>
                      setNewPlace({ ...newPlace, type: e.target.value })
                    }
                    placeholder="e.g. Cafe"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-brand-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">
                    Distance
                  </label>
                  <input
                    type="text"
                    value={newPlace.distance}
                    onChange={(e) =>
                      setNewPlace({ ...newPlace, distance: e.target.value })
                    }
                    placeholder="e.g. 1.2"
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-brand-500 bg-slate-50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">
                    Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={newPlace.rating}
                    onChange={(e) =>
                      setNewPlace({ ...newPlace, rating: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-brand-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={newPlace.image}
                    onChange={(e) =>
                      setNewPlace({ ...newPlace, image: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-brand-500 bg-slate-50"
                  />
                </div>
              </div>
              <button
                onClick={handleAddPlace}
                disabled={!newPlace.name}
                className="w-full bg-brand-500 text-white font-bold py-3 mt-2 flex items-center justify-center rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
              >
                Add Place to Top {activeCategory}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restaurant Search Modal */}
      {showRestaurantSearch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg h-[80vh] sm:h-[600px] rounded-[32px] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <ChefHat className="text-brand-500" size={24} />
                Find Restaurants
              </h3>
              <button
                onClick={() => {
                  setShowRestaurantSearch(false);
                  setRestaurantResults([]);
                  setCuisine("");
                }}
                className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 border-b border-slate-100 shrink-0 bg-slate-50">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchRestaurants()}
                    placeholder="e.g. Italian, Sushi, Vegan"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-slate-800"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleSearchRestaurants}
                  disabled={!cuisine.trim() || isSearchingRestaurants}
                  className="bg-brand-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {isSearchingRestaurants ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Loader2 className="animate-spin mb-4 text-brand-500" size={32} />
                  <p className="text-sm font-semibold">Finding the best {cuisine} restaurants...</p>
                </div>
              ) : restaurantResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                    <ChefHat size={32} className="text-purple-400" />
                  </div>
                  <h4 className="text-slate-800 font-bold mb-2">Craving something specific?</h4>
                  <p className="text-slate-500 text-sm max-w-[250px]">
                    Enter a cuisine to get AI-curated restaurant recommendations in {location.split(',')[0]}.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {restaurantResults.map((place) => (
                    <a
                      key={place.id}
                      href={`https://www.google.com/search?q=${encodeURIComponent(place.name + " " + location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex gap-4 items-center hover:bg-slate-50 transition-colors"
                    >
                      <div className="h-20 w-20 relative shrink-0">
                        <img
                          src={place.image}
                          alt={place.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2 leading-tight">
                          {place.name}
                        </h3>
                        <div className="text-xs text-slate-500 truncate">
                          {place.type}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1 font-bold text-brand-500">
                            <Navigation size={12} />
                            {place.distance}
                          </div>
                          <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-md">
                            <Star size={10} className="text-amber-500 fill-amber-500" />
                            <span className="font-bold text-amber-700">{place.rating}</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
