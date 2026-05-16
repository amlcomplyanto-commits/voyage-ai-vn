import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, HeartHandshake, ExternalLink, ShieldCheck, LogIn, LogOut, Clock, ShieldAlert, UserCircle, Home, ArrowRight, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db, auth, signInWithGoogle, signOut, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, doc, getDoc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useI18n } from '../lib/i18n';

interface Partner {
  id: string;
  name: string;
  type: string;
  description: string;
  image: string;
  url: string;
  createdAt: number;
}

export function LocalExperiencesPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: "",
    type: "",
    description: "",
    image: "",
    url: "",
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.emailVerified) {
        try {
          if (currentUser.email === 'redantofl@gmail.com') {
            setIsAdmin(true);
          } else {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            setIsAdmin(adminDoc.exists());
          }
        } catch (error) {
          console.error("Admin check failed", error);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'partners'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Partner[];
      setPartners(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'partners');
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (e: any) {
      if (e?.code !== 'auth/popup-closed-by-user' && e?.code !== 'auth/cancelled-popup-request') {
        console.error("Login error:", e);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPartner = async () => {
    if (!newPartner.name || !isAdmin) return;
    try {
      const partnerId = Math.random().toString(36).substring(2, 15);
      const now = Date.now();
      const pData = {
        name: newPartner.name,
        type: newPartner.type || "Partner",
        description: newPartner.description,
        image: newPartner.image || "https://images.unsplash.com/photo-1560179707-f14e90ef3623",
        url: newPartner.url || undefined,
        createdAt: now,
        updatedAt: now,
      };
      
      // Clean undefined
      const cleanData = Object.fromEntries(Object.entries(pData).filter(([_, v]) => v !== undefined));

      await setDoc(doc(db, 'partners', partnerId), cleanData);
      
      setShowAddPartnerModal(false);
      setNewPartner({ name: "", type: "", description: "", image: "", url: "" });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'partners');
    }
  };

  const handleRemovePartner = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'partners', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `partners/${id}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 pb-20 pt-safe font-sans relative">
      {isAdmin && (
        <div className="bg-brand-600 text-white text-[11px] font-bold py-1.5 px-4 text-center flex items-center justify-center gap-1.5 shrink-0 uppercase tracking-wider shadow-sm z-50">
          <ShieldCheck size={14} /> {t("Administrator Mode Active", "Chế độ Quản trị viên đã bật", "Mod Administrator Activ")}
        </div>
      )}
      <div className="px-5 pt-4 pb-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors" title="Home">
            <Home size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">{t('Locals', 'Địa phương', 'Locali')}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <button
                onClick={() => navigate('/profile')}
                className="p-1 rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 transition-colors"
                title={t("Profile Settings", "Cài đặt hồ sơ", "Setări Profil")}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <UserCircle size={32} />
                )}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                title={t("Sign Out", "Đăng xuất", "Ieși din cont")}
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <button
                disabled
                className="p-2 text-slate-400 bg-slate-50 rounded-full cursor-not-allowed flex items-center gap-1 text-sm font-bold pr-3 border border-slate-100"
              >
                <LogIn size={16} /> {t("Customer Login", "Đăng nhập Khách", "Autentificare Client")}
              </button>
              <button
                onClick={handleLogin}
                className="p-2 text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors flex items-center gap-1 text-sm font-bold pr-3"
              >
                <ShieldCheck size={16} /> {t("Admin", "Admin", "Admin")}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-5">
        
        {/* Coming Soon Hero */}
        <div className="bg-gradient-to-br from-brand-600 to-emerald-800 rounded-3xl p-6 text-white mb-8 shadow-lg relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-50%] w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase mb-4 border border-white/10">
              <Clock size={14} /> {t("Coming Soon", "Sắp có", "În curând")}
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">{t("Book directly with locals.", "Đặt trực tiếp với người dân địa phương.", "Rezervă direct la localnici.")}</h2>
            <p className="text-white/80 text-sm leading-relaxed max-w-[280px]">
              {t("We are building a premium service to connect you directly with trusted local guides, boutique hotels, and authentic restaurants in Vietnam.", "Chúng tôi đang xây dựng dịch vụ cao cấp để kết nối bạn trực tiếp với hướng dẫn viên tin cậy, khách sạn boutique và nhà hàng đích thực.", "Construim un serviciu premium pentru a te conecta direct cu ghizi de încredere, hoteluri boutique și restaurante autentice.")}
            </p>
          </div>
        </div>

        {/* Admin Dashboard info */}
        {user && isAdmin && (
           <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex flex-col gap-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-700 font-bold">
                  <ShieldCheck size={18} /> {t("Admin Dashboard", "Bảng điều khiển Admin", "Panou Admin")}
                </div>
                <button
                    onClick={() => setShowAddPartnerModal(true)}
                    className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform shadow-sm"
                  >
                    <Plus size={14} /> {t("Add Partner", "Thêm Đối tác", "Adaugă Partener")}
                </button>
             </div>
             <p className="text-xs text-blue-600/80">
               {t("Welcome Admin! You can add featured partners here. These will be visible to all users as previews of our upcoming service.", "Chào mừng Admin! Bạn có thể thêm đối tác nổi bật. Tất cả người dùng sẽ thấy thông tin.", "Bun venit Admin! Poți adăuga parteneri. Vor fi vizibili pentru toți utilizatorii.")}
             </p>
           </div>
        )}

        {user && !isAdmin && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-red-900 font-bold text-sm mb-1">{t("Access Restricted", "Quyền truy cập bị hạn chế", "Acces Restricționat")}</h4>
              <p className="text-xs text-red-800/80 mb-2">{t(`Your account (${user.email}) does not have administrator privileges. You cannot add or remove partners.`, `Tài khoản (${user.email}) không có quyền quản trị.`, `Contul (${user.email}) nu are privilegii de admin.`)}</p>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-full hover:bg-red-200 transition-colors"
              >
                {t("Sign Out", "Đăng xuất", "Ieși din cont")}
              </button>
            </div>
          </div>
        )}

        {!isAdmin && partners.length === 0 ? (
          <div className="bg-white border border-slate-100 text-center rounded-3xl p-8 mb-4 shadow-sm">
             <div className="bg-emerald-100/50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HeartHandshake className="text-emerald-600" size={32} />
             </div>
             <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">{t("Local Partnerships", "Đối tác địa phương", "Parteneriate Locale")}</h3>
             <p className="text-slate-500 text-sm">{t("We are currently curating the best local experiences. Check back soon for exclusive access to trusted businesses in Vietnam.", "Chúng tôi đang tuyển chọn những đặc sản địa phương tốt nhất. Hãy quay lại sớm.", "Vom adăuga în curând experiențe. Verifică din nou mai târziu.")}</p>
          </div>
        ) : (
          <div className="mb-8">
            <h3 className="font-bold text-slate-900 text-lg mb-4">{t("Book with Locals", "Đặt với người dân địa phương", "Rezervă la Localnici")}</h3>
            
            {partners.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center">
                 <HeartHandshake className="text-slate-300 mb-3" size={32} />
                 <p className="text-slate-500 font-medium text-sm">{t("No local partners yet.", "Chưa có đối tác địa phương.", "Niciun partener local încă.")}</p>
                 <p className="text-slate-400 text-xs mt-1">{t("Check back later as we onboard local businesses!", "Hãy quay lại sau khi chúng tôi hợp tác với các doanh nghiệp địa phương!", "Revino mai târziu, pe măsură ce adăugăm afaceri locale!")}</p>
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar w-full sm:-mx-5 sm:px-5">
                {partners.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col relative shrink-0 snap-start w-[85vw] max-w-[300px]"
                  >
                    <img
                      src={p.image}
                      className="w-full h-40 object-cover"
                      alt={p.name}
                    />
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="text-[10px] font-bold text-brand-500 mb-1 uppercase tracking-wider">
                        {p.type}
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1 leading-tight text-lg">
                        {p.name}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 text-balance line-clamp-3">
                        {p.description}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center gap-2">
                        {p.url && (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[13px] font-bold text-brand-600 flex items-center gap-1 w-min whitespace-nowrap hover:text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full"
                          >
                            {t("Visit Website", "Truy cập Website", "Vizitează Site-ul")} <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                    <button
                      onClick={(e) => handleRemovePartner(e, p.id)}
                      className="absolute top-3 right-3 p-2 text-red-500 bg-white/90 backdrop-blur-md rounded-full shadow-md hover:bg-red-50 border border-red-100 transition-colors"
                      title={t("Remove Partner", "Xóa đối tác", "Elimină partener")}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        )}
      </div>

       {/* Admin Add Partner Modal */}
       {showAddPartnerModal && isAdmin && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">
                {t("Add Featured Partner", "Thêm đối tác nổi bật", "Adaugă Partener Recomandat")}
              </h3>
              <button
                onClick={() => setShowAddPartnerModal(false)}
                className="p-2 bg-slate-100 rounded-full text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  {t("Partner Name", "Tên đối tác", "Nume Partener")}
                </label>
                <input
                  type="text"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  placeholder={t("e.g. Vietjet Air", "vd: Vietjet Air", "ex. Vietjet Air")}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-brand-500 bg-slate-50"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  {t("Type", "Loại", "Tip")}
                </label>
                <input
                  type="text"
                  value={newPartner.type}
                  onChange={(e) => setNewPartner({ ...newPartner, type: e.target.value })}
                  placeholder={t("e.g. Airline", "vd: Hãng hàng không", "ex. Companie aeriană")}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-brand-500 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">
                  {t("Description", "Mô tả", "Descriere")}
                </label>
                <textarea
                  value={newPartner.description}
                  onChange={(e) => setNewPartner({ ...newPartner, description: e.target.value })}
                  placeholder={t("Short description of the partner...", "Mô tả ngắn gọn về đối tác...", "Scurtă descriere a partenerului...")}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-brand-500 bg-slate-50 resize-none h-20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">
                    {t("Website URL (Optional)", "Link Website", "Link Website (Opțional)")}
                  </label>
                  <input
                    type="text"
                    value={newPartner.url}
                    onChange={(e) => setNewPartner({ ...newPartner, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-brand-500 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">
                    {t("Image URL", "Link ảnh", "Link Imagine")}
                  </label>
                  <input
                    type="text"
                    value={newPartner.image}
                    onChange={(e) => setNewPartner({ ...newPartner, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-brand-500 bg-slate-50"
                  />
                </div>
              </div>
              <button
                onClick={handleAddPartner}
                disabled={!newPartner.name}
                className="w-full bg-brand-500 text-white font-bold py-3 mt-2 flex items-center justify-center rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
              >
                {t("Save Partner", "Lưu đối tác", "Salvează Partener")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
