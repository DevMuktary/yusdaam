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
    return () => { document.head.removeChild(meta); };
  }, []);

  const [step, setStep] = useState(1); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [contractUrl, setContractUrl] = useState<string | null>(null);

  // Canvases for the UI
  const riderSigCanvas = useRef<SignatureCanvas>(null);
  const witnessSigCanvas = useRef<SignatureCanvas>(null);
  
  // Hidden div for PDF compilation
  const pdfRef = useRef<HTMLDivElement>(null);
  
  // Form State
  const [witnessName, setWitnessName] = useState("");
  const [witnessAddress, setWitnessAddress] = useState("");
  const [agreed, setAgreed] = useState(false);

  // States to pass base64 signatures to the hidden PDF
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

  const handleCheckbox = (field: string) => setHandoverData(prev => ({ ...prev, [field]: !(prev as any)[field] }));
  const handleRadio = (field: string, value: string) => setHandoverData(prev => ({ ...prev, [field]: value }));

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const g1 = guarantors[0] || {};
  const g2 = guarantors[1] || {};

  const handleSubmit = async () => {
    setErrorMsg("");
    if (!witnessName || !witnessAddress) return setErrorMsg("Please provide your witness's name and address.");
    if (riderSigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your Driver/Rider signature.");
    if (witnessSigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your witness signature.");
    if (!handoverData.fuelLevel) return setErrorMsg("Please complete the Handover Note (Fuel Level is required).");
    if (!agreed) return setErrorMsg("You must check the agreement box to proceed.");

    setIsSubmitting(true);
    setLoadingText("Preparing Document...");

    // 1. Extract base64 signatures
    const rSig = riderSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    const wSig = witnessSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    setPdfRiderSig(rSig || null);
    setPdfWitnessSig(wSig || null);

    // 2. Wait for React to render the hidden PDF with the signatures
    setTimeout(async () => {
      try {
        setLoadingText("Compiling Official PDF...");
        
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

        setLoadingText("Securing in Vault...");
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
        setErrorMsg(err.message || "An error occurred during submission.");
        setIsSubmitting(false);
      }
    }, 800); // 800ms buffer ensures images load in the hidden div
  };

  // --- COMPONENT 1: THE SCREEN READING VIEW ---
  const ScreenDocument = () => (
    <div className="bg-white p-6 sm:p-10 text-gray-900 font-sans text-sm sm:text-base leading-relaxed rounded-xl shadow-inner border border-gray-200">
      <div className="text-center border-b-2 border-gray-200 pb-6 mb-8">
        <h1 className="text-3xl font-black text-void-navy tracking-widest mb-1">YUSDAAM<span className="text-signal-red">.</span></h1>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Fleet Management Nigeria Limited</p>
      </div>

      <h2 className="text-xl font-black uppercase text-center mb-8 text-signal-red">Driver/Rider Hire Purchase Agreement</h2>
      <p className="mb-4"><strong>THIS AGREEMENT</strong> is made this <strong>{formattedDate}</strong>.</p>
      
      <p className="mb-2 font-bold text-void-navy">BETWEEN</p>
      <p className="mb-6"><strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong> (RC: 9335611), of 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos (hereinafter referred to as the <strong>“Administrator”</strong>);</p>
      
      <p className="mb-2 font-bold text-void-navy">AND</p>
      <p className="mb-6"><strong>{rider?.firstName} {rider?.lastName}</strong>, NIN: <strong>{rider?.nin}</strong>, residing at <strong>{rider?.streetAddress}</strong>, Phone: <strong>{rider?.phoneNumber}</strong> (hereinafter referred to as the <strong>“Driver/Rider”</strong>);</p>

      <h3 className="font-bold text-lg mt-8 mb-4 border-b border-gray-200 pb-2 text-void-navy uppercase">1. The Asset</h3>
      <ul className="list-disc pl-5 mb-6 space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <li><strong>Asset Type:</strong> {vehicle?.type || "___"}</li>
        <li><strong>Make/Model:</strong> {vehicle?.makeModel || "___"}</li>
        <li><strong>Registration/Plate Number:</strong> {vehicle?.registrationNumber || "___"}</li>
        <li><strong>Chassis Number:</strong> {vehicle?.chassisNumber || "___"}</li>
      </ul>

      <h3 className="font-bold text-lg mt-8 mb-4 border-b border-gray-200 pb-2 text-void-navy uppercase">2. Financial Terms</h3>
      <p className="mb-3"><strong>Total Hire Purchase Price:</strong> ₦{contract?.totalPrice?.toLocaleString() || "___"}</p>
      <p className="mb-3"><strong>Weekly Remittance:</strong> ₦{contract?.weeklyRemittance?.toLocaleString() || "___"}</p>
      <p className="mb-6"><strong>Tenure:</strong> {contract?.agreedDurationMonths ? contract.agreedDurationMonths * 4 : "___"} weeks.</p>

      <h3 className="font-bold text-lg mt-8 mb-4 border-b border-gray-200 pb-2 text-void-navy uppercase">3. Driver/Rider's Obligations & Risk</h3>
      <p className="mb-6">The Driver/Rider assumes <strong>100% financial and operational risk</strong> for the Asset from handover. The Driver/Rider shall be solely responsible for the cost of all mechanical repairs, routine maintenance, and breakdowns. Accident damage repair is the full responsibility of the Driver/Rider and their Guarantors.</p>

      <h3 className="font-bold text-lg mt-8 mb-4 border-b border-gray-200 pb-2 text-void-navy uppercase">4. Administrator's Rights</h3>
      <p className="mb-6">The Administrator reserves the right to forcefully repossess the Asset without prior court order if the Driver/Rider defaults on the Weekly Remittance for <strong>7</strong> consecutive days, tampers with the GPS tracker, or uses the Asset for illegal activity. In such events, all previous payments are forfeited as standard rental fees.</p>
    </div>
  );

  // --- COMPONENT 2: THE HIDDEN PERFECT PDF TEMPLATE ---
  const PdfDocument = () => {
    const headingStyle = "font-bold text-[14px] underline mt-6 mb-2 text-black uppercase";
    return (
      <div className="bg-white text-black font-serif text-[12px] leading-relaxed">
        
        {/* HUGE CORPORATE LETTERHEAD */}
        <div className="text-center border-b-4 border-[#001232] pb-6 mb-8">
          <h1 className="text-5xl text-[#001232] font-black tracking-widest mb-2">YUSDAAM<span className="text-[#FFB902]">.</span></h1>
          <p className="text-sm font-bold uppercase tracking-widest text-gray-800">YUSDAAM Autos Fleet Management Nigeria Limited</p>
          <p className="text-[10px] text-gray-600 mt-1 font-mono tracking-wide">RC: 9335611 | 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos | admin@yusdaamautos.com</p>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-xl font-black uppercase underline mb-2">DRIVER/RIDER HIRE PURCHASE AGREEMENT</h2>
        </div>

        <p className="mb-4"><strong>THIS AGREEMENT</strong> is made this <strong>{formattedDate}</strong>.</p>
        
        <p className="mb-2 font-bold text-lg">BETWEEN</p>
        <p className="mb-4 text-justify"><strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong>, a company duly incorporated under the Companies and Allied Matters Act (CAMA) with RC: 9335611, having its registered office at 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos, Nigeria (hereinafter referred to as the <strong>“Administrator”</strong>, acting as the lawful Attorney for the Asset Owner), of the first part;</p>
        
        <p className="mb-2 font-bold text-lg">AND</p>
        <p className="mb-4 text-justify"><strong>{rider?.firstName} {rider?.lastName}</strong>, NIN: <strong>{rider?.nin}</strong>, residing at <strong>{rider?.streetAddress}</strong>, Email: <strong>{rider?.email || "N/A"}</strong>, Phone: <strong>{rider?.phoneNumber}</strong> (hereinafter referred to as the <strong>“Driver/Rider”</strong>), of the second part;</p>
        
        <p className="mb-2 font-bold text-lg">AND</p>
        <p className="mb-8 text-justify"><strong>THE GUARANTORS</strong>, whose names, addresses, and details are expressly set out in Clause 9 of this Agreement (hereinafter referred to as the <strong>"Guarantors"</strong>), of the third part.</p>

        <h3 className={headingStyle}>RECITALS</h3>
        <p className="mb-2"><strong>WHEREAS:</strong></p>
        <ol className="list-[upper-alpha] pl-8 mb-8 space-y-3 text-justify">
          <li>The Administrator manages commercial transport vehicles on behalf of legitimate asset owners via a legally executed Power of Attorney.</li>
          <li>The Driver/Rider desires to hire, and ultimately purchase, the commercial transport asset described herein under a weekly remittance structure.</li>
          <li>The Guarantors have agreed to stand as full financial and legal sureties for the Driver/Rider, guaranteeing the Driver/Rider’s performance, payments, and good conduct under this Agreement.</li>
          <li>The Parties have agreed to the terms of hire and conditional purchase as set out below.</li>
        </ol>

        <p className="mb-6 font-bold uppercase text-center bg-gray-100 p-3 border border-gray-300">NOW, THEREFORE, IT IS HEREBY AGREED AS FOLLOWS:</p>

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
        <p className="mb-3 text-justify"><strong>2.2 Initial Deposit:</strong> The Driver/Rider has paid a non-refundable initial commitment deposit of <strong>₦{contract?.initialDeposit?.toLocaleString() || "0"}</strong>.</p>
        <p className="mb-3 text-justify"><strong>2.3 Weekly Remittance:</strong> The Driver/Rider shall pay a fixed sum of <strong>₦{contract?.weeklyRemittance?.toLocaleString() || "_____________"}</strong> every week directly into the Administrator’s designated Client Remittance Account.</p>
        <p className="mb-3 text-justify"><strong>2.4 Payment Schedule:</strong> Payments must be made no later than <strong>{contract?.paymentDay || "Friday 11:59 PM"}</strong> of every week. Cash payments to unauthorized staff are strictly prohibited.</p>
        <p className="mb-8 text-justify"><strong>2.5 Tenure:</strong> The expected duration of this hire purchase arrangement is <strong>{contract?.agreedDurationMonths ? contract.agreedDurationMonths * 4 : "_____"}</strong> weeks, concluding when the Total Hire Purchase Price is fully paid.</p>

        <h3 className={headingStyle}>3. DRIVER/RIDER’S OBLIGATIONS AND RISK</h3>
        <p className="mb-3 text-justify"><strong>3.1 Risk and Maintenance:</strong> The Driver/Rider assumes <strong>100% financial and operational risk</strong> for the Asset from the moment of handover. The Driver/Rider shall be solely responsible for the cost of all mechanical repairs, routine maintenance, and breakdowns.</p>
        <p className="mb-3 text-justify"><strong>3.2 Accident Damage:</strong> In the event of an accident, the Driver/Rider and/or their Guarantors shall bear the full cost of repairing the Asset.</p>
        <p className="mb-3 text-justify"><strong>3.3 Uninterrupted Remittance:</strong> Mechanical failure, illness, or traffic delays shall not exempt the Driver/Rider from their obligation to pay the Weekly Remittance.</p>
        <p className="mb-3 text-justify"><strong>3.4 Compliance with Laws:</strong> The Driver/Rider shall possess a valid driver’s license and comply with all traffic laws. Any fines or impoundment fees shall be paid entirely by the Driver/Rider.</p>
        <p className="mb-8 text-justify"><strong>3.5 GPS Tracker:</strong> The Driver/Rider acknowledges that a GPS tracking device is installed on the Asset. Tampering with, disconnecting, or damaging the GPS tracker is a fundamental breach of this Agreement and will result in immediate repossession.</p>

        <h3 className={headingStyle}>4. ADMINISTRATOR’S RIGHTS AND REPOSSESSION</h3>
        <p className="mb-3 text-justify"><strong>4.1 Ownership:</strong> The Asset remains the absolute property of the Asset Owner until the Total Hire Purchase Price is fully paid. The Driver/Rider is merely a "Hirer" and cannot sell, pawn, rent, or use the Asset as collateral.</p>
        <p className="mb-3 text-justify"><strong>4.2 Default and Repossession:</strong> The Administrator reserves the right to forcefully repossess the Asset without prior court order if the Driver/Rider defaults on the Weekly Remittance for <strong>7</strong> consecutive days, tampers with the GPS, or uses the Asset for illegal activity.</p>
        <p className="mb-8 text-justify"><strong>4.3 Forfeiture:</strong> In the event of repossession due to default, all previous payments made by the Driver/Rider shall be treated as standard rental fees for the use of the Asset and shall <strong>not</strong> be refunded.</p>

        <h3 className={headingStyle}>5. TRANSFER OF OWNERSHIP</h3>
        <p className="mb-3 text-justify"><strong>5.1</strong> Upon the complete payment of the Total Hire Purchase Price, the Administrator shall issue a <strong>Letter of Completion</strong> to the Driver/Rider and facilitate the Change of Ownership.</p>

        <h3 className={headingStyle}>6. GUARANTORS’ UNDERTAKING AND LIABILITY</h3>
        <p className="mb-3 text-justify"><strong>6.1</strong> If the Driver/Rider absconds, damages the Asset, defaults on the Remittance, or abandons the Asset, the Administrator shall have the legal right to pursue the Guarantors for the recovery of the Asset, outstanding monetary balances, and repair costs.</p>

        {/* --- PAGE BREAK 1: GUARANTORS & SIGNATURES --- */}
        <div style={{ pageBreakBefore: "always", paddingTop: "40px" }}></div>

        <h3 className={headingStyle}>7. SIGNATURES</h3>
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <p className="mb-4"><strong>SIGNED by the ADMINISTRATOR</strong><br/>
            <span className="text-[10px]">YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</span></p>
            <div className="relative h-24 w-48 mb-2">
              <img src="/images/stamp.png" alt="Company Stamp" className="absolute left-0 bottom-0 h-24 object-contain opacity-90 mix-blend-multiply" />
              <div className="absolute bottom-4 w-full border-b border-black"></div>
            </div>
            <p className="text-xs"><strong>Authorized Signature:</strong> Yussuf Dare Orelaja (MD)</p>
            <p className="text-xs mt-1"><strong>Date:</strong> {formattedDate}</p>
          </div>

          <div>
            <p className="mb-4"><strong>SIGNED by the DRIVER/RIDER</strong><br/>
            <span className="text-[10px]">I confirm that I agree to be bound by the terms.</span></p>
            <div className="relative h-24 w-full mb-2">
              {pdfRiderSig && <img src={pdfRiderSig} alt="Rider Sig" className="absolute left-0 bottom-0 h-20 object-contain mix-blend-multiply" />}
              <div className="absolute bottom-4 w-full border-b border-black"></div>
            </div>
            <p className="text-xs mt-4"><strong>Name:</strong> {rider?.firstName} {rider?.lastName}</p>
            <p className="text-xs mt-1"><strong>Date:</strong> {formattedDate}</p>
          </div>
        </div>

        <h3 className={headingStyle}>8. GUARANTORS' EXECUTION</h3>
        <div className="mb-10 p-6 border-2 border-black bg-white">
          <p className="text-[10px] font-bold italic mb-6 text-gray-700 leading-relaxed text-justify">
            Note: The Guarantors below have previously executed Sworn Guarantor Attestations digitally. Their IP addresses, identity documents, and digital signatures are verified and held by the Administrator. Their signatures are automatically affixed below.
          </p>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="mb-2 text-xs"><strong>FIRST GUARANTOR</strong><br/>
              <span className="italic">I hereby undertake to be jointly and severally liable for any default, debt, theft, or damage caused by the Driver/Rider during the pendency of this Agreement.</span></p>
              <ul className="list-none pl-0 mb-4 space-y-1 text-[11px]">
                <li><strong>Full Name:</strong> {g1?.firstName || "_____"} {g1?.lastName || "_____"}</li>
                <li><strong>NIN:</strong> {g1?.nin || "_____"}</li>
                <li><strong>Address:</strong> {g1?.address || "_____"}</li>
                <li><strong>Phone:</strong> {g1?.phone || "_____"}</li>
              </ul>
              <div className="relative h-16 w-full mb-1">
                {g1?.signatureUrl ? <img src={g1.signatureUrl} alt="G1 Sig" className="absolute left-0 bottom-0 h-16 object-contain mix-blend-multiply" /> : <div className="absolute bottom-2 w-full border-b border-black"></div>}
              </div>
              <p className="text-[10px]"><strong>Date:</strong> {g1?.signedAt ? new Date(g1.signedAt).toLocaleDateString('en-GB') : "_____"}</p>
            </div>

            <div>
              <p className="mb-2 text-xs"><strong>SECOND GUARANTOR</strong><br/>
              <span className="italic">I hereby undertake to be jointly and severally liable for any default, debt, theft, or damage caused by the Driver/Rider during the pendency of this Agreement.</span></p>
              <ul className="list-none pl-0 mb-4 space-y-1 text-[11px]">
                <li><strong>Full Name:</strong> {g2?.firstName || "_____"} {g2?.lastName || "_____"}</li>
                <li><strong>NIN:</strong> {g2?.nin || "_____"}</li>
                <li><strong>Address:</strong> {g2?.address || "_____"}</li>
                <li><strong>Phone:</strong> {g2?.phone || "_____"}</li>
              </ul>
              <div className="relative h-16 w-full mb-1">
                {g2?.signatureUrl ? <img src={g2.signatureUrl} alt="G2 Sig" className="absolute left-0 bottom-0 h-16 object-contain mix-blend-multiply" /> : <div className="absolute bottom-2 w-full border-b border-black"></div>}
              </div>
              <p className="text-[10px]"><strong>Date:</strong> {g2?.signedAt ? new Date(g2.signedAt).toLocaleDateString('en-GB') : "_____"}</p>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <p className="font-bold mb-4 uppercase text-sm">IN THE PRESENCE OF INDEPENDENT WITNESS:</p>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <strong>Name:</strong> <span className="flex-1 border-b border-black pb-1">{witnessName || "______________________________"}</span>
              </div>
              <div className="flex items-center gap-2">
                <strong>Address:</strong> <span className="flex-1 border-b border-black pb-1">{witnessAddress || "______________________________"}</span>
              </div>
            </div>
            <div className="relative h-20 w-full">
              {pdfWitnessSig && <img src={pdfWitnessSig} alt="Witness Sig" className="absolute left-0 bottom-0 h-20 object-contain mix-blend-multiply" />}
              <div className="absolute bottom-4 w-full border-b border-black"></div>
            </div>
          </div>
          <p className="mt-4 text-xs"><strong>Date:</strong> {formattedDate}</p>
        </div>

        {/* --- PAGE BREAK 2: HANDOVER NOTE --- */}
        <div style={{ pageBreakBefore: "always", paddingTop: "40px" }}></div>

        <h2 className="text-xl font-black uppercase text-center mb-6 underline">VEHICLE HANDOVER AND CONDITION NOTE</h2>
        <p className="mb-6 text-sm"><strong>Date of Handover:</strong> {formattedDate}</p>
        
        <h3 className={headingStyle}>1. VEHICLE DETAILS</h3>
        <p className="mb-8 leading-relaxed bg-gray-50 border border-gray-300 p-4 font-mono text-[11px]">
          <strong>Asset Type:</strong> {vehicle?.type || "___________________"}<br/>
          <strong>Make & Model:</strong> {vehicle?.makeModel || "___________________"}<br/>
          <strong>Registration/Plate No:</strong> {vehicle?.registrationNumber || "___________________"}<br/>
          <strong>Chassis Number:</strong> {vehicle?.chassisNumber || "___________________"}
        </p>

        <h3 className={headingStyle}>2. CURRENT STATUS AT HANDOVER</h3>
        <p className="mb-4"><strong>Odometer/Mileage Reading:</strong> _______________ km <em className="text-[10px] text-gray-500">(To be filled by Administrator if applicable)</em></p>
        <div className="flex gap-4 mb-8 items-center font-bold">
          <span>Fuel Level:</span>
          {["Empty", "Quarter", "Half", "Full"].map(level => (
            <span key={level} className="font-normal">{handoverData.fuelLevel === level ? "[X]" : "[ ]"} {level}</span>
          ))}
        </div>

        <h3 className={headingStyle}>3. EXTERIOR & INTERIOR CONDITION</h3>
        <div className="space-y-4 mb-8">
          {[
            { label: "Front Bumper & Grille", key: "frontBumper" },
            { label: "Rear Bumper & Trunk", key: "rearBumper" },
            { label: "Left Side (Doors/Panels)", key: "leftSide" },
            { label: "Right Side (Doors/Panels)", key: "rightSide" },
            { label: "Windshield & Mirrors", key: "windshield" },
            { label: "Interior Seats & Dashboard", key: "interior" },
          ].map((item) => (
            <div key={item.key} className="flex items-center border-b border-gray-200 pb-2">
              <span className="w-64 font-bold">{item.label}:</span>
              <div className="flex gap-6">
                {["OK", "Damaged", "N/A"].map(opt => (
                  <span key={opt}>{((handoverData as any)[item.key] === opt) ? "[X]" : "[ ]"} {opt}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mb-10 items-center font-bold border-b border-gray-300 pb-4">
          <span>Air Conditioning:</span>
          {["Working", "Not Working", "N/A"].map(status => (
            <span key={status} className="font-normal">{handoverData.acStatus === status ? "[X]" : "[ ]"} {status}</span>
          ))}
        </div>

        <h3 className={headingStyle}>4. ACCESSORIES & TOOLS INCLUDED</h3>
        <div className="grid grid-cols-2 gap-4 mb-10 text-[11px]">
          <span>{handoverData.keys ? "[X]" : "[ ]"} Vehicle Ignition Keys</span>
          <span>{handoverData.spareTire ? "[X]" : "[ ]"} Spare Tire</span>
          <span>{handoverData.jack ? "[X]" : "[ ]"} Car Jack & Wheel Spanner</span>
          <span>{handoverData.cCaution ? "[X]" : "[ ]"} C-Caution (Warning Triangle)</span>
          <span>{handoverData.extinguisher ? "[X]" : "[ ]"} Fire Extinguisher</span>
          <span>{handoverData.documents ? "[X]" : "[ ]"} Original Insurance & Particulars</span>
        </div>

        <div className="p-4 bg-gray-100 border-2 border-black font-bold text-sm uppercase mb-10">
          [✓] GPS Tracker installed, tested, and confirmed active by Administrator.
        </div>

        <h3 className={headingStyle}>DRIVER/RIDER’S DECLARATION</h3>
        <p className="mb-6 text-justify leading-relaxed">I, <strong>{rider.firstName} {rider.lastName}</strong>, hereby confirm that I have physically inspected the vehicle described above. I acknowledge that I am receiving the vehicle and the checked accessories in the exact condition stated in this document. I agree that I am fully responsible for maintaining this condition and replacing any missing tools or accessories as stipulated in my Hire Purchase Agreement.</p>
        
        <div className="grid grid-cols-2 gap-10 mt-12 pt-8 border-t-2 border-black">
          <div>
            <p className="font-bold mb-4 uppercase">HANDED OVER BY (For Yusdaam Autos):</p>
            <p className="mb-2"><strong>Name:</strong> Yussuf Dare Orelaja</p>
            <div className="relative h-20 w-48 mb-2">
              <img src="/images/stamp.png" alt="Company Stamp" className="absolute left-0 bottom-0 h-20 object-contain opacity-90 mix-blend-multiply" />
              <div className="absolute bottom-4 w-full border-b border-black"></div>
            </div>
            <p className="text-sm"><strong>Date:</strong> {formattedDate}</p>
          </div>
          <div>
            <p className="font-bold text-red-600 uppercase mb-4">DRIVER/RIDER'S SIGNATURE</p>
            <div className="relative h-20 w-full mb-2">
              {pdfRiderSig && <img src={pdfRiderSig} alt="Rider Sig" className="absolute left-0 bottom-0 h-20 object-contain mix-blend-multiply" />}
              <div className="absolute bottom-4 w-full border-b border-black"></div>
            </div>
            <p className="text-[10px] text-gray-500 italic mb-2">Signature automatically affixed from master agreement.</p>
            <p className="text-sm"><strong>Date:</strong> {formattedDate}</p>
          </div>
        </div>

      </div>
    );
  };

  // --- STEP 2: SUCCESS VIEW ---
  if (step === 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-void-navy/95 backdrop-blur-md p-4 h-[100dvh] w-screen overscroll-none">
        <div ref={topRef} className="max-w-3xl mx-auto bg-void-light/5 border border-emerald-500/30 p-8 sm:p-12 rounded-2xl text-center shadow-2xl animate-in fade-in zoom-in duration-500 w-full">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-wider text-crisp-white mb-2">Agreement Executed</h2>
          <p className="text-slate-light leading-relaxed mb-10">
            Your digital signature and handover condition note have been permanently secured. Your dashboard has been unlocked and your fleet assignment is now active.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {contractUrl && (
              <a href={`${contractUrl}?fl_attachment=YUSDAAM_HPA_${rider.firstName}_${rider.lastName}.pdf`} download className="flex items-center justify-center gap-2 px-6 py-4 bg-void-navy border border-cobalt/30 text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-void-light/10 transition">
                <Download size={16} /> Download Copy
              </a>
            )}
            <button onClick={() => router.refresh()} className="flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-600 transition shadow-lg">
              Access Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 1: UI VIEW ---
  return (
    <div className="fixed inset-0 z-[100] h-[100dvh] w-screen flex flex-col bg-void-navy/95 backdrop-blur-md sm:p-6 overscroll-none">
      <div ref={topRef} className="bg-gray-100 w-full max-w-5xl mx-auto h-full sm:h-auto sm:max-h-[95dvh] rounded-none sm:rounded-2xl shadow-2xl flex flex-col border-0 sm:border border-gray-400 overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-void-navy p-4 border-b border-gray-400 flex items-center gap-4 shrink-0 shadow-md z-10">
          <ShieldCheck size={32} className="text-signal-red shrink-0" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-crisp-white uppercase tracking-wider">Pending Legal Execution</h2>
            <p className="text-[10px] sm:text-xs text-slate-light font-bold uppercase tracking-widest">Read, complete handover note, and sign below.</p>
          </div>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto overscroll-none touch-pan-y bg-gray-200 p-0 sm:p-8">
          {errorMsg && (
            <div className="sticky top-0 z-10 bg-red-100 border-b border-red-500 text-red-700 px-4 py-3 text-sm font-bold flex items-center gap-2 shadow-lg">
              <XCircle size={18} /> {errorMsg}
            </div>
          )}

          {/* VISIBLE AGREEMENT TEXT */}
          <div className="mb-6 sm:mb-8 mx-auto w-full max-w-4xl">
            <ScreenDocument />
          </div>

          {/* INTERACTIVE HANDOVER NOTE FORM */}
          <div className="mb-8 mx-auto w-full max-w-4xl bg-white p-6 sm:p-10 rounded-xl shadow border border-gray-300">
            <h3 className="text-xl font-black text-void-navy uppercase border-b-2 border-gray-200 pb-2 mb-6">Vehicle Handover Note</h3>
            
            <div className="space-y-6">
              <div>
                <p className="font-bold text-gray-800 mb-2">Fuel Level:</p>
                <div className="flex flex-wrap gap-4">
                  {["Empty", "Quarter", "Half", "Full"].map(level => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100">
                      <input type="radio" name="fuel" checked={handoverData.fuelLevel === level} onChange={() => handleRadio("fuelLevel", level)} className="w-4 h-4 accent-signal-red" /> {level}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-gray-800 mb-2">Air Conditioning:</p>
                <div className="flex flex-wrap gap-4">
                  {["Working", "Not Working", "N/A"].map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100">
                      <input type="radio" name="ac" checked={handoverData.acStatus === status} onChange={() => handleRadio("acStatus", status)} className="w-4 h-4 accent-signal-red" /> {status}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-gray-800 mb-2">Exterior/Interior Condition (Select OK, Damaged, or N/A):</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Front Bumper", key: "frontBumper" },
                    { label: "Rear Bumper", key: "rearBumper" },
                    { label: "Left Side", key: "leftSide" },
                    { label: "Right Side", key: "rightSide" },
                    { label: "Windshield/Mirrors", key: "windshield" },
                    { label: "Interior/Seats", key: "interior" },
                  ].map(item => (
                    <div key={item.key} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                      <span className="text-sm font-medium">{item.label}</span>
                      <select onChange={(e) => handleRadio(item.key, e.target.value)} value={(handoverData as any)[item.key]} className="bg-white border border-gray-300 rounded p-1 text-sm outline-none">
                        <option value="">Select...</option>
                        <option value="OK">OK</option>
                        <option value="Damaged">Damaged</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-gray-800 mb-2">Accessories Received (Check all that apply):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg bg-gray-50"><input type="checkbox" checked={handoverData.keys} onChange={() => handleCheckbox("keys")} className="w-5 h-5 accent-signal-red" /> Vehicle Ignition Keys</label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg bg-gray-50"><input type="checkbox" checked={handoverData.spareTire} onChange={() => handleCheckbox("spareTire")} className="w-5 h-5 accent-signal-red" /> Spare Tire (Uncheck if Keke)</label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg bg-gray-50"><input type="checkbox" checked={handoverData.jack} onChange={() => handleCheckbox("jack")} className="w-5 h-5 accent-signal-red" /> Car Jack & Wheel Spanner</label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg bg-gray-50"><input type="checkbox" checked={handoverData.cCaution} onChange={() => handleCheckbox("cCaution")} className="w-5 h-5 accent-signal-red" /> C-Caution (Warning Triangle)</label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg bg-gray-50"><input type="checkbox" checked={handoverData.extinguisher} onChange={() => handleCheckbox("extinguisher")} className="w-5 h-5 accent-signal-red" /> Fire Extinguisher</label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-200 rounded-lg bg-gray-50"><input type="checkbox" checked={handoverData.documents} onChange={() => handleCheckbox("documents")} className="w-5 h-5 accent-signal-red" /> Particulars (Copies)</label>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 font-bold text-sm text-blue-900 rounded flex items-center gap-2 uppercase tracking-widest">
                <AlertTriangle size={18} /> GPS Tracker Confirmed Active
              </div>
            </div>
          </div>

          {/* INTERACTIVE SIGNATURE FORM */}
          <div className="mx-auto w-full max-w-4xl bg-void-navy p-6 sm:p-10 rounded-xl shadow-xl border border-cobalt/30">
            <h3 className="text-xl font-black text-crisp-white uppercase border-b border-cobalt/30 pb-2 mb-6">Final Signatures</h3>
            
            {/* Witness */}
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
                <div className="bg-white rounded-lg border-2 border-cobalt/30 overflow-hidden h-32 relative">
                  <SignatureCanvas ref={witnessSigCanvas} clearOnResize={false} penColor="#001232" canvasProps={{ className: "w-full h-full cursor-crosshair absolute top-0 left-0" }} />
                  <button type="button" onClick={() => witnessSigCanvas.current?.clear()} className="absolute bottom-2 right-2 text-[10px] uppercase font-bold text-red-500 bg-white px-2 py-1 rounded shadow">Clear</button>
                </div>
              </div>
            </div>

            {/* Rider */}
            <div className="mb-6 p-6 bg-signal-red/5 border border-signal-red/20 rounded-xl">
              <label className="flex items-center gap-2 text-xs font-bold text-signal-red uppercase tracking-widest mb-3"><PenTool size={14} /> Draw Driver/Rider Signature</label>
              <div className="bg-white rounded-lg border-2 border-signal-red/30 overflow-hidden h-40 relative shadow-inner">
                <SignatureCanvas ref={riderSigCanvas} clearOnResize={false} penColor="#001232" canvasProps={{ className: "w-full h-full cursor-crosshair absolute top-0 left-0" }} />
                <button type="button" onClick={() => riderSigCanvas.current?.clear()} className="absolute bottom-2 right-2 text-[10px] uppercase font-bold text-red-500 bg-white px-2 py-1 rounded shadow">Clear</button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer group bg-void-light/5 p-4 rounded-lg border border-cobalt/20 hover:border-cobalt/50 transition">
              <input type="checkbox" className="mt-1 w-5 h-5 accent-signal-red cursor-pointer shrink-0" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span className="text-xs text-slate-light leading-relaxed group-hover:text-crisp-white transition">
                I, <strong>{rider.firstName} {rider.lastName}</strong>, acknowledge that checking this box, submitting my handover note, and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.
              </span>
            </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-white p-4 border-t border-gray-300 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center sm:text-left flex-1 font-bold">
            Ensure all fields are accurate before execution.
          </p>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto bg-signal-red text-white font-black uppercase tracking-wider rounded-xl shadow-lg hover:bg-red-700 transition disabled:opacity-50 shrink-0"
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> {loadingText}</> : <><CheckSquare size={18} /> Execute Agreement</>}
          </button>
        </div>

        {/* HIDDEN OFF-SCREEN RENDERER FOR PERFECT A4 PDF */}
        <div className="absolute top-[-10000px] left-[-10000px] pointer-events-none">
          <div ref={pdfRef} className="bg-white w-[800px] p-[40px]">
            <PdfDocument />
          </div>
        </div>

      </div>
    </div>
  );
}
