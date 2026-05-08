"use client";

import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { Loader2, PenTool, CheckSquare, Download, ArrowRight, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

export default function RiderVirtualAgreement({ rider, vehicle, contract, guarantors }: { rider: any, vehicle: any, contract: any, guarantors: any[] }) {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  
  // Prevent iOS Safari pinch-zoom & rubber-band scroll
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';
    document.head.appendChild(meta);
    document.body.style.overflow = "hidden"; // Lock background scroll
    return () => { 
      document.head.removeChild(meta); 
      document.body.style.overflow = "auto";
    };
  }, []);

  const [step, setStep] = useState(1); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [contractUrl, setContractUrl] = useState<string | null>(null);

  const riderSigCanvas = useRef<SignatureCanvas>(null);
  const witnessSigCanvas = useRef<SignatureCanvas>(null);
  const pdfContractRef = useRef<HTMLDivElement>(null);
  
  const [agreed, setAgreed] = useState(false);
  const [witnessName, setWitnessName] = useState("");
  const [witnessAddress, setWitnessAddress] = useState("");
  const [riderSig, setRiderSig] = useState<string | null>(null);
  const [witnessSig, setWitnessSig] = useState<string | null>(null);

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();
  const formattedDate = today.toLocaleDateString('en-GB');

  const g1 = guarantors[0] || {};
  const g2 = guarantors[1] || {};

  const handleSubmitAll = async () => {
    setErrorMsg("");
    if (!witnessName || !witnessAddress) return setErrorMsg("Please provide your witness's name and address.");
    if (riderSigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your signature.");
    if (witnessSigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your witness signature.");
    if (!agreed) return setErrorMsg("You must check the agreement box to proceed.");

    setIsSubmitting(true);

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

      const dataUri = await html2pdf().set({ ...opt, filename: 'HPA.pdf' }).from(pdfContractRef.current).output('datauristring');
      const pdfBase64 = dataUri.split(',')[1];

      const res = await fetch("/api/rider/sign-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64 })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process agreement.");
      
      setContractUrl(data.url);
      setStep(2);
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- THE DOCUMENT COMPONENT (Handles both UI Reading & Hidden PDF Render) ---
  const HpaDocument = ({ isPdf = false }: { isPdf?: boolean }) => {
    const textStyle = isPdf ? "text-[11px] leading-relaxed text-black font-serif text-justify" : "text-sm text-slate-light leading-relaxed font-sans text-justify";
    const headingStyle = isPdf ? "font-bold text-[12px] underline mt-6 mb-2 text-black uppercase" : "font-bold text-crisp-white text-base mt-8 border-b border-cobalt/20 pb-2 uppercase";

    return (
      <div className={textStyle}>
        
        {/* LETTERHEAD */}
        <div className={`text-center ${isPdf ? "border-b-2 border-[#001232] pb-4 mb-6" : "border-b border-cobalt/30 pb-6 mb-8"}`}>
          <h1 className={`${isPdf ? "text-3xl text-[#001232]" : "text-3xl text-crisp-white"} font-black tracking-widest mb-1`}>
            YUSDAAM<span className="text-[#FFB902]">.</span>
          </h1>
          <p className={`${isPdf ? "text-[10px]" : "text-xs"} font-bold uppercase tracking-widest`}>YUSDAAM Autos Fleet Management Nigeria Limited</p>
          <p className={`${isPdf ? "text-[9px]" : "text-[10px] text-slate-light"} mt-1`}>RC: 9335611 | 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos | admin@yusdaamautos.com</p>
        </div>

        <h2 className={`text-center font-black uppercase ${isPdf ? "text-sm mb-6" : "text-lg text-signal-red mb-8"}`}>DRIVER/RIDER HIRE PURCHASE AGREEMENT</h2>

        <p className="mb-4"><strong>THIS AGREEMENT</strong> is made this <strong>{currentDay}</strong> day of <strong>{currentMonth}</strong>, <strong>{currentYear}</strong>.</p>

        <p className="mb-2 font-bold">BETWEEN</p>
        <p className="mb-6"><strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong>, a company duly incorporated under the Companies and Allied Matters Act (CAMA) with RC: 9335611, having its registered office at 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos, Nigeria (hereinafter referred to as the <strong>“Administrator”</strong>, acting as the lawful Attorney for the Asset Owner), of the first part;</p>

        <p className="mb-2 font-bold">AND</p>
        <p className="mb-6"><strong>{rider?.firstName} {rider?.lastName}</strong>, NIN: {rider?.nin}, residing at {rider?.streetAddress}, Email: {rider?.email || "N/A"}, Phone: {rider?.phoneNumber} (hereinafter referred to as the <strong>“Driver/Rider”</strong>), of the second part;</p>
        
        <p className="mb-2 font-bold">AND</p>
        <p className="mb-8"><strong>THE GUARANTORS</strong>, whose names, addresses, and details are expressly set out in Clause 7 of this Agreement (hereinafter referred to as the <strong>"Guarantors"</strong>), of the third part.</p>

        <h3 className={headingStyle}>RECITALS</h3>
        <p className="mb-2 font-bold">WHEREAS:</p>
        <ul className="list-[upper-alpha] pl-5 mb-8 space-y-2">
          <li>The Administrator manages commercial transport vehicles on behalf of legitimate asset owners via a legally executed Power of Attorney.</li>
          <li>The Driver/Rider desires to hire, and ultimately purchase, the commercial transport asset described herein under a weekly remittance structure.</li>
          <li>The Guarantors have agreed to stand as full financial and legal sureties for the Driver/Rider, guaranteeing the Driver/Rider’s performance, payments, and good conduct under this Agreement.</li>
          <li>The Parties have agreed to the terms of hire and conditional purchase as set out below.</li>
        </ul>

        <p className="mb-4 font-bold uppercase bg-gray-100 p-2 text-black border border-gray-300 inline-block">NOW, THEREFORE, IT IS HEREBY AGREED AS FOLLOWS:</p>

        <h3 className={headingStyle}>1. THE ASSET</h3>
        <p className="mb-2">1.1 The Administrator hereby agrees to let, and the Driver/Rider agrees to hire, the following commercial transport vehicle (the <strong>"Asset"</strong>):</p>
        <ul className={`list-none pl-6 mb-8 space-y-1 ${isPdf ? "font-mono text-[10px] p-4 bg-gray-50 border border-gray-300" : "font-mono bg-void-navy/50 p-4 rounded-lg"}`}>
          <li><strong>Asset Type:</strong> {vehicle?.type || "N/A"}</li>
          <li><strong>Make/Model:</strong> {vehicle?.makeModel || "N/A"}</li>
          <li><strong>Year of Manufacture:</strong> {vehicle?.year || "N/A"}</li>
          <li><strong>Engine Number:</strong> {vehicle?.engineNumber || "N/A"}</li>
          <li><strong>Chassis Number:</strong> {vehicle?.chassisNumber || "N/A"}</li>
          <li><strong>Registration/Plate Number:</strong> {vehicle?.registrationNumber || "N/A"}</li>
        </ul>

        <h3 className={headingStyle}>2. FINANCIAL TERMS AND REMITTANCE</h3>
        <p className="mb-2">2.1 <strong>Total Hire Purchase Price:</strong> The total sum payable by the Driver/Rider to acquire ownership of the Asset is <strong>₦{contract?.totalPrice?.toLocaleString() || "---"}</strong>.</p>
        <p className="mb-2">2.2 <strong>Initial Deposit:</strong> The Driver/Rider has paid a non-refundable initial commitment deposit of <strong>₦{contract?.initialDeposit?.toLocaleString() || "0"}</strong>.</p>
        <p className="mb-2">2.3 <strong>Weekly Remittance:</strong> The Driver/Rider shall pay a fixed sum of <strong>₦{contract?.weeklyRemittance?.toLocaleString() || "---"}</strong> every week directly into the Administrator’s designated Client Remittance Account.</p>
        <p className="mb-2">2.4 <strong>Payment Schedule:</strong> Payments must be made no later than <strong>{contract?.paymentDay || "Friday 11:59 PM"}</strong> of every week. Payments made to unauthorized staff or third parties will not be recognized.</p>
        <p className="mb-6">2.5 <strong>Tenure:</strong> The expected duration is <strong>{contract?.agreedDurationMonths ? contract.agreedDurationMonths * 4 : "---"}</strong> weeks, concluding when the Total Hire Purchase Price is fully paid.</p>

        <h3 className={headingStyle}>3. DRIVER/RIDER’S OBLIGATIONS AND RISK</h3>
        <p className="mb-2">3.1 <strong>Absolute Risk:</strong> The Driver/Rider assumes 100% financial and operational risk for the Asset from the moment of handover. The Administrator makes no warranties regarding the mechanical longevity of the Asset.</p>
        <p className="mb-2">3.2 <strong>Maintenance & Repairs:</strong> The Driver/Rider shall be solely responsible for the cost of all mechanical repairs, routine maintenance, servicing, and breakdowns.</p>
        <p className="mb-2">3.3 <strong>Uninterrupted Remittance:</strong> Mechanical failure, illness, traffic delays, or vehicle impoundment shall not exempt the Driver/Rider from their obligation to pay the Weekly Remittance as and when due.</p>
        <p className="mb-2">3.4 <strong>Illegal Usage & Contraband:</strong> The Driver/Rider shall not use the Asset for any unlawful activity, including but not limited to smuggling, kidnapping, robbery, or transporting contraband. Any such use immediately nullifies this Agreement and invites law enforcement action.</p>
        <p className="mb-6">3.5 <strong>GPS & Telematics:</strong> A GPS tracking device is actively installed on the Asset. Tampering with, disconnecting, obscuring, or damaging the GPS tracker is considered an act of theft, resulting in immediate repossession and criminal prosecution.</p>

        <h3 className={headingStyle}>4. ADMINISTRATOR’S RIGHTS AND REPOSSESSION</h3>
        <p className="mb-2">4.1 <strong>Ownership Retention:</strong> The Asset remains the absolute property of the Asset Owner (managed by the Administrator) until the Total Hire Purchase Price is remitted. The Driver/Rider is merely a "Hirer" and cannot sell, lease, pawn, or use the Asset as collateral.</p>
        <p className="mb-2">4.2 <strong>Right of Repossession:</strong> The Administrator reserves the right to forcefully recover and repossess the Asset without prior court order, legal notice, or liability for trespass if:</p>
        <ul className="list-disc pl-8 mb-2 space-y-1">
          <li>The Driver/Rider defaults on the Weekly Remittance for seven (7) consecutive days.</li>
          <li>The Driver/Rider tampers with the GPS tracker.</li>
          <li>The Asset is found to be abandoned, grossly abused, or mechanically neglected.</li>
        </ul>
        <p className="mb-6">4.3 <strong>Absolute Forfeiture:</strong> In the event of repossession due to any default or breach of contract, all previous payments made by the Driver/Rider shall be legally classified as standard rental fees for the prior use of the Asset and shall not be refunded under any circumstances.</p>

        <h3 className={headingStyle}>5. GUARANTORS’ STRICT LIABILITY AND UNDERTAKING</h3>
        <p className="mb-4">The Guarantors, having previously executed their Sworn Attestations, are legally bound to this Agreement as Primary Obligors. By acting as sureties, the Guarantors acknowledge and explicitly agree to the following strict liabilities:</p>
        <p className="mb-2">5.1 <strong>Joint and Several Liability:</strong> The Guarantors are equally and fully liable alongside the Driver/Rider for the Total Hire Purchase Price and any outstanding debt.</p>
        <p className="mb-2">5.2 <strong>Asset Theft and Damage:</strong> In the event the Asset is stolen, severely damaged, crashed, or vandalized, and the Driver/Rider is unable or unwilling to cover the costs, the Guarantors shall bear the absolute financial burden of repair or full replacement of the Asset.</p>
        <p className="mb-2">5.3 <strong>Duty to Produce the Rider:</strong> Should the Driver/Rider abscond with the Asset or evade weekly remittances, the Guarantors are legally obligated to physically produce the Driver/Rider to the Administrator or disclose the exact location of the Asset.</p>
        <p className="mb-6">5.4 <strong>Recovery Costs:</strong> If the Administrator is forced to employ asset recovery agents, legal counsel, or law enforcement to trace an absconded Driver/Rider, all tracking, legal, and recovery expenses shall be billed directly to the Guarantors.</p>

        <h3 className={headingStyle}>6. GENERAL PROVISIONS</h3>
        <p className="mb-2">6.1 <strong>Transfer of Ownership:</strong> Upon the complete and timely payment of the Total Hire Purchase Price, the Administrator shall issue a Letter of Completion and facilitate the Change of Ownership Form transferring full legal ownership to the Driver/Rider.</p>
        <p className="mb-2">6.2 <strong>Severability:</strong> If any provision of this Agreement is found to be unenforceable by a court, the remaining provisions shall remain in full force and effect.</p>
        <p className="mb-6">6.3 <strong>Jurisdiction:</strong> This Agreement shall be governed by the laws of the Federal Republic of Nigeria. Any dispute shall be subject to the exclusive jurisdiction of the Courts of Lagos State.</p>

        {isPdf && <div style={{ pageBreakBefore: 'always', paddingTop: '20px' }}></div>}

        <h3 className={headingStyle}>7. GUARANTORS' EXECUTION</h3>
        <div className={`mb-8 p-4 ${isPdf ? "border border-black bg-gray-50" : "border border-cobalt/30 bg-void-navy/50"}`}>
          <p className="text-[10px] italic mb-4">The Guarantors below have previously executed Sworn Guarantor Attestations digitally. Their IP addresses, identity documents, and digital signatures are verified and held by the Administrator.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="font-bold text-xs underline mb-1">FIRST GUARANTOR</p>
              <ul className="list-none pl-0 mb-2 space-y-1 text-xs">
                <li>Name: {g1?.firstName || "N/A"} {g1?.lastName || "N/A"}</li>
                <li>NIN: {g1?.nin || "N/A"} | Phone: {g1?.phone || "N/A"}</li>
              </ul>
              <div className="flex items-end gap-2 mb-1 h-12">
                <span className="text-xs">Signature:</span>
                {g1?.signatureUrl ? <img src={g1.signatureUrl} alt="G1 Sig" className="h-10 object-contain" /> : <span className="border-b border-black w-24 inline-block"></span>}
              </div>
              <p className="text-[10px]">Signed: {g1?.signedAt ? new Date(g1.signedAt).toLocaleDateString('en-GB') : "N/A"}</p>
            </div>
            <div>
              <p className="font-bold text-xs underline mb-1">SECOND GUARANTOR</p>
              <ul className="list-none pl-0 mb-2 space-y-1 text-xs">
                <li>Name: {g2?.firstName || "N/A"} {g2?.lastName || "N/A"}</li>
                <li>NIN: {g2?.nin || "N/A"} | Phone: {g2?.phone || "N/A"}</li>
              </ul>
              <div className="flex items-end gap-2 mb-1 h-12">
                <span className="text-xs">Signature:</span>
                {g2?.signatureUrl ? <img src={g2.signatureUrl} alt="G2 Sig" className="h-10 object-contain" /> : <span className="border-b border-black w-24 inline-block"></span>}
              </div>
              <p className="text-[10px]">Signed: {g2?.signedAt ? new Date(g2.signedAt).toLocaleDateString('en-GB') : "N/A"}</p>
            </div>
          </div>
        </div>

        <h3 className={headingStyle}>8. SIGNATURES</h3>
        <p className="mb-6">IN WITNESS WHEREOF, the Parties hereto have executed this Agreement on the day and year first above written.</p>
        
        <div className={`grid grid-cols-2 gap-10 mt-6 ${isPdf ? "mb-10" : "mb-8"}`}>
          <div>
            <p className="font-bold mb-4">SIGNED by the ADMINISTRATOR</p>
            <div className="relative h-16 w-48 mb-2">
               <img src="/images/stamp.png" alt="Company Seal" className="absolute left-0 -top-2 h-20 opacity-80 object-contain" />
               <div className={`absolute bottom-0 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
            </div>
            <p className="font-bold text-xs mt-1">Yussuf Dare Orelaja (MD)</p>
            <p className={`mt-1 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>Date: {formattedDate}</p>
          </div>

          <div>
            <p className="font-bold mb-4">SIGNED by the DRIVER/RIDER</p>
            <div className="relative h-16 w-48 mb-2">
              {riderSig ? (
                <img src={riderSig} alt="Rider Signature" className={`absolute left-0 bottom-0 h-16 object-contain ${!isPdf ? "bg-white p-1 rounded" : "mix-blend-multiply"}`} />
              ) : (
                <div className={`absolute bottom-0 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
              )}
            </div>
            <p className="font-bold text-xs uppercase">Name: {rider?.firstName} {rider?.lastName}</p>
            <p className={`mt-1 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>Date: {formattedDate}</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="font-bold underline text-xs mb-4">IN THE PRESENCE OF INDEPENDENT WITNESS:</p>
          <p className={isPdf ? "text-xs" : "text-xs text-slate-light"}>Name: {witnessName || "______________________"}</p>
          <p className={isPdf ? "text-[10px] mt-1" : "text-xs text-slate-light mt-1"}>Address: {witnessAddress || "______________________"}</p>
          
          <div className="relative h-12 mt-4 w-48">
             <span className={isPdf ? "text-xs absolute bottom-0 left-0" : "text-xs text-slate-light absolute bottom-0 left-0"}>Signature:</span>
             {witnessSig ? (
               <img src={witnessSig} alt="Witness Signature" className={`absolute left-16 bottom-0 h-12 object-contain ${!isPdf ? "bg-white p-1 rounded" : "mix-blend-multiply"}`} />
             ) : (
               <div className={`absolute bottom-0 left-14 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
             )}
          </div>
          <p className={`mt-2 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>Date: {formattedDate}</p>
        </div>

      </div>
    );
  };

  // --- STEP 2: SUCCESS VIEW ---
  if (step === 2) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-void-navy/95 backdrop-blur-md p-4 h-screen w-screen overflow-y-auto">
        <div className="max-w-3xl mx-auto bg-void-light/5 border border-emerald-500/30 p-8 sm:p-12 rounded-2xl text-center shadow-2xl animate-in fade-in zoom-in duration-500 w-full my-auto">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-wider text-crisp-white mb-2">Agreement Executed</h2>
          <p className="text-slate-light leading-relaxed mb-10">
            Your digital signature has been permanently attached to the legal document. Your dashboard is now unlocked.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {contractUrl && (
              <a href={`${contractUrl}?fl_attachment=YUSDAAM_HPA_${rider.firstName}_${rider.lastName}.pdf`} download className="flex items-center justify-center gap-2 px-6 py-4 bg-void-navy border border-cobalt/30 text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-void-light/10 transition">
                <Download size={16} /> Download Agreement
              </a>
            )}
            <button onClick={() => router.refresh()} className="flex items-center justify-center gap-2 px-6 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition shadow-lg">
              Access Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 1: UI VIEW ---
  return (
    <div className="fixed inset-0 z-[100] bg-void-navy/95 backdrop-blur-md overflow-y-auto h-screen w-screen px-2 sm:px-6 py-10">
      <div ref={topRef} className="max-w-5xl mx-auto bg-void-light/5 border border-cobalt/30 rounded-xl shadow-2xl animate-in slide-in-from-bottom-8 duration-500 w-full overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-void-navy p-6 border-b border-cobalt/30 flex items-center gap-4 shrink-0 shadow-md">
          <ShieldCheck size={32} className="text-signal-red shrink-0" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-crisp-white uppercase tracking-wider">Pending Legal Execution</h2>
            <p className="text-[10px] sm:text-xs text-slate-light font-bold uppercase tracking-widest">Read and sign below to unlock your dashboard.</p>
          </div>
        </div>

        {/* 1. Document Reader */}
        <div className="p-6 sm:p-12 bg-void-navy/50">
          <HpaDocument isPdf={false} />
        </div>

        {/* 2. Form Inputs */}
        <div className="p-6 sm:p-12 border-t border-cobalt/30 bg-void-navy">
          {errorMsg && <p className="text-signal-red text-sm font-bold mb-6 bg-signal-red/10 border border-signal-red/20 p-4 rounded-lg">{errorMsg}</p>}
          
          {/* Witness Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-void-light/5 border border-cobalt/20 rounded-xl">
            <div className="md:col-span-2"><h4 className="font-bold uppercase tracking-wider text-cobalt text-sm">Independent Witness</h4></div>
            <div>
              <label className="block text-[10px] font-bold text-slate-light uppercase tracking-widest mb-2">Witness Full Name</label>
              <input type="text" value={witnessName} onChange={(e) => setWitnessName(e.target.value)} className="w-full bg-void-navy border border-cobalt/30 rounded-lg px-4 py-3 text-sm text-crisp-white focus:outline-none focus:border-cobalt" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-light uppercase tracking-widest mb-2">Witness Address</label>
              <input type="text" value={witnessAddress} onChange={(e) => setWitnessAddress(e.target.value)} className="w-full bg-void-navy border border-cobalt/30 rounded-lg px-4 py-3 text-sm text-crisp-white focus:outline-none focus:border-cobalt" placeholder="123 Example Street, Lagos" />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-light uppercase tracking-widest mb-2"><PenTool size={12} /> Draw Witness Signature</label>
              {/* WHITE BACKGROUND FOR CANVAS */}
              <div className="bg-white rounded-lg border-2 border-cobalt/30 overflow-hidden shadow-inner">
                <SignatureCanvas ref={witnessSigCanvas} clearOnResize={false} penColor="#001232" canvasProps={{ className: "w-full h-40 cursor-crosshair" }} onEnd={() => setWitnessSig(witnessSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || null)} />
              </div>
              <div className="flex justify-end mt-2">
                <button type="button" onClick={() => { witnessSigCanvas.current?.clear(); setWitnessSig(null); }} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red">Clear Witness Canvas</button>
              </div>
            </div>
          </div>

          {/* Rider Signature */}
          <div className="mb-6 p-6 bg-signal-red/5 border border-signal-red/20 rounded-xl">
            <label className="flex items-center gap-2 text-xs font-bold text-signal-red uppercase tracking-widest mb-3"><PenTool size={14} /> Draw Your Signature</label>
            {/* WHITE BACKGROUND FOR CANVAS */}
            <div className="bg-white rounded-lg border-2 border-signal-red/30 overflow-hidden shadow-inner">
              <SignatureCanvas ref={riderSigCanvas} clearOnResize={false} penColor="#001232" canvasProps={{ className: "w-full h-40 cursor-crosshair" }} onEnd={() => setRiderSig(riderSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || null)} />
            </div>
            <div className="flex justify-end mt-2">
              <button type="button" onClick={() => { riderSigCanvas.current?.clear(); setRiderSig(null); }} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red">Clear Canvas</button>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer mb-8 group">
            <input type="checkbox" className="mt-1 w-4 h-4 accent-signal-red cursor-pointer" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span className="text-xs text-slate-light leading-relaxed group-hover:text-crisp-white transition">I, {rider.firstName} {rider.lastName}, acknowledge that checking this box and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.</span>
          </label>

          <button onClick={handleSubmitAll} disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition shadow-lg disabled:opacity-50">
            {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing Agreement...</> : <><CheckSquare size={16} /> Submit & Execute Agreement</>}
          </button>
        </div>

        {/* Hidden Render for PDF Generation */}
        <div className="hidden">
          <div ref={pdfContractRef} className="bg-white p-12 w-[800px]"><HpaDocument isPdf={true} /></div>
        </div>

      </div>
    </div>
  );
}
