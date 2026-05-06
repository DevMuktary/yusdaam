"use client";

import { useState, useRef } from "react";
import { FileText, FileBadge, CheckCircle2, Download, Loader2 } from "lucide-react";

interface VaultProps {
  isExecuted: boolean;
  executionDate: string;
  ownerSignature: string | null;
  agreementData: {
    ownerName: string;
    bvn: string;
    nin: string;
    ownerAddress: string;
    ownerEmail: string;
    ownerPhone: string;
    ownerId: string;
    vehicleType: string;
    makeModel: string;
    year: string;
    engineNo: string;
    chassisNo: string;
    plateNo: string;
    targetWeeklyRemittance: string;
    ownerBank: string;
    ownerAcctNo: string;
  };
}

export default function VaultDocumentManager({ isExecuted, executionDate, ownerSignature, agreementData }: VaultProps) {
  const hpaContractRef = useRef<HTMLDivElement>(null);
  const poaContractRef = useRef<HTMLDivElement>(null);
  const [isDownloadingHpa, setIsDownloadingHpa] = useState(false);
  const [isDownloadingPoa, setIsDownloadingPoa] = useState(false);

  const fallback = "[Pending Admin Input]";
  const today = new Date(executionDate !== "Pending" ? executionDate : Date.now());
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();
  const formattedDate = today.toLocaleDateString();

  const handleDownloadPDF = async (ref: React.RefObject<HTMLDivElement>, filename: string, setLoader: (val: boolean) => void) => {
    if (!ref.current) return;
    setLoader(true);
    try {
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      const pdfBlob = await html2pdf().set(opt).from(ref.current).output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("PDF Generation failed", error);
    } finally {
      setLoader(false);
    }
  };

  const SharedHeader = () => (
    <div className="text-center border-b-2 border-[#001232] pb-4 mb-6">
      <h1 className="text-3xl text-[#001232] font-black tracking-widest mb-1">
        YUSDAAM<span className="text-[#FFB902]">.</span>
      </h1>
      <p className="text-[10px] font-bold uppercase tracking-widest">YUSDAAM Autos Fleet Management Nigeria Limited</p>
      <p className="text-[9px] mt-1">RC: 9335611 | 18, Alhaji Olakunle Close Selewu Teacher's Quater Igbogbo Ikorodu Lagos. | admin@yusdaamautos.com</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* HPA Document Card */}
      <div className="bg-void-navy/50 border border-cobalt/30 p-6 rounded-xl hover:bg-void-light/5 transition duration-300 shadow-md group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-void-dark rounded-lg border border-cobalt/20 group-hover:border-signal-red/30 transition">
            <FileText size={24} className="text-cobalt group-hover:text-signal-red transition" />
          </div>
          {isExecuted ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
              <CheckCircle2 size={12} /> Executed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
              Pending
            </span>
          )}
        </div>
        <h4 className="text-lg font-black text-crisp-white mb-1">Hire Purchase Administration Agreement</h4>
        <p className="text-xs text-slate-light mb-6">Governs the strict financial and operational management of your assigned fleet.</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-cobalt/20">
          <p className="text-[10px] text-slate-light font-mono uppercase tracking-widest">Dated: {executionDate}</p>
          <button 
            onClick={() => handleDownloadPDF(hpaContractRef, `HPA_Agreement_${agreementData.ownerName.replace(/\s+/g, '_')}`, setIsDownloadingHpa)} 
            disabled={!isExecuted || isDownloadingHpa} 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-signal-red hover:text-crisp-white transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isDownloadingHpa ? <><Loader2 size={14} className="animate-spin" /> Generating</> : <><Download size={14} /> Download PDF</>}
          </button>
        </div>
      </div>

      {/* POA Document Card */}
      <div className="bg-void-navy/50 border border-cobalt/30 p-6 rounded-xl hover:bg-void-light/5 transition duration-300 shadow-md group">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-void-dark rounded-lg border border-cobalt/20 group-hover:border-signal-red/30 transition">
            <FileBadge size={24} className="text-cobalt group-hover:text-signal-red transition" />
          </div>
          {isExecuted ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
              <CheckCircle2 size={12} /> Executed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
              Pending
            </span>
          )}
        </div>
        <h4 className="text-lg font-black text-crisp-white mb-1">Specific Power of Attorney</h4>
        <p className="text-xs text-slate-light mb-6">Grants YUSDAAM the legal authority to sign riders, enforce GPS rules, and execute repossessions.</p>
        
        <div className="flex items-center justify-between pt-4 border-t border-cobalt/20">
          <p className="text-[10px] text-slate-light font-mono uppercase tracking-widest">Dated: {executionDate}</p>
          <button 
            onClick={() => handleDownloadPDF(poaContractRef, `POA_Agreement_${agreementData.ownerName.replace(/\s+/g, '_')}`, setIsDownloadingPoa)} 
            disabled={!isExecuted || isDownloadingPoa} 
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-signal-red hover:text-crisp-white transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isDownloadingPoa ? <><Loader2 size={14} className="animate-spin" /> Generating</> : <><Download size={14} /> Download PDF</>}
          </button>
        </div>
      </div>

      {/* HIDDEN RENDERS FOR PDF EXPORT */}
      <div className="hidden">
        {/* HPA PDF */}
        <div ref={hpaContractRef} className="bg-white p-12 w-[800px] text-[11px] leading-relaxed text-black font-serif">
          <SharedHeader />
          <h2 className="text-center font-black uppercase text-sm mb-6">HIRE PURCHASE ADMINISTRATION AGREEMENT</h2>
          <p className="mb-4"><strong>THIS AGREEMENT</strong> is made this <strong>{currentDay}</strong> day of <strong>{currentMonth}</strong>, <strong>{currentYear}</strong>.</p>
          <p className="mb-2 font-bold">BETWEEN</p>
          <p className="mb-6"><strong>YUSDAAM AUTOS FLEET MANAGEMENT NIGERIA LIMITED</strong>, ... (hereinafter referred to as the <strong>“Administrator”</strong>) of the first part;</p>
          <p className="mb-2 font-bold">AND</p>
          <p className="mb-6"><strong>{agreementData.ownerName}</strong>, BVN: {agreementData.bvn || fallback}, NIN: {agreementData.nin || fallback}, residing at {agreementData.ownerAddress || fallback}, Email: {agreementData.ownerEmail}, Phone: {agreementData.ownerPhone} (hereinafter referred to as the <strong>“Owner”</strong>) of the second part.</p>
          
          <h3 className="font-bold text-[12px] underline mt-6 mb-2 text-black uppercase">2. APPOINTMENT AND ASSET DESCRIPTION</h3>
          <ul className="list-disc pl-5 mb-4 space-y-1 font-mono text-[10px]">
            <li><strong>Owner ID:</strong> {agreementData.ownerId}</li>
            <li><strong>Asset Type:</strong> {agreementData.vehicleType || fallback}</li>
            <li><strong>Registration/Plate Number:</strong> {agreementData.plateNo || fallback}</li>
            <li><strong>Target Weekly:</strong> ₦{agreementData.targetWeeklyRemittance || fallback}</li>
          </ul>

          <div className="grid grid-cols-2 gap-10 mt-12 pt-8 border-t border-gray-300">
            <div>
              <p className="font-bold mb-6">SIGNED by the within-named ADMINISTRATOR</p>
              <div className="relative h-20 w-48 mt-4 mb-2">
                 <img src="/images/stamp.png" alt="Company Seal" className="absolute left-0 -top-4 h-24 opacity-80 object-contain" />
                 <div className="absolute bottom-0 w-full border-b border-black"></div>
              </div>
              <p className="font-bold text-xs">Name: Yussuf Dare Orelaja</p>
              <p className="text-xs">Designation: Managing Director</p>
              <p className="text-xs mt-2">Date: {formattedDate}</p>
            </div>
            <div>
              <p className="font-bold mb-6">SIGNED by the within-named OWNER</p>
              <div className="relative h-20 w-48 mt-4 mb-2">
                {ownerSignature ? (
                  <img src={ownerSignature} alt="Owner Signature" className="absolute left-0 bottom-0 h-20 object-contain" />
                ) : <div className="absolute bottom-0 w-full border-b border-black"></div>}
              </div>
              <p className="font-bold text-xs uppercase">Name: {agreementData.ownerName}</p>
              <p className="text-xs mt-2">Date: {formattedDate}</p>
            </div>
          </div>
        </div>

        {/* POA PDF */}
        <div ref={poaContractRef} className="bg-white p-12 w-[800px] text-[11px] leading-relaxed text-black font-serif">
          <SharedHeader />
          <h2 className="text-center font-black uppercase text-sm mb-8">SPECIFIC POWER OF ATTORNEY</h2>
          <p className="mb-6 leading-relaxed">
            <strong>KNOW ALL MEN BY THESE PRESENTS</strong> that I, <strong>{agreementData.ownerName}</strong>, of {agreementData.ownerAddress || fallback}, holding BVN {agreementData.bvn || fallback} and NIN {agreementData.nin || fallback} (hereinafter referred to as the <strong>"Donor"</strong>), DO HEREBY APPOINT <strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong> (hereinafter referred to as the <strong>"Donee"</strong>), to be my true and lawful Attorney, to act in my name and on my behalf.
          </p>

          <div className="grid grid-cols-2 gap-10 mt-12 pt-8 border-t border-gray-300">
            <div>
              <p className="font-bold underline text-xs">SIGNED, SEALED, AND DELIVERED by the DONOR:</p>
              <div className="relative h-20 w-48 mt-4 mb-2">
                {ownerSignature ? (
                  <img src={ownerSignature} alt="Donor Signature" className="absolute left-0 bottom-0 h-20 object-contain" />
                ) : <div className="absolute bottom-0 w-full border-b border-black"></div>}
              </div>
              <p className="font-bold text-xs uppercase">Name: {agreementData.ownerName}</p>
              <p className="text-xs mt-2">Date: {formattedDate}</p>
            </div>
            <div>
              <p className="font-bold underline text-xs">ACCEPTED BY THE DONEE:</p>
              <div className="relative h-20 w-48 mt-4 mb-2">
                 <img src="/images/stamp.png" alt="Company Seal" className="absolute left-0 -top-4 h-24 opacity-80 object-contain" />
                 <div className="absolute bottom-0 w-full border-b border-black"></div>
              </div>
              <p className="font-bold text-xs">Name: Yussuf Dare Orelaja</p>
              <p className="text-xs">Designation: Managing Director</p>
              <p className="text-xs mt-2">Date: {formattedDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
