"use client";

import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { Loader2, PenTool, CheckSquare, Download, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

export default function RiderVirtualAgreement({ rider, vehicle, contract, guarantors }: { rider: any, vehicle: any, contract: any, guarantors: any[] }) {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  
  // Prevent iOS Safari pinch-zoom by injecting meta tag on mount
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
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

  // Handover Note State
  const [handoverData, setHandoverData] = useState({
    fuelLevel: "",
    frontBumper: "",
    rearBumper: "",
    leftSide: "",
    rightSide: "",
    windshield: "",
    interior: "",
    acStatus: "",
    keys: false,
    spareTire: false,
    jack: false,
    cCaution: false,
    extinguisher: false,
    documents: false,
  });

  const handleCheckbox = (field: string) => {
    setHandoverData(prev => ({ ...prev, [field]: !(prev as any)[field] }));
  };

  const handleRadio = (field: string, value: string) => {
    setHandoverData(prev => ({ ...prev, [field]: value }));
  };

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();
  const formattedDate = today.toLocaleDateString('en-GB');

  const g1 = guarantors[0] || {};
  const g2 = guarantors[1] || {};

  const handleSubmitAll = async () => {
    setErrorMsg("");
    if (!handoverData.fuelLevel) return setErrorMsg("Please select the fuel level in the handover note.");
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
    const textStyle = isPdf ? "text-[11px] leading-relaxed text-black font-serif" : "text-sm text-slate-light leading-relaxed font-sans";
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
        <p className="mb-6"><strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong>, a company duly incorporated under the Companies and Allied Matters Act (CAMA) with RC: 9335611, having its registered office at 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos, Nigeria (hereinafter referred to as the <strong>“Administrator”</strong>), of the first part;</p>

        <p className="mb-2 font-bold">AND</p>
        <p className="mb-6"><strong>{rider?.firstName} {rider?.lastName}</strong>, NIN: {rider?.nin}, residing at {rider?.streetAddress}, Email: {rider?.email || "N/A"}, Phone: {rider?.phoneNumber} (hereinafter referred to as the <strong>“Driver/Rider”</strong>), of the second part;</p>
        
        <p className="mb-2 font-bold">AND</p>
        <p className="mb-8"><strong>THE GUARANTORS</strong>, whose names, addresses, and details are expressly set out in Clause 9 of this Agreement (hereinafter referred to as the <strong>"Guarantors"</strong>), of the third part.</p>

        <h3 className={headingStyle}>RECITALS</h3>
        <p className="mb-2 font-bold">WHEREAS:</p>
        <ul className="list-[upper-alpha] pl-5 mb-8 space-y-2">
          <li>The Administrator manages commercial transport vehicles on behalf of legitimate asset owners via a legally executed Power of Attorney.</li>
          <li>The Driver/Rider desires to hire, and ultimately purchase, the commercial transport asset described herein under a weekly remittance structure.</li>
          <li>The Guarantors have agreed to stand as full financial and legal sureties for the Driver/Rider, guaranteeing the Driver/Rider’s performance, payments, and good conduct under this Agreement.</li>
          <li>The Parties have agreed to the terms of hire and conditional purchase as set out below.</li>
        </ul>

        <p className="mb-4 font-bold">NOW, THEREFORE, IT IS HEREBY AGREED AS FOLLOWS:</p>

        <h3 className={headingStyle}>1. THE ASSET</h3>
        <p className="mb-2">1.1 The Administrator hereby agrees to let, and the Driver/Rider agrees to hire, the following commercial transport vehicle (the <strong>"Asset"</strong>):</p>
        <ul className={`list-disc pl-5 mb-4 space-y-1 ${isPdf ? "font-mono text-[10px]" : "font-mono bg-void-navy/50 p-4 rounded-lg"}`}>
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
        <p className="mb-2">2.4 <strong>Payment Schedule:</strong> Payments must be made no later than <strong>{contract?.paymentDay || "Friday 11:59 PM"}</strong> of every week.</p>
        <p className="mb-6">2.5 <strong>Tenure:</strong> The expected duration is <strong>{contract?.agreedDurationMonths ? contract.agreedDurationMonths * 4 : "---"}</strong> weeks, concluding when the Total Hire Purchase Price is fully paid.</p>

        <h3 className={headingStyle}>3. DRIVER/RIDER’S OBLIGATIONS AND RISK</h3>
        <p className="mb-2">3.1 <strong>Risk and Maintenance:</strong> The Driver/Rider assumes 100% financial and operational risk for the Asset from the moment of handover.</p>
        <p className="mb-2">3.2 <strong>Accident Damage:</strong> In the event of an accident, the Driver/Rider and/or their Guarantors shall bear the full cost of repairing the Asset.</p>
        <p className="mb-2">3.3 <strong>Uninterrupted Remittance:</strong> Mechanical failure, illness, or traffic delays shall not exempt the Driver/Rider from their obligation to pay the Weekly Remittance.</p>
        <p className="mb-6">3.4 <strong>GPS Tracker:</strong> The Driver/Rider acknowledges that a GPS tracking device is installed on the Asset. Tampering with, disconnecting, or damaging the GPS tracker is a fundamental breach of this Agreement and will result in immediate repossession.</p>

        <h3 className={headingStyle}>4. ADMINISTRATOR’S RIGHTS AND REPOSSESSION</h3>
        <p className="mb-2">4.1 <strong>Ownership:</strong> The Asset remains the absolute property of the Asset Owner until the Total Hire Purchase Price is fully paid.</p>
        <p className="mb-2">4.2 <strong>Default and Repossession:</strong> The Administrator reserves the right to forcefully repossess the Asset without prior court order if the Driver/Rider defaults on the Weekly Remittance for 7 consecutive days, tampers with the GPS, or uses the Asset for illegal activities.</p>
        <p className="mb-6">4.3 <strong>Forfeiture:</strong> In the event of repossession due to default, all previous payments made by the Driver/Rider shall be treated as standard rental fees and shall not be refunded.</p>

        <h3 className={headingStyle}>5. TRANSFER OF OWNERSHIP</h3>
        <p className="mb-6">5.1 Upon the complete and timely payment of the Total Hire Purchase Price, the Administrator shall facilitate the Change of Ownership Form transferring full legal ownership to the Driver/Rider.</p>

        <h3 className={headingStyle}>6. GUARANTORS’ UNDERTAKING AND LIABILITY</h3>
        <p className="mb-6">6.1 If the Driver/Rider absconds, damages the Asset, defaults on the Weekly Remittance, or abandons the Asset, the Administrator shall have the legal right to pursue the Guarantors for the recovery of the Asset, outstanding monetary balances, and any repair costs incurred.</p>

        {isPdf && <div style={{ pageBreakBefore: 'always', paddingTop: '20px' }}></div>}

        <h3 className={headingStyle}>7. SIGNATURES</h3>
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
              {riderSig && isPdf ? (
                <img src={riderSig} alt="Rider Signature" className="absolute left-0 bottom-0 h-16 object-contain" />
              ) : (
                <div className={`absolute bottom-0 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
              )}
            </div>
            <p className="font-bold text-xs uppercase">Name: {rider?.firstName} {rider?.lastName}</p>
            <p className={`mt-1 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>Date: {formattedDate}</p>
          </div>
        </div>

        <h3 className={headingStyle}>8. GUARANTORS' EXECUTION</h3>
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

        <div className="mb-8">
          <p className="font-bold underline text-xs mb-4">IN THE PRESENCE OF INDEPENDENT WITNESS:</p>
          <p className={isPdf ? "text-xs" : "text-xs text-slate-light"}>Name: {witnessName || "______________________"}</p>
          <p className={isPdf ? "text-[10px] mt-1" : "text-xs text-slate-light mt-1"}>Address: {witnessAddress || "______________________"}</p>
          
          <div className="relative h-12 mt-4 w-48">
             <span className={isPdf ? "text-xs absolute bottom-0 left-0" : "text-xs text-slate-light absolute bottom-0 left-0"}>Signature:</span>
             {witnessSig && isPdf ? (
               <img src={witnessSig} alt="Witness Signature" className="absolute left-16 bottom-0 h-12 object-contain" />
             ) : (
               <div className={`absolute bottom-0 left-14 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
             )}
          </div>
          <p className={`mt-2 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>Date: {formattedDate}</p>
        </div>

        {isPdf && <div style={{ pageBreakBefore: 'always', paddingTop: '20px' }}></div>}

        {/* VEHICLE HANDOVER NOTE */}
        <div className={`${isPdf ? "mt-0" : "mt-12 pt-8 border-t border-cobalt/30"}`}>
          <h2 className={`text-center font-black uppercase ${isPdf ? "text-sm mb-6" : "text-lg text-signal-red mb-8"}`}>VEHICLE HANDOVER & CONDITION NOTE</h2>
          
          <div className="mb-6">
            <p><strong>Asset:</strong> {vehicle?.makeModel || "N/A"} ({vehicle?.registrationNumber || "N/A"})</p>
            <p><strong>Handover Date:</strong> {formattedDate}</p>
          </div>

          <h3 className={headingStyle}>CONDITION CHECKLIST</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
            <p>Fuel Level: <strong>{handoverData.fuelLevel || "N/A"}</strong></p>
            <p>Air Conditioning: <strong>{handoverData.acStatus || "N/A"}</strong></p>
            <p>Front Bumper: <strong>{handoverData.frontBumper || "N/A"}</strong></p>
            <p>Rear Bumper: <strong>{handoverData.rearBumper || "N/A"}</strong></p>
            <p>Left Side Panels: <strong>{handoverData.leftSide || "N/A"}</strong></p>
            <p>Right Side Panels: <strong>{handoverData.rightSide || "N/A"}</strong></p>
            <p>Windshield: <strong>{handoverData.windshield || "N/A"}</strong></p>
            <p>Interior: <strong>{handoverData.interior || "N/A"}</strong></p>
          </div>

          <h3 className={headingStyle}>ACCESSORIES INCLUDED</h3>
          <ul className={`list-none mb-8 ${isPdf ? "text-[10px]" : "text-sm"} space-y-1`}>
            <li>[{handoverData.keys ? "X" : " "}] Vehicle Ignition Keys</li>
            <li>[{handoverData.spareTire ? "X" : " "}] Spare Tire</li>
            <li>[{handoverData.jack ? "X" : " "}] Car Jack & Spanner</li>
            <li>[{handoverData.cCaution ? "X" : " "}] C-Caution Triangle</li>
            <li>[{handoverData.extinguisher ? "X" : " "}] Fire Extinguisher</li>
            <li>[{handoverData.documents ? "X" : " "}] Original Particulars (Copies)</li>
          </ul>

          <p className="text-justify mb-8">I, <strong>{rider?.firstName} {rider?.lastName}</strong>, confirm receiving the vehicle in the condition stated above and assume full responsibility for it.</p>
          
          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="font-bold text-xs uppercase mb-4">ADMIN OFFICER</p>
              <div className="relative h-12 w-32 mb-1">
                 <img src="/images/stamp.png" alt="Stamp" className="absolute left-0 bottom-0 h-12 opacity-80 object-contain" />
                 <div className={`absolute bottom-0 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
              </div>
              <p className="text-[10px]">Yussuf Dare (MD)</p>
            </div>
            <div>
              <p className="font-bold text-xs uppercase mb-4">DRIVER/RIDER</p>
              <div className="relative h-12 w-32 mb-1">
                 {riderSig && isPdf ? (
                   <img src={riderSig} alt="Sig" className="absolute left-0 bottom-0 h-12 object-contain" />
                 ) : (
                   <div className={`absolute bottom-0 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
                 )}
              </div>
              <p className="text-[10px]">Signature attached</p>
            </div>
          </div>
        </div>

      </div>
    );
  };

  // --- STEP 2: SUCCESS VIEW ---
  if (step === 2) {
    return (
      <div ref={topRef} className="max-w-3xl mx-auto mt-10 bg-void-light/5 border border-emerald-500/30 p-8 sm:p-12 rounded-2xl text-center shadow-2xl animate-in fade-in zoom-in duration-500 w-full overflow-x-hidden">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-wider text-crisp-white mb-2">Agreement Executed</h2>
        <p className="text-slate-light leading-relaxed mb-10">
          Your digital signature and handover condition note have been permanently attached.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {contractUrl && (
            <a href={`${contractUrl}?fl_attachment=YUSDAAM_HPA_${rider.firstName}_${rider.lastName}.pdf`} download className="flex items-center justify-center gap-2 px-6 py-4 bg-void-navy border border-cobalt/30 text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-void-light/10 transition">
              <Download size={16} /> Download HPA
            </a>
          )}
          <button onClick={() => router.refresh()} className="flex items-center justify-center gap-2 px-6 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition shadow-lg">
            Access Dashboard <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // --- STEP 1: UI VIEW ---
  return (
    <div ref={topRef} className="max-w-5xl mx-auto bg-void-light/5 border border-cobalt/30 rounded-xl shadow-2xl animate-in slide-in-from-bottom-8 duration-500 w-full overflow-x-hidden mb-20">
      
      {/* 1. Document Reader */}
      <div className="p-8 sm:p-12 bg-void-navy/50">
        <HpaDocument isPdf={false} />
      </div>

      {/* 2. Form Inputs */}
      <div className="p-8 border-t border-cobalt/30 bg-void-navy">
        {errorMsg && <p className="text-signal-red text-sm font-bold mb-6 bg-signal-red/10 border border-signal-red/20 p-4 rounded-lg">{errorMsg}</p>}
        
        {/* Handover Data Form */}
        <div className="mb-8 p-6 bg-void-light/5 border border-cobalt/20 rounded-xl">
          <h4 className="font-bold uppercase tracking-wider text-cobalt text-sm mb-6">Complete Handover Condition Note</h4>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-light uppercase mb-2">Fuel Level</p>
              <div className="flex flex-wrap gap-4">
                {["Empty", "Quarter", "Half", "Full"].map(lvl => (
                  <label key={lvl} className="flex items-center gap-2 text-sm text-crisp-white cursor-pointer"><input type="radio" name="fuel" onChange={() => handleRadio("fuelLevel", lvl)} className="accent-signal-red w-4 h-4" /> {lvl}</label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Front Bumper", key: "frontBumper" },
                { label: "Rear Bumper", key: "rearBumper" },
                { label: "Left Panels", key: "leftSide" },
                { label: "Right Panels", key: "rightSide" },
                { label: "Windshield", key: "windshield" },
                { label: "Interior", key: "interior" },
                { label: "A/C Status", key: "acStatus" }
              ].map(item => (
                <div key={item.key} className="bg-void-navy p-3 rounded border border-cobalt/20">
                  <p className="text-xs font-bold text-slate-light uppercase mb-2">{item.label}</p>
                  <div className="flex gap-3">
                    {["OK", "Damaged", "N/A"].map(opt => (
                      <label key={opt} className="flex items-center gap-1 text-xs text-crisp-white cursor-pointer"><input type="radio" name={item.key} onChange={() => handleRadio(item.key, opt)} className="accent-signal-red" /> {opt}</label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-bold text-slate-light uppercase mb-3">Accessories Received</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 text-xs text-crisp-white cursor-pointer"><input type="checkbox" onChange={() => handleCheckbox("keys")} className="accent-signal-red w-4 h-4" /> Keys</label>
                <label className="flex items-center gap-2 text-xs text-crisp-white cursor-pointer"><input type="checkbox" onChange={() => handleCheckbox("spareTire")} className="accent-signal-red w-4 h-4" /> Spare Tire</label>
                <label className="flex items-center gap-2 text-xs text-crisp-white cursor-pointer"><input type="checkbox" onChange={() => handleCheckbox("jack")} className="accent-signal-red w-4 h-4" /> Jack/Spanner</label>
                <label className="flex items-center gap-2 text-xs text-crisp-white cursor-pointer"><input type="checkbox" onChange={() => handleCheckbox("cCaution")} className="accent-signal-red w-4 h-4" /> C-Caution</label>
                <label className="flex items-center gap-2 text-xs text-crisp-white cursor-pointer"><input type="checkbox" onChange={() => handleCheckbox("extinguisher")} className="accent-signal-red w-4 h-4" /> Extinguisher</label>
                <label className="flex items-center gap-2 text-xs text-crisp-white cursor-pointer"><input type="checkbox" onChange={() => handleCheckbox("documents")} className="accent-signal-red w-4 h-4" /> Documents</label>
              </div>
            </div>
          </div>
        </div>

        {/* Witness Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-void-light/5 border border-cobalt/20 rounded-xl">
          <div className="md:col-span-2"><h4 className="font-bold uppercase tracking-wider text-cobalt text-sm">Rider's Independent Witness</h4></div>
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
            <div className="bg-crisp-white rounded-lg border-2 border-cobalt/30 overflow-hidden shadow-inner">
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
          <div className="bg-crisp-white rounded-lg border-2 border-signal-red/30 overflow-hidden shadow-inner">
            <SignatureCanvas ref={riderSigCanvas} clearOnResize={false} penColor="#001232" canvasProps={{ className: "w-full h-40 cursor-crosshair" }} onEnd={() => setRiderSig(riderSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || null)} />
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" onClick={() => { riderSigCanvas.current?.clear(); setRiderSig(null); }} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red">Clear Canvas</button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-8 group">
          <input type="checkbox" className="mt-1 w-4 h-4 accent-signal-red cursor-pointer" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span className="text-xs text-slate-light leading-relaxed group-hover:text-crisp-white transition">I, {rider.firstName} {rider.lastName}, acknowledge that checking this box, filling the handover note, and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.</span>
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
  );
}
