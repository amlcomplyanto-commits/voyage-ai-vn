import React from 'react';
import { FileText, ExternalLink, AlertCircle, Camera, CreditCard, Clock, Globe, Home } from 'lucide-react';
import { useI18n } from '../lib/i18n';
import { useNavigate } from 'react-router-dom';

export function EVisaPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 pb-24 overflow-y-auto">
      <div className="bg-brand-600 pt-12 pb-6 px-6 text-white shrink-0 relative overflow-hidden shadow-sm rounded-b-[32px]">
        <div className="absolute top-4 left-4 z-20">
          <button onClick={() => navigate('/')} className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-colors" title="Home">
            <Home size={20} />
          </button>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black flex items-center gap-2 mb-2">
            <FileText size={28} /> {t('Vietnam e-Visa', 'e-Visa Việt Nam', 'Vietnam e-Visa')}
          </h1>
          <p className="text-brand-100 text-sm">{t('Official requirements and application guidelines.', 'Yêu cầu chính thức và hướng dẫn đăng ký.', 'Cerințe oficiale și ghid de aplicare.')}</p>
        </div>
      </div>
      
      <div className="px-6 py-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-2">{t('Pre-Arrival Forms', 'Mẫu Đơn Trước Khi Đến', 'Formulare Pre-Sosire')}</h3>
          <p className="text-sm text-slate-500 mb-5">{t('Download and fill out the required entry/exit forms before you arrive to save time at the airport.', 'Tải xuống và điền các mẫu đơn xuất/nhập cảnh bắt buộc trước khi đến để tiết kiệm thời gian tại sân bay.', 'Descarcă și completează formularele de intrare/ieșire necesare înainte de a sosi pentru a economisi timp la aeroport.')}</p>
          
          <a
            href="https://prearrival.immigration.gov.vn/home-page"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 text-brand-600 rounded-xl shadow-sm">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{t('Online Pre-Arrival Form', 'Tờ Khai Trực Tuyến Trước Khi Đến', 'Formular Online Pre-Sosire')}</h4>
                <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{t('ONLINE PORTAL • OFFICIAL', 'CỔNG TRỰC TUYẾN • CHÍNH THỨC', 'PORTAL ONLINE • OFICIAL')}</p>
              </div>
            </div>
            <ExternalLink size={16} className="text-slate-400" />
          </a>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 p-2.5 rounded-2xl shrink-0">
              <Globe className="text-amber-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 mb-1">{t('Secure Official Portal', 'Cổng thông tin bảo mật', 'Portal Oficial Securizat')}</h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                {t('For your security, the Vietnam Immigration Department requires you to use their secure portal in a dedicated browser tab.', 'Để an toàn, Cục Quản lý Xuất nhập cảnh yêu cầu bạn sử dụng cổng thông tin của họ trong một tab trình duyệt mới.', 'Pentru securitatea ta, Departamentul de Imigrări din Vietnam îți cere să folosești portalul securizat într-un tab de browser dedicat.')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-lg text-slate-800 mb-5">{t('Application Guide', 'Hướng dẫn đăng ký', 'Ghid de Aplicare')}</h3>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="bg-brand-50 p-3 rounded-2xl h-fit text-brand-600">
                <Camera size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-700 text-sm mb-1">{t('1. Prepare your files', '1. Chuẩn bị giấy tờ', '1. Pregătește documentele')}</h4>
                <p className="text-sm text-slate-500">{t('A standard passport photo (no glasses) and a clear scan or picture of your passport data page (.jpg format).', 'Ảnh hộ chiếu tiêu chuẩn (không đeo kính) và bản scan/ảnh rõ nét trang thông tin hộ chiếu (định dạng .jpg).', 'O fotografie standard tip pașaport (fără ochelari) și o scanare clară a paginii cu date din pașaport (format .jpg).')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-brand-50 p-3 rounded-2xl h-fit text-brand-600">
                <CreditCard size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-700 text-sm mb-1">{t('2. Fill form & Pay', '2. Điền form & Thanh toán', '2. Completează și plătește')}</h4>
                <p className="text-sm text-slate-500">{t('Apply early and pay the 25 USD single-entry e-Visa fee.', 'Đăng ký sớm và thanh toán phí e-Visa 25 USD.', 'Aplică din timp și plătește taxa de 25 USD.')} <strong>{t('Save your registration code safely!', 'Nhớ lưu mã đăng ký cẩn thận!', 'Salvează codul de înregistrare!')}</strong></p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-brand-50 p-3 rounded-2xl h-fit text-brand-600">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-700 text-sm mb-1">{t('3. Track & Print', '3. Theo dõi & In', '3. Urmărește și Printează')}</h4>
                <p className="text-sm text-slate-500">{t('Processing typically takes 3-5 working days. Use your code to check your status, then print out your e-Visa strictly on A4 paper.', 'Xử lý thường mất 3-5 ngày làm việc. Sử dụng mã để kiểm tra và in e-Visa trên giấy khổ A4.', 'Procesarea durează de obicei 3-5 zile. Verifică statusul și printează e-Visa obligatoriu pe hârtie A4.')}</p>
              </div>
            </div>
          </div>
        </div>

        <a 
          href="https://evisa.xuatnhapcanh.gov.vn/trang-chu-ttdt" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-brand-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {t('Open Official Portal', 'Mở cổng thông tin chính thức', 'Deschide Portalul Oficial')} <ExternalLink size={20} />
        </a>

      </div>
    </div>
  );
}
