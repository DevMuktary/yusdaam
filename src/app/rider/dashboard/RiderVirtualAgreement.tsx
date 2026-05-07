"use client";

import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { Loader2, PenTool, CheckSquare, Download, ArrowRight, CheckCircle2, ShieldCheck, XCircle, AlertTriangle } from "lucide-react";

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

  const riderSigCanvas = useRef<SignatureCanvas>(null);
  const witnessSigCanvas = useRef<SignatureCanvas>(null);
  
  const [agreed, setAgreed] = useState(false);
  const [witnessName, setWitnessName] = useState("");
  const [witnessAddress, setWitnessAddress] = useState("");
  const [riderSig, setRiderSig] = useState<string | null>(null);
  const [witnessSig, setWitnessSig] = useState<string | null>(null);

  const contractRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Handover Note State
  const [handoverData, setHandoverData] = useState({
    fuelLevel: "Empty",
    acStatus: "N/A",
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

  // Dynamic Date Helpers
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();
  const formattedDate = today.toLocaleDateString();

  const g1 = guarantors[0];
  const g2 = guarantors[1];

  const handleSubmit = async () => {
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
        image: { type: 'jpeg', quality: 0.8 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      const dataUri = await html2pdf().set({ ...opt, filename: 'HPA.pdf' }).from(contractRef.current).output('datauristring');
      const pdfBase64 = dataUri.split(',')[1];

      const res = await fetch("/api/rider/sign-agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfBase64 })
      });

      if (!res.ok) throw new Error("Failed to process agreement.");
      
      setStep(2);
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!contractRef.current) return;
    setIsDownloading(true);
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

      const pdfBlob = await html2pdf().set(opt).from(contractRef.current).output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `YUSDAAM_HPA_${rider.firstName}_${rider.lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("PDF Generation failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // --- THE SEPARATED LEGAL DOCUMENT COMPONENT ---
  const RiderDocument = ({ isPdf = false }: { isPdf?: boolean }) => {
    const textStyle = isPdf ? "text-[11px] leading-relaxed text-black font-serif" : "text-sm text-slate-light leading-relaxed font-sans";
    const headingStyle = isPdf ? "font-bold text-[12px] underline mt-6 mb-2 text-black uppercase" : "font-bold text-crisp-white text-base mt-8 border-b border-cobalt/20 pb-2 uppercase";

    return (
      <div className={textStyle}>
        <div className={`text-center ${isPdf ? "border-b-2 border-[#001232] pb-4 mb-6" : "border-b border-cobalt/30 pb-6 mb-8"}`}>
          <h1 className={`${isPdf ? "text-3xl text-[#001232]" : "text-3xl text-crisp-white"} font-black tracking-widest mb-1`}>
            YUSDAAM<span className="text-[#FFB902]">.</span>
          </h1>
          <p className={`${isPdf ? "text-[10px]" : "text-xs"} font-bold uppercase tracking-widest`}>YUSDAAM Autos Fleet Management Nigeria Limited</p>
          <p className={`${isPdf ? "text-[9px]" : "text-[10px] text-slate-light"} mt-1`}>RC: 9335611 | 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos | admin@yusdaamautos.com</p>
        </div>

        <h2 className={`text-center font-black uppercase ${isPdf ? "text-sm mb-6" : "text-lg text-signal-red mb-8"}`}>RIDER/DRIVER HIRE PURCHASE AGREEMENT</h2>

        <p className="mb-4"><strong>THIS AGREEMENT</strong> is made this <strong>{currentDay}</strong> day of <strong>{currentMonth}</strong>, <strong>{currentYear}</strong>.</p>

        <p className="mb-2 font-bold">BETWEEN</p>
        <p className="mb-4"><strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong>, a company duly incorporated under the Companies and Allied Matters Act (CAMA) with RC: 9335611, having its registered office at 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos, Nigeria (hereinafter referred to as the <strong>“Administrator”</strong>, acting as the lawful Attorney for the Asset Owner), of the first part;</p>
        
        <p className="mb-2 font-bold">AND</p>
        <p className="mb-4"><strong>{rider?.firstName} {rider?.lastName}</strong>, NIN: <strong>{rider?.nin}</strong>, residing at <strong>{rider?.streetAddress}</strong>, Email: <strong>{rider?.email || "N/A"}</strong>, Phone: <strong>{rider?.phoneNumber}</strong> (hereinafter referred to as the <strong>“Rider”</strong> or <strong>"Driver"</strong>), of the second part;</p>
        
        <p className="mb-2 font-bold">AND</p>
        <p className="mb-8"><strong>THE GUARANTORS</strong>, whose names, addresses, and details are expressly set out in Clause 9 of this Agreement (hereinafter referred to as the <strong>"Guarantors"</strong>), of the third part.</p>

        <h3 className={headingStyle}>RECITALS</h3>
        <p className="mb-1"><strong>WHEREAS:</strong></p>
        <ol className="list-[upper-alpha] pl-8 mb-8 space-y-2">
          <li>The Administrator manages commercial transport vehicles on behalf of legitimate asset owners via a legally executed Power of Attorney.</li>
          <li>The Rider desires to hire, and ultimately purchase, the commercial transport asset described herein under a weekly remittance structure.</li>
          <li>The Guarantors have agreed to stand as full financial and legal sureties for the Rider, guaranteeing the Rider’s performance, payments, and good conduct under this Agreement.</li>
          <li>The Parties have agreed to the terms of hire and conditional purchase as set out below.</li>
        </ol>

        <p className="mb-6 font-bold">NOW, THEREFORE, IT IS HEREBY AGREED AS FOLLOWS:</p>

        <h3 className={headingStyle}>1. THE ASSET</h3>
        <p className="mb-2"><strong>1.1</strong> The Administrator hereby agrees to let, and the Rider agrees to hire, the following commercial transport vehicle (the <strong>"Asset"</strong>):</p>
        <ul className={`list-disc pl-5 mb-6 space-y-1 ${isPdf ? "font-mono text-[10px]" : "font-mono bg-void-navy/50 p-4 rounded-lg"}`}>
          <li><strong>Asset Type:</strong> {vehicle?.type || "___________________"}</li>
          <li><strong>Make/Model:</strong> {vehicle?.makeModel || "___________________"}</li>
          <li><strong>Year of Manufacture:</strong> {vehicle?.year || "___________________"}</li>
          <li><strong>Engine Number:</strong> {vehicle?.engineNumber || "___________________"}</li>
          <li><strong>Chassis Number:</strong> {vehicle?.chassisNumber || "___________________"}</li>
          <li><strong>Registration/Plate Number:</strong> {vehicle?.registrationNumber || "___________________"}</li>
        </ul>

        <h3 className={headingStyle}>2. FINANCIAL TERMS AND REMITTANCE</h3>
        <p className="mb-2"><strong>2.1 Total Hire Purchase Price:</strong> The total sum payable by the Rider to acquire ownership of the Asset is <strong>₦{contract?.totalPrice?.toLocaleString() || "_____________"}</strong>.</p>
        <p className="mb-2"><strong>2.2 Initial Deposit (If Applicable):</strong> The Rider has paid a non-refundable initial commitment deposit of <strong>₦{contract?.initialDeposit?.toLocaleString() || "0"}</strong>.</p>
        <p className="mb-2"><strong>2.3 Weekly Remittance:</strong> The Rider shall pay a fixed sum of <strong>₦{contract?.weeklyRemittance?.toLocaleString() || "_____________"}</strong> every week (the "Gross Weekly Remittance") directly into the Administrator’s designated Client Remittance Account in their dashboard.</p>
        <p className="mb-2"><strong>2.4 Payment Schedule:</strong> Payments must be made no later than <strong>{contract?.paymentDay || "_____________"}</strong> of every week. Cash payments to unauthorized staff are strictly prohibited and will not be recognized.</p>
        <p className="mb-6"><strong>2.5 Tenure:</strong> The expected duration of this hire purchase arrangement is <strong>{contract?.agreedDurationMonths ? contract.agreedDurationMonths * 4 : "_____"}</strong> weeks, concluding when the Total Hire Purchase Price is fully paid.</p>

        <h3 className={headingStyle}>3. RIDER’S OBLIGATIONS AND RISK</h3>
        <p className="mb-2"><strong>3.1 Risk and Maintenance:</strong> The Rider assumes <strong>100% financial and operational risk</strong> for the Asset from the moment of handover. The Rider shall be solely responsible for the cost of all mechanical repairs, routine maintenance (e.g., oil changes, tire replacement), and breakdowns.</p>
        <p className="mb-2"><strong>3.2 Accident Damage:</strong> In the event of an accident, the Rider and/or their Guarantors shall bear the full cost of repairing the Asset.</p>
        <p className="mb-2"><strong>3.3 Uninterrupted Remittance:</strong> Mechanical failure, illness, or traffic delays shall not exempt the Rider from their obligation to pay the Weekly Remittance.</p>
        <p className="mb-2"><strong>3.4 Compliance with Laws:</strong> The Rider shall possess a valid driver’s/rider’s license and comply with all state and federal traffic laws. Any fines, impoundment fees, or penalties incurred due to traffic violations shall be paid entirely by the Rider.</p>
        <p className="mb-6"><strong>3.5 GPS Tracker:</strong> The Rider acknowledges that a GPS tracking device is installed on the Asset. Tampering with, disconnecting, or damaging the GPS tracker is a fundamental breach of this Agreement and will result in immediate repossession.</p>

        <h3 className={headingStyle}>4. ADMINISTRATOR’S RIGHTS AND REPOSSESSION</h3>
        <p className="mb-2"><strong>4.1 Ownership:</strong> The Asset remains the absolute property of the Asset Owner (managed by the Administrator) until the Total Hire Purchase Price is fully paid. The Rider is merely a "Hirer" and cannot sell, pawn, rent, or use the Asset as collateral.</p>
        <p className="mb-2"><strong>4.2 Inspection:</strong> The Administrator reserves the right to inspect the Asset at any reasonable time to ensure it is being properly maintained.</p>
        <p className="mb-2"><strong>4.3 Default and Repossession:</strong> The Administrator reserves the right to forcefully repossess the Asset without prior court order or legal notice if:</p>
        <ul className="list-disc pl-8 mb-2 space-y-1">
          <li>The Rider defaults on the Weekly Remittance for <strong>7</strong> consecutive days.</li>
          <li>The Rider tampers with the GPS tracker.</li>
          <li>The Rider uses the Asset for any illegal or criminal activity.</li>
          <li>The Asset is found to be abandoned or grossly poorly maintained.</li>
        </ul>
        <p className="mb-6"><strong>4.4 Forfeiture:</strong> In the event of repossession due to default, all previous payments made by the Rider shall be treated as standard rental fees for the use of the Asset and shall <strong>not</strong> be refunded.</p>

        <h3 className={headingStyle}>5. TRANSFER OF OWNERSHIP</h3>
        <p className="mb-2"><strong>5.1</strong> Upon the complete and timely payment of the Total Hire Purchase Price, the Administrator shall issue a <strong>Letter of Completion</strong> to the Rider.</p>
        <p className="mb-6"><strong>5.2</strong> The Administrator shall facilitate the provision of the Change of Ownership Form and the original purchase receipts from the Asset Owner within fourteen (14) days of completion, transferring full legal ownership to the Rider.</p>

        <h3 className={headingStyle}>6. GUARANTORS’ UNDERTAKING AND LIABILITY</h3>
        <p className="mb-2"><strong>6.1</strong> The Guarantors unconditionally, jointly, and severally guarantee the strict performance of the Rider under this Agreement.</p>
        <p className="mb-6"><strong>6.2</strong> If the Rider absconds, damages the Asset, defaults on the Weekly Remittance, or abandons the Asset, the Administrator shall have the legal right to pursue the Guarantors for the recovery of the Asset, outstanding monetary balances, and any repair costs incurred.</p>

        <h3 className={headingStyle}>7. GENERAL PROVISIONS</h3>
        <p className="mb-2"><strong>7.1 Dispute Resolution:</strong> Any dispute arising from this Agreement shall be resolved via mediation. If unresolved, the Administrator may enforce its rights through the appropriate law enforcement agencies or courts in Lagos State.</p>
        <p className="mb-6"><strong>7.2 Binding Nature:</strong> This Agreement is legally binding upon signature by all Parties, without the requisite presence of legal counsel.</p>

        <h3 className={headingStyle}>8. SIGNATURES</h3>
        <p className="mb-4"><strong>SIGNED by the ADMINISTRATOR</strong><br/>
        <strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong><br/>
        <strong>Authorized Signature:</strong> ____________________<br/>
        <strong>Date:</strong> ___________________</p>

        <div className="mb-8">
          <p className="mb-2"><strong>SIGNED by the RIDER/DRIVER</strong><br/>
          I confirm that I have read, understood, and agreed to be bound by the terms of this Hire Purchase Agreement.</p>
          <div className="relative h-20 w-48 mt-4 mb-2">
            {riderSig ? (
              <img src={riderSig} alt="Rider Signature" className={`absolute left-0 bottom-0 h-20 object-contain ${!isPdf ? "bg-white rounded-md p-1" : ""}`} />
            ) : (
              <div className={`absolute bottom-0 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
            )}
          </div>
          <p className="font-bold text-xs uppercase">Name: {rider?.firstName} {rider?.lastName}</p>
          <p className={`mt-2 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>Date: {formattedDate}</p>
        </div>

        <h3 className={headingStyle}>9. GUARANTORS' EXECUTION</h3>
        <div className={`mb-6 p-4 ${isPdf ? "border border-black bg-gray-50" : "border border-signal-red/30 bg-signal-red/5 rounded-lg"}`}>
          <p className="text-sm font-bold italic mb-4 text-signal-red">Note: The Guarantors below have previously executed Sworn Guarantor Attestations digitally. Their IP addresses, identity documents, and digital signatures are verified and held by the Administrator.</p>
          
          <p className="mb-2"><strong>FIRST GUARANTOR</strong><br/>
          I hereby undertake to be jointly and severally liable for any default, debt, or damage caused by the Rider during the pendency of this Agreement.</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Full Name:</strong> {g1?.firstName || "_____"} {g1?.lastName || "_____"}</li>
            <li><strong>NIN:</strong> {g1?.nin || "_____"}</li>
            <li><strong>Residential Address:</strong> {g1?.address || "_____"}</li>
            <li><strong>Phone Number:</strong> {g1?.phone || "_____"}</li>
          </ul>
          <p className={`mb-6 text-sm font-bold ${isPdf ? "text-green-700" : "text-emerald-400"}`}>✓ Digitally Signed on: {g1?.signedAt ? new Date(g1.signedAt).toLocaleDateString() : "_____"} (Signature on file)</p>

          <p className="mb-2"><strong>SECOND GUARANTOR</strong><br/>
          I hereby undertake to be jointly and severally liable for any default, debt, or damage caused by the Rider during the pendency of this Agreement.</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Full Name:</strong> {g2?.firstName || "_____"} {g2?.lastName || "_____"}</li>
            <li><strong>NIN:</strong> {g2?.nin || "_____"}</li>
            <li><strong>Residential Address:</strong> {g2?.address || "_____"}</li>
            <li><strong>Phone Number:</strong> {g2?.phone || "_____"}</li>
          </ul>
          <p className={`mb-4 text-sm font-bold ${isPdf ? "text-green-700" : "text-emerald-400"}`}>✓ Digitally Signed on: {g2?.signedAt ? new Date(g2.signedAt).toLocaleDateString() : "_____"} (Signature on file)</p>
        </div>

        <div>
          <p className="font-bold underline text-xs mt-8">IN THE PRESENCE OF INDEPENDENT WITNESS:</p>
          <p className={isPdf ? "text-xs mt-2" : "text-xs text-slate-light mt-2"}>Name: {witnessName || "______________________"}</p>
          <p className={isPdf ? "text-[10px] mt-2 leading-tight" : "text-xs text-slate-light mt-2 leading-tight"}>Address: {witnessAddress || "______________________"}</p>
          
          <div className="relative h-12 mt-2 w-48">
             <span className={isPdf ? "text-xs absolute bottom-0 left-0" : "text-xs text-slate-light absolute bottom-0 left-0"}>Signature:</span>
             {witnessSig ? (
               <img src={witnessSig} alt="Witness Signature" className={`absolute left-16 bottom-0 h-12 object-contain ${!isPdf ? "bg-white rounded-md p-1" : ""}`} />
             ) : (
               <div className={`absolute bottom-0 left-14 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
             )}
          </div>
          <p className={`mt-2 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>Date: {formattedDate}</p>
        </div>

        {/* --- VEHICLE HANDOVER NOTE --- */}
        <div className={`mt-12 pt-6 ${isPdf ? "border-t-2 border-black" : "border-t border-cobalt/30"}`} style={{ pageBreakBefore: 'always' }}>
          <h2 className={`text-center font-black uppercase ${isPdf ? "text-sm mb-6" : "text-lg text-signal-red mb-8"}`}>VEHICLE HANDOVER AND CONDITION NOTE</h2>
          <p className="mb-6"><strong>Date of Handover:</strong> {formattedDate} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Time of Handover:</strong> ___________________</p>
          
          <h3 className={headingStyle}>1. VEHICLE DETAILS</h3>
          <ul className={`list-disc pl-5 mb-6 space-y-1 ${isPdf ? "font-mono text-[10px]" : "font-mono bg-void-navy/50 p-4 rounded-lg"}`}>
            <li><strong>Asset Type:</strong> {vehicle?.type || "___________________"}</li>
            <li><strong>Make & Model:</strong> {vehicle?.makeModel || "___________________"}</li>
            <li><strong>Registration/Plate No:</strong> {vehicle?.registrationNumber || "___________________"}</li>
            <li><strong>Chassis Number:</strong> {vehicle?.chassisNumber || "___________________"}</li>
          </ul>

          <h3 className={headingStyle}>2. CURRENT STATUS AT HANDOVER</h3>
          <p className="mb-2">Odometer/Mileage Reading: _______________ km</p>
          <div className="flex gap-4 mb-6">
            <span className="font-bold">Fuel Level:</span>
            {["Empty", "Quarter", "Half", "Full"].map(level => (
              <span key={level} className="flex items-center gap-1">
                {isPdf ? (handoverData.fuelLevel === level ? "[X]" : "[ ]") : <input type="radio" checked={handoverData.fuelLevel === level} readOnly className="w-3 h-3" />} {level}
              </span>
            ))}
          </div>

          <h3 className={headingStyle}>3. EXTERIOR & INTERIOR CONDITION</h3>
          <p className="italic text-xs mb-2">(Please inspect carefully. Mark 'OK' if good, or describe any existing damage like scratches, dents, or broken glass).</p>
          <ul className="mb-4 space-y-2">
            <li>Front Bumper & Grille: ___________________________________</li>
            <li>Rear Bumper & Trunk: ____________________________________</li>
            <li>Left Side (Doors/Panels): _________________________________</li>
            <li>Right Side (Doors/Panels): ________________________________</li>
            <li>Windshield & Mirrors: ___________________________________</li>
            <li>Interior Seats & Dashboard: _______________________________</li>
          </ul>
          <div className="flex gap-4 mb-6">
            <span className="font-bold">Air Conditioning (If applicable):</span>
            {["Working", "Not Working", "N/A"].map(status => (
              <span key={status} className="flex items-center gap-1">
                {isPdf ? (handoverData.acStatus === status ? "[X]" : "[ ]") : <input type="radio" checked={handoverData.acStatus === status} readOnly className="w-3 h-3" />} {status}
              </span>
            ))}
          </div>

          <h3 className={headingStyle}>4. ACCESSORIES & TOOLS INCLUDED</h3>
          <p className="italic text-xs mb-2">(Checked items are physically handed over to the Rider)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 text-sm">
            <span>{isPdf ? (handoverData.keys ? "[X]" : "[ ]") : <input type="checkbox" checked={handoverData.keys} readOnly />} Vehicle Ignition Keys</span>
            <span>{isPdf ? (handoverData.spareTire ? "[X]" : "[ ]") : <input type="checkbox" checked={handoverData.spareTire} readOnly />} Spare Tire</span>
            <span>{isPdf ? (handoverData.jack ? "[X]" : "[ ]") : <input type="checkbox" checked={handoverData.jack} readOnly />} Car Jack & Wheel Spanner</span>
            <span>{isPdf ? (handoverData.cCaution ? "[X]" : "[ ]") : <input type="checkbox" checked={handoverData.cCaution} readOnly />} C-Caution (Warning Triangle)</span>
            <span>{isPdf ? (handoverData.extinguisher ? "[X]" : "[ ]") : <input type="checkbox" checked={handoverData.extinguisher} readOnly />} Fire Extinguisher</span>
            <span>{isPdf ? (handoverData.documents ? "[X]" : "[ ]") : <input type="checkbox" checked={handoverData.documents} readOnly />} Vehicle Particulars (Copies)</span>
          </div>

          <h3 className={headingStyle}>5. GPS CONFIRMATION</h3>
          <div className={`p-3 font-bold text-xs uppercase rounded mb-6 ${isPdf ? "border border-black" : "bg-signal-red/10 border border-signal-red/30 text-signal-red"}`}>
            [X] GPS Tracker installed, tested, and confirmed active by Administrator.
          </div>

          <h3 className={headingStyle}>RIDER’S DECLARATION</h3>
          <p className="mb-4 text-justify">I, <strong>{rider.firstName} {rider.lastName}</strong>, hereby confirm that I have physically inspected the vehicle described above. I acknowledge that I am receiving the vehicle and the checked accessories in the exact condition stated in this document. I agree that I am fully responsible for maintaining this condition and replacing any missing tools or accessories as stipulated in my Hire Purchase Agreement.</p>
          
          <p className="mb-8"><strong>HANDED OVER BY (For Yusdaam Autos):</strong><br/>
          <strong>Name of Admin Officer:</strong> ________________________<br/>
          <strong>Signature:</strong> __________________________<br/>
          <strong>Date:</strong> ___________________</p>

          <div className={`p-4 ${isPdf ? "border border-black bg-gray-50" : "border border-signal-red/30 bg-signal-red/5 rounded-lg"}`}>
            <p className="font-bold text-sm uppercase text-center mb-2">RIDER'S SIGNATURE</p>
            <div className="relative h-20 w-48 mx-auto mb-2">
              {riderSig ? (
                <img src={riderSig} alt="Rider Signature" className={`absolute left-0 bottom-0 h-20 object-contain ${!isPdf ? "bg-white rounded-md p-1" : ""}`} />
              ) : (
                <div className={`absolute bottom-0 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
              )}
            </div>
            <p className="text-center text-xs mt-2 font-bold">Date: {formattedDate}</p>
          </div>

        </div>

      </div>
    );
  };

  // --- STEP 2: SUCCESS VIEW ---
  if (step === 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-navy/90 backdrop-blur-sm p-4 sm:p-8">
        <div ref={topRef} className="max-w-3xl mx-auto bg-void-light/5 border border-emerald-500/30 p-8 sm:p-12 rounded-2xl text-center shadow-2xl animate-in fade-in zoom-in duration-500 w-full">
          
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-wider text-crisp-white mb-2">Agreement Executed</h2>
          <p className="text-slate-light leading-relaxed mb-10">
            Your digital signature and handover condition note have been permanently attached. Your dashboard has been unlocked and your fleet assignment is now active.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleDownloadPDF} disabled={isDownloading} className="flex items-center justify-center gap-2 px-6 py-4 bg-void-navy border border-cobalt/30 text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-void-light/10 transition disabled:opacity-50">
              {isDownloading ? <><Loader2 size={16} className="animate-spin" /> Generating</> : <><Download size={16} /> Download Copy</>}
            </button>
            
            <button onClick={() => router.refresh()} className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition shadow-lg">
              Access Dashboard <ArrowRight size={16} />
            </button>
          </div>

          <div className="hidden">
            <div ref={contractRef} className="bg-white p-12 w-[800px]"><RiderDocument isPdf={true} /></div>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 1: HPA SIGNING VIEW ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-navy/90 backdrop-blur-sm p-4 sm:p-8">
      <div ref={topRef} className="max-w-5xl mx-auto bg-void-light/5 border border-signal-red/30 rounded-xl shadow-2xl animate-in slide-in-from-bottom-8 duration-500 w-full max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-signal-red/10 p-4 sm:p-6 border-b border-signal-red/30 flex items-center gap-4 shrink-0">
          <ShieldCheck size={32} className="text-signal-red shrink-0" />
          <div>
            <h2 className="text-xl font-black text-signal-red uppercase tracking-wider">Pending Legal Execution</h2>
            <p className="text-xs text-slate-light font-bold">Please complete the handover note and sign the agreement below to unlock your dashboard.</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 sm:p-12 bg-void-navy/50">
            {/* Handover Checkboxes (Interactive Version) */}
            <div className="mb-8 p-6 bg-void-light/5 border border-cobalt/30 rounded-xl">
              <h3 className="font-bold text-signal-red uppercase mb-4">Complete Handover Note</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-bold text-slate-light mb-2">Fuel Level:</p>
                  <div className="flex gap-4">
                    {["Empty", "Quarter", "Half", "Full"].map(level => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer text-sm text-crisp-white">
                        <input type="radio" name="fuel" checked={handoverData.fuelLevel === level} onChange={() => setHandoverData({...handoverData, fuelLevel: level})} className="accent-signal-red" /> {level}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-light mb-2">Air Conditioning:</p>
                  <div className="flex gap-4">
                    {["Working", "Not Working", "N/A"].map(status => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer text-sm text-crisp-white">
                        <input type="radio" name="ac" checked={handoverData.acStatus === status} onChange={() => setHandoverData({...handoverData, acStatus: status})} className="accent-signal-red" /> {status}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-light mb-2">Accessories Received:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-crisp-white">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.keys} onChange={() => handleCheckbox("keys")} className="w-4 h-4 accent-signal-red" /> Vehicle Ignition Keys</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.spareTire} onChange={() => handleCheckbox("spareTire")} className="w-4 h-4 accent-signal-red" /> Spare Tire (Uncheck if Keke)</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.jack} onChange={() => handleCheckbox("jack")} className="w-4 h-4 accent-signal-red" /> Car Jack & Wheel Spanner</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.cCaution} onChange={() => handleCheckbox("cCaution")} className="w-4 h-4 accent-signal-red" /> C-Caution (Warning Triangle)</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.extinguisher} onChange={() => handleCheckbox("extinguisher")} className="w-4 h-4 accent-signal-red" /> Fire Extinguisher</label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={handoverData.documents} onChange={() => handleCheckbox("documents")} className="w-4 h-4 accent-signal-red" /> Particulars (Copies)</label>
                  </div>
                </div>
              </div>
            </div>

            <RiderDocument isPdf={false} />
          </div>

          <div className="p-8 border-t border-cobalt/30 bg-void-navy">
            {errorMsg && <p className="text-signal-red text-sm font-bold mb-6 bg-signal-red/10 border border-signal-red/20 p-4 rounded-lg">{errorMsg}</p>}
            
            {/* Witness Details Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-void-light/5 border border-cobalt/20 rounded-xl">
              <div className="md:col-span-2"><h4 className="font-bold uppercase tracking-wider text-cobalt text-sm">Rider's Independent Witness</h4></div>
              <div>
                <label className="block text-[10px] font-bold text-slate-light uppercase tracking-widest mb-2">Witness Full Name</label>
                <input type="text" value={witnessName} onChange={(e) => setWitnessName(e.target.value)} className="w-full bg-void-navy border border-cobalt/30 rounded-lg px-4 py-3 text-base md:text-sm text-crisp-white focus:outline-none focus:border-cobalt" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-light uppercase tracking-widest mb-2">Witness Address</label>
                <input type="text" value={witnessAddress} onChange={(e) => setWitnessAddress(e.target.value)} className="w-full bg-void-navy border border-cobalt/30 rounded-lg px-4 py-3 text-base md:text-sm text-crisp-white focus:outline-none focus:border-cobalt" placeholder="123 Example Street, Lagos" />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-light uppercase tracking-widest mb-2"><PenTool size={12} /> Draw Witness Signature</label>
                <div className="bg-crisp-white rounded-lg border-2 border-cobalt/30 overflow-hidden shadow-inner">
                  <SignatureCanvas 
                    ref={witnessSigCanvas} 
                    clearOnResize={false} 
                    penColor="#001232" 
                    canvasProps={{ className: "w-full h-32 cursor-crosshair" }} 
                    onEnd={() => setWitnessSig(witnessSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || null)}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={() => { witnessSigCanvas.current?.clear(); setWitnessSig(null); }} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red transition">Clear Witness Canvas</button>
                </div>
              </div>
            </div>

            {/* Rider Signature */}
            <div className="mb-6 p-6 bg-signal-red/5 border border-signal-red/20 rounded-xl">
              <label className="flex items-center gap-2 text-xs font-bold text-signal-red uppercase tracking-widest mb-3"><PenTool size={14} /> Draw Your Signature</label>
              <div className="bg-crisp-white rounded-lg border-2 border-signal-red/30 overflow-hidden shadow-inner">
                <SignatureCanvas 
                  ref={riderSigCanvas} 
                  clearOnResize={false} 
                  penColor="#001232" 
                  canvasProps={{ className: "w-full h-32 cursor-crosshair" }} 
                  onEnd={() => setRiderSig(riderSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || null)}
                />
              </div>
              <div className="flex justify-end mt-2">
                <button type="button" onClick={() => { riderSigCanvas.current?.clear(); setRiderSig(null); }} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red transition">Clear Signature Canvas</button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-8 group">
              <input type="checkbox" className="mt-1 w-4 h-4 accent-signal-red cursor-pointer" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span className="text-xs text-slate-light leading-relaxed group-hover:text-crisp-white transition">I, {rider.firstName} {rider.lastName}, acknowledge that checking this box, submitting my handover note, and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.</span>
            </label>

            <button onClick={handleSubmit} disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition shadow-lg disabled:opacity-50">
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Securing Contract</> : <><CheckSquare size={16} /> Execute Agreement & Unlock Dashboard</>}
            </button>
          </div>
        </div>

        {/* Hidden Render for PDF Generation */}
        <div className="hidden">
          <div ref={contractRef} className="bg-white p-12 w-[800px]"><RiderDocument isPdf={true} /></div>
        </div>

      </div>
    </div>
  );
}
