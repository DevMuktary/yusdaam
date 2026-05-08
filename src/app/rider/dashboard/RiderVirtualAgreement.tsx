"use client";

import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { Loader2, Download, ArrowRight, CheckCircle2, ShieldCheck, XCircle, AlertTriangle, PenTool, CheckSquare } from "lucide-react";

export default function RiderVirtualAgreement({ rider, vehicle, contract, guarantors }: { rider: any, vehicle: any, contract: any, guarantors: any[] }) {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);
  
  // Prevent iOS Safari pinch-zoom & rubber-band scroll
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0';
    document.head.appendChild(meta);
    
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none"; 
    
    return () => { 
      document.head.removeChild(meta); 
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, []);

  const [step, setStep] = useState(1); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [contractUrl, setContractUrl] = useState<string | null>(null);

  const riderSigCanvas = useRef<SignatureCanvas>(null);
  const witnessSigCanvas = useRef<SignatureCanvas>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  
  const [agreed, setAgreed] = useState(false);
  const [witnessName, setWitnessName] = useState("");
  const [witnessAddress, setWitnessAddress] = useState("");

  // States to hold the captured signature images for the PDF
  const [pdfRiderSig, setPdfRiderSig] = useState<string | null>(null);
  const [pdfWitnessSig, setPdfWitnessSig] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!handoverData.fuelLevel) return setErrorMsg("Please select the fuel level in the handover note.");
    if (riderSigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your Driver/Rider signature.");
    if (!witnessName || !witnessAddress) return setErrorMsg("Please provide your witness's name and address.");
    if (witnessSigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your witness signature.");
    if (!agreed) return setErrorMsg("You must check the agreement box at the bottom to proceed.");

    setIsSubmitting(true);
    setLoadingText("Preparing Signatures...");

    const rSig = riderSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    const wSig = witnessSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    
    setPdfRiderSig(rSig || null);
    setPdfWitnessSig(wSig || null);

    // Wait 500ms for React to apply the signature images to the hidden PDF div
    setTimeout(async () => {
      try {
        setLoadingText("Compiling Official Document...");
        
        // @ts-ignore
        const html2pdf = (await import("html2pdf.js")).default;
        const opt = {
          margin: [0.5, 0.5, 0.5, 0.5],
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] } 
        };

        const dataUri = await html2pdf().set(opt).from(pdfRef.current).output('datauristring');
        const pdfBase64 = dataUri.split(',')[1];

        setLoadingText("Securing in Legal Vault...");
        const res = await fetch("/api/rider/sign-agreement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfBase64 })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to process agreement.");
        
        setContractUrl(data.url);
        setStep(2);
      } catch (err: any) {
        setErrorMsg(err.message || "An error occurred during submission.");
        setIsSubmitting(false);
      }
    }, 500);
  };

  // --- HIDDEN PDF RENDER FUNCTION ---
  // This is strictly formatted for A4 printing and Cloudinary storage
  const renderPdfDocument = () => {
    const headingStyle = "font-bold text-[14px] underline mt-6 mb-2 text-black uppercase";
    return (
      <div className="text-[12px] leading-relaxed text-black font-serif">
        <div className="text-center border-b-4 border-[#001232] pb-6 mb-8">
          <h1 className="text-4xl text-[#001232] font-black tracking-widest mb-2">
            YUSDAAM<span className="text-[#FFB902]">.</span>
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-800">YUSDAAM Autos Fleet Management Nigeria Limited</p>
          <p className="text-[10px] text-gray-600 mt-1 font-mono tracking-wide">RC: 9335611 | 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos | admin@yusdaamautos.com</p>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-xl font-black uppercase underline mb-2">DRIVER/RIDER HIRE PURCHASE AGREEMENT</h2>
        </div>

        <p className="mb-4"><strong>THIS AGREEMENT</strong> is made this <strong>{currentDay}</strong> day of <strong>{currentMonth}</strong>, <strong>{currentYear}</strong>.</p>
        <p className="mb-4"><strong>BETWEEN</strong></p>
        <p className="mb-4 text-justify"><strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong>, a company duly incorporated under the Companies and Allied Matters Act (CAMA) with RC: 9335611, having its registered office at 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos, Nigeria (hereinafter referred to as the <strong>“Administrator”</strong>, acting as the lawful Attorney for the Asset Owner), of the first part;</p>
        <p className="mb-4"><strong>AND</strong></p>
        <p className="mb-4 text-justify"><strong>{rider?.firstName} {rider?.lastName}</strong>, NIN: <strong>{rider?.nin}</strong>, residing at <strong>{rider?.streetAddress}</strong>, Email: <strong>{rider?.email || "N/A"}</strong>, Phone: <strong>{rider?.phoneNumber}</strong> (hereinafter referred to as the <strong>“Driver/Rider”</strong>), of the second part;</p>
        <p className="mb-4"><strong>AND</strong></p>
        <p className="mb-8 text-justify"><strong>THE GUARANTORS</strong>, whose names, addresses, and details are expressly set out in Clause 9 of this Agreement (hereinafter referred to as the <strong>"Guarantors"</strong>), of the third part.</p>

        <h3 className={headingStyle}>RECITALS</h3>
        <p className="mb-2"><strong>WHEREAS:</strong></p>
        <ol className="list-[upper-alpha] pl-8 mb-8 space-y-3 text-justify">
          <li>The Administrator manages commercial transport vehicles on behalf of legitimate asset owners via a legally executed Power of Attorney.</li>
          <li>The Driver/Rider desires to hire, and ultimately purchase, the commercial transport asset described herein under a weekly remittance structure.</li>
          <li>The Guarantors have agreed to stand as full financial and legal sureties for the Driver/Rider, guaranteeing the Driver/Rider’s performance, payments, and good conduct under this Agreement.</li>
          <li>The Parties have agreed to the terms of hire and conditional purchase as set out below.</li>
        </ol>

        <p className="mb-6 font-bold uppercase text-center bg-gray-100 p-2 border border-gray-300">NOW, THEREFORE, IT IS HEREBY AGREED AS FOLLOWS:</p>

        <h3 className={headingStyle}>1. THE ASSET</h3>
        <p className="mb-3"><strong>1.1</strong> The Administrator hereby agrees to let, and the Driver/Rider agrees to hire, the following commercial transport vehicle (the <strong>"Asset"</strong>):</p>
        <ul className="list-none pl-6 mb-8 space-y-2 font-mono text-[11px] p-4 bg-gray-50 border border-gray-300">
          <li><strong>Asset Type:</strong> {vehicle?.type || "___________________"}</li>
          <li><strong>Make/Model:</strong> {vehicle?.makeModel || "___________________"}</li>
          <li><strong>Year of Manufacture:</strong> {vehicle?.year || "___________________"}</li>
          <li><strong>Engine Number:</strong> {vehicle?.engineNumber || "___________________"}</li>
          <li><strong>Chassis Number:</strong> {vehicle?.chassisNumber || "___________________"}</li>
          <li><strong>Registration/Plate Number:</strong> {vehicle?.registrationNumber || "___________________"}</li>
        </ul>

        <h3 className={headingStyle}>2. FINANCIAL TERMS AND REMITTANCE</h3>
        <p className="mb-3 text-justify"><strong>2.1 Total Hire Purchase Price:</strong> The total sum payable by the Driver/Rider to acquire ownership of the Asset is <strong>₦{contract?.totalPrice?.toLocaleString() || "_____________"}</strong>.</p>
        <p className="mb-3 text-justify"><strong>2.2 Initial Deposit (If Applicable):</strong> The Driver/Rider has paid a non-refundable initial commitment deposit of <strong>₦{contract?.initialDeposit?.toLocaleString() || "0"}</strong>.</p>
        <p className="mb-3 text-justify"><strong>2.3 Weekly Remittance:</strong> The Driver/Rider shall pay a fixed sum of <strong>₦{contract?.weeklyRemittance?.toLocaleString() || "_____________"}</strong> every week (the "Gross Weekly Remittance") directly into the Administrator’s designated Client Remittance Account in their dashboard.</p>
        <p className="mb-3 text-justify"><strong>2.4 Payment Schedule:</strong> Payments must be made no later than <strong>{contract?.paymentDay || "Friday 11:59 PM"}</strong> of every week. Cash payments to unauthorized staff are strictly prohibited and will not be recognized.</p>
        <p className="mb-8 text-justify"><strong>2.5 Tenure:</strong> The expected duration of this hire purchase arrangement is <strong>{contract?.agreedDurationMonths ? contract.agreedDurationMonths * 4 : "_____"}</strong> weeks, concluding when the Total Hire Purchase Price is fully paid.</p>

        <h3 className={headingStyle}>3. DRIVER/RIDER’S OBLIGATIONS AND RISK</h3>
        <p className="mb-3 text-justify"><strong>3.1 Risk and Maintenance:</strong> The Driver/Rider assumes <strong>100% financial and operational risk</strong> for the Asset from the moment of handover. The Driver/Rider shall be solely responsible for the cost of all mechanical repairs, routine maintenance (e.g., oil changes, tire replacement), and breakdowns.</p>
        <p className="mb-3 text-justify"><strong>3.2 Accident Damage:</strong> In the event of an accident, the Driver/Rider and/or their Guarantors shall bear the full cost of repairing the Asset.</p>
        <p className="mb-3 text-justify"><strong>3.3 Uninterrupted Remittance:</strong> Mechanical failure, illness, or traffic delays shall not exempt the Driver/Rider from their obligation to pay the Weekly Remittance.</p>
        <p className="mb-3 text-justify"><strong>3.4 Compliance with Laws:</strong> The Driver/Rider shall possess a valid driver’s/rider’s license and comply with all state and federal traffic laws. Any fines, impoundment fees, or penalties incurred due to traffic violations shall be paid entirely by the Driver/Rider.</p>
        <p className="mb-8 text-justify"><strong>3.5 GPS Tracker:</strong> The Driver/Rider acknowledges that a GPS tracking device is installed on the Asset. Tampering with, disconnecting, or damaging the GPS tracker is a fundamental breach of this Agreement and will result in immediate repossession.</p>

        <h3 className={headingStyle}>4. ADMINISTRATOR’S RIGHTS AND REPOSSESSION</h3>
        <p className="mb-3 text-justify"><strong>4.1 Ownership:</strong> The Asset remains the absolute property of the Asset Owner (managed by the Administrator) until the Total Hire Purchase Price is fully paid. The Driver/Rider is merely a "Hirer" and cannot sell, pawn, rent, or use the Asset as collateral.</p>
        <p className="mb-3 text-justify"><strong>4.2 Inspection:</strong> The Administrator reserves the right to inspect the Asset at any reasonable time to ensure it is being properly maintained.</p>
        <p className="mb-3 text-justify"><strong>4.3 Default and Repossession:</strong> The Administrator reserves the right to forcefully repossess the Asset without prior court order or legal notice if:</p>
        <ul className="list-disc pl-8 mb-3 space-y-2">
          <li>The Driver/Rider defaults on the Weekly Remittance for <strong>7</strong> consecutive days.</li>
          <li>The Driver/Rider tampers with the GPS tracker.</li>
          <li>The Driver/Rider uses the Asset for any illegal or criminal activity.</li>
          <li>The Asset is found to be abandoned or grossly poorly maintained.</li>
        </ul>
        <p className="mb-8 text-justify"><strong>4.4 Forfeiture:</strong> In the event of repossession due to default, all previous payments made by the Driver/Rider shall be treated as standard rental fees for the use of the Asset and shall <strong>not</strong> be refunded.</p>

        <h3 className={headingStyle}>5. TRANSFER OF OWNERSHIP</h3>
        <p className="mb-3 text-justify"><strong>5.1</strong> Upon the complete and timely payment of the Total Hire Purchase Price, the Administrator shall issue a <strong>Letter of Completion</strong> to the Driver/Rider.</p>
        <p className="mb-8 text-justify"><strong>5.2</strong> The Administrator shall facilitate the provision of the Change of Ownership Form and the original purchase receipts from the Asset Owner within fourteen (14) days of completion, transferring full legal ownership to the Driver/Rider.</p>

        <h3 className={headingStyle}>6. GUARANTORS’ UNDERTAKING AND LIABILITY</h3>
        <p className="mb-3 text-justify"><strong>6.1</strong> The Guarantors unconditionally, jointly, and severally guarantee the strict performance of the Driver/Rider under this Agreement.</p>
        <p className="mb-8 text-justify"><strong>6.2</strong> If the Driver/Rider absconds, damages the Asset, defaults on the Weekly Remittance, or abandons the Asset, the Administrator shall have the legal right to pursue the Guarantors for the recovery of the Asset, outstanding monetary balances, and any repair costs incurred.</p>

        <h3 className={headingStyle}>7. GENERAL PROVISIONS</h3>
        <p className="mb-3 text-justify"><strong>7.1 Dispute Resolution:</strong> Any dispute arising from this Agreement shall be resolved via mediation. If unresolved, the Administrator may enforce its rights through the appropriate law enforcement agencies or courts in Lagos State.</p>
        <p className="mb-10 text-justify"><strong>7.2 Binding Nature:</strong> This Agreement is legally binding upon signature by all Parties, without the requisite presence of legal counsel.</p>

        <div style={{ pageBreakBefore: 'always', paddingTop: '20px' }}></div>

        <h3 className={headingStyle}>8. SIGNATURES</h3>
        <div className="grid grid-cols-2 gap-10 mb-10 mt-6">
          <div>
            <p className="font-bold mb-4">SIGNED by the ADMINISTRATOR</p>
            <div className="relative h-16 w-48 mb-2">
               <img src="/images/stamp.png" alt="Company Seal" className="absolute left-0 -top-2 h-20 opacity-80 object-contain" />
               <div className="absolute bottom-0 w-full border-b border-black"></div>
            </div>
            <p className="font-bold text-xs mt-1">Yussuf Dare Orelaja (MD)</p>
            <p className="text-xs mt-1">Date: {formattedDate}</p>
          </div>
          <div>
            <p className="font-bold mb-4">SIGNED by the DRIVER/RIDER</p>
            <div className="relative h-16 w-48 mb-2">
              {pdfRiderSig ? <img src={pdfRiderSig} alt="Rider Signature" className="absolute left-0 bottom-0 h-16 object-contain" /> : <div className="absolute bottom-0 w-full border-b border-black"></div>}
            </div>
            <p className="font-bold text-xs uppercase">Name: {rider?.firstName} {rider?.lastName}</p>
            <p className="text-xs mt-1">Date: {formattedDate}</p>
          </div>
        </div>

        <h3 className={headingStyle}>9. GUARANTORS' EXECUTION</h3>
        <div className="mb-10 p-6 border-2 border-black bg-white">
          <p className="text-[11px] font-bold italic mb-6 text-gray-700 leading-relaxed text-justify">
            Note: The Guarantors below have previously executed Sworn Guarantor Attestations digitally. By doing so, they have legally bound themselves to be jointly and severally liable. This means if the Driver/Rider absconds, defaults on weekly remittances, steals the vehicle, or causes damages, the Administrator possesses the full legal authority to pursue, arrest, and recover the total financial loss directly from these Guarantors. Their digital signatures, identity documents, and verified IP addresses are permanently secured in the Administrator's legal vault.
          </p>
          <div className="grid grid-cols-2 gap-8">
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
          <p className="text-xs">Name: {witnessName || "______________________"}</p>
          <p className="text-[10px] mt-1">Address: {witnessAddress || "______________________"}</p>
          <div className="relative h-12 mt-4 w-48">
             <span className="text-xs absolute bottom-0 left-0">Signature:</span>
             {pdfWitnessSig ? <img src={pdfWitnessSig} alt="Witness Signature" className="absolute left-16 bottom-0 h-12 object-contain" /> : <div className="absolute bottom-0 left-14 w-full border-b border-black"></div>}
          </div>
          <p className="text-xs mt-2">Date: {formattedDate}</p>
        </div>

        <div style={{ pageBreakBefore: 'always', paddingTop: '20px' }}></div>

        {/* PDF VEHICLE HANDOVER NOTE */}
        <div className="mt-0">
          <h2 className="text-center font-black uppercase text-sm mb-6">VEHICLE HANDOVER & CONDITION NOTE</h2>
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
          <ul className="list-none mb-8 text-[10px] space-y-1">
            <li>[{handoverData.keys ? "X" : " "}] Vehicle Ignition Keys</li>
            <li>[{handoverData.spareTire ? "X" : " "}] Spare Tire</li>
            <li>[{handoverData.jack ? "X" : " "}] Car Jack & Spanner</li>
            <li>[{handoverData.cCaution ? "X" : " "}] C-Caution Triangle</li>
            <li>[{handoverData.extinguisher ? "X" : " "}] Fire Extinguisher</li>
            <li>[{handoverData.documents ? "X" : " "}] Original Particulars (Copies)</li>
          </ul>
          <div className="p-4 border-2 border-black font-bold text-sm uppercase mb-10 flex items-center gap-2">
            <AlertTriangle size={20} className="shrink-0" />
            <span>[✓] GPS Tracker installed, tested, and confirmed active by Administrator.</span>
          </div>
          <p className="text-justify mb-8">I, <strong>{rider?.firstName} {rider?.lastName}</strong>, confirm receiving the vehicle in the condition stated above and assume full responsibility for it.</p>
          <div className="grid grid-cols-2 gap-10">
            <div>
              <p className="font-bold text-xs uppercase mb-4">ADMIN OFFICER</p>
              <div className="relative h-12 w-32 mb-1">
                 <img src="/images/stamp.png" alt="Stamp" className="absolute left-0 bottom-0 h-12 opacity-80 object-contain" />
                 <div className="absolute bottom-0 w-full border-b border-black"></div>
              </div>
              <p className="text-[10px]">Yussuf Dare (MD)</p>
            </div>
            <div>
              <p className="font-bold text-xs uppercase mb-4">DRIVER/RIDER</p>
              <div className="relative h-12 w-32 mb-1">
                 {pdfRiderSig ? <img src={pdfRiderSig} alt="Sig" className="absolute left-0 bottom-0 h-12 object-contain" /> : <div className="absolute bottom-0 w-full border-b border-black"></div>}
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-navy/95 backdrop-blur-md p-4 h-[100dvh] w-screen overscroll-none">
        <div className="max-w-3xl mx-auto bg-void-light/5 border border-emerald-500/30 p-8 sm:p-12 rounded-2xl text-center shadow-2xl animate-in fade-in zoom-in duration-500 w-full">
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
      </div>
    );
  }

  // --- STEP 1: UI VIEW ---
  // The UI is built to read easily like a document but contains live inputs exactly where they belong.
  return (
    <div className="fixed inset-0 z-[100] h-[100dvh] w-screen flex items-center justify-center bg-void-navy/95 backdrop-blur-md p-0 sm:p-6 overscroll-none">
      
      <div className="bg-gray-50 w-full max-w-4xl h-full sm:max-h-[95dvh] rounded-none sm:rounded-2xl shadow-2xl flex flex-col border-0 sm:border border-gray-400 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-void-navy p-4 border-b border-gray-400 flex items-center gap-4 shrink-0 shadow-md z-10">
          <ShieldCheck size={32} className="text-signal-red shrink-0" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-crisp-white uppercase tracking-wider">Pending Legal Execution</h2>
            <p className="text-[10px] sm:text-xs text-slate-light font-bold uppercase tracking-widest">Read, complete handover note, and sign below.</p>
          </div>
        </div>

        {/* Scrollable Document with Inline Inputs */}
        <div className="flex-1 overflow-y-auto overscroll-none touch-pan-y p-6 sm:p-12 text-sm text-black leading-relaxed font-serif">
          {errorMsg && (
            <div className="sticky top-0 z-10 bg-red-100 border-b border-red-500 text-red-700 px-4 py-3 text-sm font-bold flex items-center gap-2 shadow-lg mb-6 rounded">
              <XCircle size={18} /> {errorMsg}
            </div>
          )}

          <div className="text-center border-b-2 border-gray-300 pb-6 mb-8">
            <h1 className="text-3xl text-[#001232] font-black tracking-widest mb-1">
              YUSDAAM<span className="text-[#FFB902]">.</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-800">YUSDAAM Autos Fleet Management Nigeria Limited</p>
            <p className="text-[10px] text-gray-600 mt-1 font-mono tracking-wide">RC: 9335611 | 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos | admin@yusdaamautos.com</p>
          </div>

          <h2 className="text-center text-lg font-black uppercase text-red-600 mb-8 underline">DRIVER/RIDER HIRE PURCHASE AGREEMENT</h2>

          <p className="mb-4"><strong>THIS AGREEMENT</strong> is made this <strong>{currentDay}</strong> day of <strong>{currentMonth}</strong>, <strong>{currentYear}</strong>.</p>
          <p className="mb-4"><strong>BETWEEN</strong></p>
          <p className="mb-4 text-justify"><strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong>, a company duly incorporated under the Companies and Allied Matters Act (CAMA) with RC: 9335611, having its registered office at 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos, Nigeria (hereinafter referred to as the <strong>“Administrator”</strong>), of the first part;</p>
          <p className="mb-4"><strong>AND</strong></p>
          <p className="mb-4 text-justify"><strong>{rider?.firstName} {rider?.lastName}</strong>, NIN: {rider?.nin}, residing at {rider?.streetAddress}, Email: {rider?.email || "N/A"}, Phone: {rider?.phoneNumber} (hereinafter referred to as the <strong>“Driver/Rider”</strong>), of the second part;</p>
          <p className="mb-4"><strong>AND</strong></p>
          <p className="mb-8 text-justify"><strong>THE GUARANTORS</strong>, whose names, addresses, and details are expressly set out in Clause 9 of this Agreement (hereinafter referred to as the <strong>"Guarantors"</strong>), of the third part.</p>

          <h3 className="font-bold text-base mt-6 border-b border-gray-300 pb-1 mb-4 uppercase">RECITALS</h3>
          <p className="mb-2 font-bold">WHEREAS:</p>
          <ul className="list-[upper-alpha] pl-5 mb-8 space-y-2">
            <li>The Administrator manages commercial transport vehicles on behalf of legitimate asset owners via a legally executed Power of Attorney.</li>
            <li>The Driver/Rider desires to hire, and ultimately purchase, the commercial transport asset described herein under a weekly remittance structure.</li>
            <li>The Guarantors have agreed to stand as full financial and legal sureties for the Driver/Rider, guaranteeing the Driver/Rider’s performance, payments, and good conduct under this Agreement.</li>
            <li>The Parties have agreed to the terms of hire and conditional purchase as set out below.</li>
          </ul>

          <p className="mb-4 font-bold uppercase text-center bg-gray-200 p-2 border border-gray-300">NOW, THEREFORE, IT IS HEREBY AGREED AS FOLLOWS:</p>

          <h3 className="font-bold text-base mt-6 border-b border-gray-300 pb-1 mb-4 uppercase">1. THE ASSET</h3>
          <p className="mb-2">1.1 The Administrator hereby agrees to let, and the Driver/Rider agrees to hire, the following commercial transport vehicle (the <strong>"Asset"</strong>):</p>
          <ul className="list-disc pl-5 mb-6 space-y-1 font-mono bg-white p-4 border border-gray-200 shadow-sm">
            <li><strong>Asset Type:</strong> {vehicle?.type || "N/A"}</li>
            <li><strong>Make/Model:</strong> {vehicle?.makeModel || "N/A"}</li>
            <li><strong>Year of Manufacture:</strong> {vehicle?.year || "N/A"}</li>
            <li><strong>Engine Number:</strong> {vehicle?.engineNumber || "N/A"}</li>
            <li><strong>Chassis Number:</strong> {vehicle?.chassisNumber || "N/A"}</li>
            <li><strong>Registration/Plate Number:</strong> {vehicle?.registrationNumber || "N/A"}</li>
          </ul>

          <h3 className="font-bold text-base mt-6 border-b border-gray-300 pb-1 mb-4 uppercase">2. FINANCIAL TERMS AND REMITTANCE</h3>
          <p className="mb-2">2.1 <strong>Total Hire Purchase Price:</strong> The total sum payable by the Driver/Rider to acquire ownership of the Asset is <strong>₦{contract?.totalPrice?.toLocaleString() || "---"}</strong>.</p>
          <p className="mb-2">2.2 <strong>Initial Deposit:</strong> The Driver/Rider has paid a non-refundable initial commitment deposit of <strong>₦{contract?.initialDeposit?.toLocaleString() || "0"}</strong>.</p>
          <p className="mb-2">2.3 <strong>Weekly Remittance:</strong> The Driver/Rider shall pay a fixed sum of <strong>₦{contract?.weeklyRemittance?.toLocaleString() || "---"}</strong> every week directly into the Administrator’s designated Client Remittance Account.</p>
          <p className="mb-2">2.4 <strong>Payment Schedule:</strong> Payments must be made no later than <strong>{contract?.paymentDay || "Friday 11:59 PM"}</strong> of every week.</p>
          <p className="mb-6">2.5 <strong>Tenure:</strong> The expected duration is <strong>{contract?.agreedDurationMonths ? contract.agreedDurationMonths * 4 : "---"}</strong> weeks, concluding when the Total Hire Purchase Price is fully paid.</p>

          <h3 className="font-bold text-base mt-6 border-b border-gray-300 pb-1 mb-4 uppercase">3. DRIVER/RIDER’S OBLIGATIONS AND RISK</h3>
          <p className="mb-2">3.1 <strong>Risk and Maintenance:</strong> The Driver/Rider assumes 100% financial and operational risk for the Asset from the moment of handover.</p>
          <p className="mb-2">3.2 <strong>Accident Damage:</strong> In the event of an accident, the Driver/Rider and/or their Guarantors shall bear the full cost of repairing the Asset.</p>
          <p className="mb-2">3.3 <strong>Uninterrupted Remittance:</strong> Mechanical failure, illness, or traffic delays shall not exempt the Driver/Rider from their obligation to pay the Weekly Remittance.</p>
          <p className="mb-6">3.4 <strong>GPS Tracker:</strong> The Driver/Rider acknowledges that a GPS tracking device is installed on the Asset. Tampering with, disconnecting, or damaging the GPS tracker is a fundamental breach of this Agreement and will result in immediate repossession.</p>

          <h3 className="font-bold text-base mt-6 border-b border-gray-300 pb-1 mb-4 uppercase">4. ADMINISTRATOR’S RIGHTS AND REPOSSESSION</h3>
          <p className="mb-2">4.1 <strong>Ownership:</strong> The Asset remains the absolute property of the Asset Owner until the Total Hire Purchase Price is fully paid.</p>
          <p className="mb-2">4.2 <strong>Default and Repossession:</strong> The Administrator reserves the right to forcefully repossess the Asset without prior court order if the Driver/Rider defaults on the Weekly Remittance for 7 consecutive days, tampers with the GPS, or uses the Asset for illegal activities.</p>
          <p className="mb-6">4.3 <strong>Forfeiture:</strong> In the event of repossession due to default, all previous payments made by the Driver/Rider shall be treated as standard rental fees and shall not be refunded.</p>

          <h3 className="font-bold text-base mt-6 border-b border-gray-300 pb-1 mb-4 uppercase">5. TRANSFER OF OWNERSHIP</h3>
          <p className="mb-6">5.1 Upon the complete and timely payment of the Total Hire Purchase Price, the Administrator shall facilitate the Change of Ownership Form transferring full legal ownership to the Driver/Rider.</p>

          <h3 className="font-bold text-base mt-6 border-b border-gray-300 pb-1 mb-4 uppercase">6. GUARANTORS’ UNDERTAKING AND LIABILITY</h3>
          <p className="mb-6">6.1 If the Driver/Rider absconds, damages the Asset, defaults on the Weekly Remittance, or abandons the Asset, the Administrator shall have the legal right to pursue the Guarantors for the recovery of the Asset, outstanding monetary balances, and any repair costs incurred.</p>

          <h3 className="font-bold text-base mt-6 border-b border-gray-300 pb-1 mb-4 uppercase">7. SIGNATURES</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-8">
            <div>
              <p className="font-bold mb-4">SIGNED by the ADMINISTRATOR</p>
              <div className="relative h-16 w-48 mb-2">
                 <img src="/images/stamp.png" alt="Company Seal" className="absolute left-0 -top-2 h-20 opacity-80 object-contain" />
                 <div className="absolute bottom-0 w-full border-b border-gray-400"></div>
              </div>
              <p className="font-bold text-xs mt-1">Yussuf Dare Orelaja (MD)</p>
              <p className="text-xs text-gray-500 mt-1">Date: {formattedDate}</p>
            </div>

            <div>
              <p className="font-bold text-red-600 mb-2 flex items-center gap-2"><PenTool size={16}/> SIGNED by the DRIVER/RIDER</p>
              <div className="bg-white border-2 border-dashed border-gray-400 w-full h-32 relative shadow-inner">
                <SignatureCanvas ref={riderSigCanvas} penColor="black" canvasProps={{ className: "w-full h-full cursor-crosshair absolute top-0 left-0" }} />
              </div>
              <div className="flex justify-end mt-1">
                <button type="button" onClick={() => riderSigCanvas.current?.clear()} className="text-[10px] text-red-500 font-bold uppercase hover:underline">Clear Canvas</button>
              </div>
              <p className="font-bold text-xs uppercase mt-2">Name: {rider?.firstName} {rider?.lastName}</p>
              <p className="text-xs text-gray-500 mt-1">Date: {formattedDate}</p>
            </div>
          </div>

          <h3 className="font-bold text-base mt-6 border-b border-gray-300 pb-1 mb-4 uppercase">8. GUARANTORS' EXECUTION</h3>
          <div className="mb-8 p-4 border border-gray-300 bg-white shadow-sm">
            <p className="text-xs italic mb-4 text-gray-700 leading-relaxed text-justify">
              <strong className="text-red-600">Note:</strong> The Guarantors below have previously executed Sworn Guarantor Attestations digitally. By doing so, they have legally bound themselves to be jointly and severally liable. This means if the Driver/Rider absconds, defaults on weekly remittances, steals the vehicle, or causes damages, the Administrator possesses the full legal authority to pursue, arrest, and recover the total financial loss directly from these Guarantors. Their digital signatures, identity documents, and verified IP addresses are permanently secured in the Administrator's legal vault.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="font-bold text-xs underline mb-1">FIRST GUARANTOR</p>
                <ul className="list-none pl-0 mb-2 space-y-1 text-xs">
                  <li>Name: {g1?.firstName || "N/A"} {g1?.lastName || "N/A"}</li>
                  <li>NIN: {g1?.nin || "N/A"} | Phone: {g1?.phone || "N/A"}</li>
                </ul>
                <div className="flex items-end gap-2 mb-1 h-12">
                  <span className="text-xs">Signature:</span>
                  {g1?.signatureUrl ? <img src={g1.signatureUrl} alt="G1 Sig" className="h-10 object-contain" /> : <span className="border-b border-gray-400 w-24 inline-block"></span>}
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
                  {g2?.signatureUrl ? <img src={g2.signatureUrl} alt="G2 Sig" className="h-10 object-contain" /> : <span className="border-b border-gray-400 w-24 inline-block"></span>}
                </div>
                <p className="text-[10px]">Signed: {g2?.signedAt ? new Date(g2.signedAt).toLocaleDateString('en-GB') : "N/A"}</p>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-base mt-6 border-b border-gray-300 pb-1 mb-4 uppercase">9. INDEPENDENT WITNESS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 bg-white p-6 border border-gray-300 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Witness Full Name</label>
                <input type="text" value={witnessName} onChange={(e) => setWitnessName(e.target.value)} className="w-full border-b border-gray-400 p-2 text-sm bg-transparent outline-none focus:border-black" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Witness Address</label>
                <input type="text" value={witnessAddress} onChange={(e) => setWitnessAddress(e.target.value)} className="w-full border-b border-gray-400 p-2 text-sm bg-transparent outline-none focus:border-black" placeholder="123 Example Street, Lagos" />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase mb-1"><PenTool size={14}/> Witness Signature</label>
              <div className="bg-white border-2 border-dashed border-gray-400 w-full h-24 relative shadow-inner">
                <SignatureCanvas ref={witnessSigCanvas} penColor="black" canvasProps={{ className: "w-full h-full cursor-crosshair absolute top-0 left-0" }} />
              </div>
              <div className="flex justify-end mt-1">
                <button type="button" onClick={() => witnessSigCanvas.current?.clear()} className="text-[10px] text-red-500 font-bold uppercase hover:underline">Clear Canvas</button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Date: {formattedDate}</p>
            </div>
          </div>

          {/* --- INTERACTIVE VEHICLE HANDOVER NOTE --- */}
          <div className="mt-12 pt-8 border-t-4 border-gray-800">
            <h2 className="text-xl font-black uppercase text-center mb-6 text-red-600 underline">VEHICLE HANDOVER & CONDITION NOTE</h2>
            
            <div className="bg-white p-6 border border-gray-300 shadow-sm mb-6">
              <p><strong>Asset:</strong> {vehicle?.makeModel || "N/A"} ({vehicle?.registrationNumber || "N/A"})</p>
              <p><strong>Handover Date:</strong> {formattedDate}</p>
            </div>

            <h3 className="font-bold text-base mb-4 uppercase">CONDITION CHECKLIST</h3>
            <div className="bg-white p-6 border border-gray-300 shadow-sm mb-6 space-y-6">
              
              <div>
                <p className="font-bold mb-2 text-red-600">Fuel Level:</p>
                <div className="flex flex-wrap gap-4">
                  {["Empty", "Quarter", "Half", "Full"].map(lvl => (
                    <label key={lvl} className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="fuel" onChange={() => handleRadio("fuelLevel", lvl)} className="accent-red-600 w-4 h-4" /> {lvl}</label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: "Front Bumper", key: "frontBumper" },
                  { label: "Rear Bumper", key: "rearBumper" },
                  { label: "Left Panels", key: "leftSide" },
                  { label: "Right Panels", key: "rightSide" },
                  { label: "Windshield", key: "windshield" },
                  { label: "Interior", key: "interior" },
                  { label: "A/C Status", key: "acStatus" }
                ].map(item => (
                  <div key={item.key} className="bg-gray-50 p-3 border border-gray-200">
                    <p className="text-xs font-bold uppercase mb-2">{item.label}</p>
                    <div className="flex gap-3">
                      {["OK", "Damaged", "N/A"].map(opt => (
                        <label key={opt} className="flex items-center gap-1 text-sm cursor-pointer"><input type="radio" name={item.key} onChange={() => handleRadio(item.key, opt)} className="accent-black w-4 h-4" /> {opt}</label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="font-bold text-base mb-4 uppercase">ACCESSORIES INCLUDED</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 border border-gray-300 shadow-sm mb-8">
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded border border-transparent hover:border-gray-200"><input type="checkbox" onChange={() => handleCheckbox("keys")} className="accent-red-600 w-5 h-5" /> Vehicle Ignition Keys</label>
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded border border-transparent hover:border-gray-200"><input type="checkbox" onChange={() => handleCheckbox("spareTire")} className="accent-red-600 w-5 h-5" /> Spare Tire (Uncheck for Keke)</label>
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded border border-transparent hover:border-gray-200"><input type="checkbox" onChange={() => handleCheckbox("jack")} className="accent-red-600 w-5 h-5" /> Car Jack & Wheel Spanner</label>
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded border border-transparent hover:border-gray-200"><input type="checkbox" onChange={() => handleCheckbox("cCaution")} className="accent-red-600 w-5 h-5" /> C-Caution (Warning Triangle)</label>
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded border border-transparent hover:border-gray-200"><input type="checkbox" onChange={() => handleCheckbox("extinguisher")} className="accent-red-600 w-5 h-5" /> Fire Extinguisher</label>
              <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded border border-transparent hover:border-gray-200"><input type="checkbox" onChange={() => handleCheckbox("documents")} className="accent-red-600 w-5 h-5" /> Original Particulars (Copies)</label>
            </div>

            <div className="p-4 bg-red-50 border border-red-600 font-bold text-sm uppercase mb-8 flex items-center gap-3 text-red-800">
              <AlertTriangle size={24} className="shrink-0" />
              <span>[✓] GPS Tracker installed, tested, and confirmed active by Administrator.</span>
            </div>

            <p className="text-justify mb-8 italic">I, <strong>{rider?.firstName} {rider?.lastName}</strong>, confirm receiving the vehicle in the condition stated above and assume full responsibility for it. My signature on this agreement serves as my signature for this Handover Note.</p>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-4 border-t border-gray-300 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10">
          <label className="flex items-start gap-3 cursor-pointer flex-1 group">
            <input type="checkbox" className="mt-1 w-5 h-5 accent-red-600 cursor-pointer" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span className="text-xs text-gray-600 font-bold leading-relaxed transition group-hover:text-black">I, {rider.firstName}, acknowledge that checking this box, filling the handover note, and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.</span>
          </label>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto bg-red-600 text-white font-bold uppercase tracking-wider rounded shadow-lg hover:bg-red-700 transition disabled:opacity-50 shrink-0"
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> {loadingText}</> : <><CheckSquare size={18} /> Execute Agreement</>}
          </button>
        </div>

        {/* HIDDEN OFF-SCREEN RENDERER FOR PERFECT A4 PDF */}
        <div className="absolute top-[-10000px] left-[-10000px]">
          <div ref={pdfRef} className="bg-white w-[800px] p-[40px]">
            {renderPdfDocument()}
          </div>
        </div>

      </div>
    </div>
  );
}
