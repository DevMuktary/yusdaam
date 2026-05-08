"use client";

import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { Loader2, Download, ArrowRight, CheckCircle2, ShieldCheck, XCircle, CheckSquare } from "lucide-react";

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
  
  // Holds base64 image strings for the final PDF generation
  const [pdfRiderSig, setPdfRiderSig] = useState<string | null>(null);
  const [pdfWitnessSig, setPdfWitnessSig] = useState<string | null>(null);

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
    if (!witnessName || !witnessAddress) return setErrorMsg("Please provide your witness's name and address.");
    if (riderSigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your Driver/Rider signature.");
    if (witnessSigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your witness signature.");
    if (!handoverData.fuelLevel) return setErrorMsg("Please select the fuel level in the handover note.");
    if (!agreed) return setErrorMsg("You must check the final agreement box to proceed.");

    setIsSubmitting(true);

    // Capture the signatures from the interactive UI canvases
    const rSig = riderSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    const wSig = witnessSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png");
    setPdfRiderSig(rSig || null);
    setPdfWitnessSig(wSig || null);

    // Wait a brief moment for React to render those images into the hidden PDF div
    setTimeout(async () => {
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
    }, 500);
  };

  // --- THE UNIFIED DOCUMENT COMPONENT ---
  // isPdf = false renders interactive inputs (white boxes, radio buttons)
  // isPdf = true renders static text/images for the final PDF output
  const HpaDocument = ({ isPdf = false }: { isPdf?: boolean }) => {
    const textStyle = isPdf ? "text-[11px] leading-relaxed text-black font-serif" : "text-[13px] sm:text-sm text-black leading-relaxed font-serif";
    const headingStyle = isPdf ? "font-bold text-[12px] underline mt-6 mb-2 text-black uppercase" : "font-bold text-black text-base mt-8 border-b border-gray-300 pb-2 uppercase";

    return (
      <div className={textStyle}>
        
        {/* PREMIUM LETTERHEAD */}
        <div className={`text-center ${isPdf ? "border-b-2 border-[#001232] pb-4 mb-6" : "border-b-4 border-[#001232] pb-6 mb-8"}`}>
          <h1 className={`${isPdf ? "text-3xl" : "text-4xl"} text-[#001232] font-black tracking-widest mb-1`}>
            YUSDAAM<span className="text-[#FFB902]">.</span>
          </h1>
          <p className={`${isPdf ? "text-[10px]" : "text-xs"} font-bold uppercase tracking-widest text-gray-800`}>YUSDAAM Autos Fleet Management Nigeria Limited</p>
          <p className={`${isPdf ? "text-[9px]" : "text-[10px]"} text-gray-600 mt-1 font-mono tracking-wide`}>RC: 9335611 | 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos | admin@yusdaamautos.com</p>
        </div>

        <h2 className={`text-center font-black uppercase underline ${isPdf ? "text-sm mb-6" : "text-xl mb-8"}`}>RIDER/DRIVER HIRE PURCHASE AGREEMENT</h2>

        <p className="mb-4"><strong>THIS AGREEMENT</strong> is made this <strong>{currentDay}</strong> day of <strong>{currentMonth}</strong>, <strong>{currentYear}</strong>.</p>

        <p className="mb-2 font-bold">BETWEEN</p>
        <p className="mb-6 text-justify"><strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong>, a company duly incorporated under the Companies and Allied Matters Act (CAMA) with RC: 9335611, having its registered office at 84, Addo Road, Oke-Ira Kekere, Ajah, Lagos, Nigeria (hereinafter referred to as the <strong>“Administrator”</strong>, acting as the lawful Attorney for the Asset Owner), of the first part;</p>

        <p className="mb-2 font-bold">AND</p>
        <p className="mb-6 text-justify"><strong>{rider?.firstName} {rider?.lastName}</strong>, NIN: <strong>{rider?.nin}</strong>, residing at <strong>{rider?.streetAddress}</strong>, Email: <strong>{rider?.email || "N/A"}</strong>, Phone: <strong>{rider?.phoneNumber}</strong> (hereinafter referred to as the <strong>“Rider”</strong> or <strong>"Driver"</strong>), of the second part;</p>
        
        <p className="mb-2 font-bold">AND</p>
        <p className="mb-8 text-justify"><strong>THE GUARANTORS</strong>, whose names, addresses, and details are expressly set out in Clause 9 of this Agreement (hereinafter referred to as the <strong>"Guarantors"</strong>), of the third part.</p>

        <h3 className={headingStyle}>RECITALS</h3>
        <p className="mb-2 font-bold">WHEREAS:</p>
        <ol className="list-[upper-alpha] pl-5 mb-8 space-y-3 text-justify">
          <li>The Administrator manages commercial transport vehicles on behalf of legitimate asset owners via a legally executed Power of Attorney.</li>
          <li>The Rider desires to hire, and ultimately purchase, the commercial transport asset described herein under a weekly remittance structure.</li>
          <li>The Guarantors have agreed to stand as full financial and legal sureties for the Rider, guaranteeing the Rider’s performance, payments, and good conduct under this Agreement.</li>
          <li>The Parties have agreed to the terms of hire and conditional purchase as set out below.</li>
        </ol>

        <p className="mb-4 font-bold bg-gray-100 p-2 text-center uppercase border border-gray-300">NOW, THEREFORE, IT IS HEREBY AGREED AS FOLLOWS:</p>

        <h3 className={headingStyle}>1. THE ASSET</h3>
        <p className="mb-2"><strong>1.1</strong> The Administrator hereby agrees to let, and the Rider agrees to hire, the following commercial transport vehicle (the <strong>"Asset"</strong>):</p>
        <ul className={`list-none pl-6 mb-8 space-y-2 ${isPdf ? "font-mono text-[10px] bg-gray-50 p-4 border border-gray-300" : "font-mono bg-gray-50 p-4 border border-gray-300 rounded"}`}>
          <li><strong>Asset Type:</strong> {vehicle?.type || "___________________"}</li>
          <li><strong>Make/Model:</strong> {vehicle?.makeModel || "___________________"}</li>
          <li><strong>Year of Manufacture:</strong> {vehicle?.year || "___________________"}</li>
          <li><strong>Engine Number:</strong> {vehicle?.engineNumber || "___________________"}</li>
          <li><strong>Chassis Number:</strong> {vehicle?.chassisNumber || "___________________"}</li>
          <li><strong>Registration/Plate Number:</strong> {vehicle?.registrationNumber || "___________________"}</li>
        </ul>

        <h3 className={headingStyle}>2. FINANCIAL TERMS AND REMITTANCE</h3>
        <p className="mb-3 text-justify"><strong>2.1 Total Hire Purchase Price:</strong> The total sum payable by the Rider to acquire ownership of the Asset is <strong>₦{contract?.totalPrice?.toLocaleString() || "_____________"}</strong>.</p>
        <p className="mb-3 text-justify"><strong>2.2 Initial Deposit (If Applicable):</strong> The Rider has paid a non-refundable initial commitment deposit of <strong>₦{contract?.initialDeposit?.toLocaleString() || "0"}</strong>.</p>
        <p className="mb-3 text-justify"><strong>2.3 Weekly Remittance:</strong> The Rider shall pay a fixed sum of <strong>₦{contract?.weeklyRemittance?.toLocaleString() || "_____________"}</strong> every week (the "Gross Weekly Remittance") directly into the Administrator’s designated Client Remittance Account in their dashboard.</p>
        <p className="mb-3 text-justify"><strong>2.4 Payment Schedule:</strong> Payments must be made no later than <strong>{contract?.paymentDay || "_____________"}</strong> of every week. Cash payments to unauthorized staff are strictly prohibited and will not be recognized.</p>
        <p className="mb-8 text-justify"><strong>2.5 Tenure:</strong> The expected duration of this hire purchase arrangement is <strong>{contract?.agreedDurationMonths ? contract.agreedDurationMonths * 4 : "_____"}</strong> weeks, concluding when the Total Hire Purchase Price is fully paid.</p>

        <h3 className={headingStyle}>3. RIDER’S OBLIGATIONS AND RISK</h3>
        <p className="mb-3 text-justify"><strong>3.1 Risk and Maintenance:</strong> The Rider assumes <strong>100% financial and operational risk</strong> for the Asset from the moment of handover. The Rider shall be solely responsible for the cost of all mechanical repairs, routine maintenance (e.g., oil changes, tire replacement), and breakdowns.</p>
        <p className="mb-3 text-justify"><strong>3.2 Accident Damage:</strong> In the event of an accident, the Rider and/or their Guarantors shall bear the full cost of repairing the Asset.</p>
        <p className="mb-3 text-justify"><strong>3.3 Uninterrupted Remittance:</strong> Mechanical failure, illness, or traffic delays shall not exempt the Rider from their obligation to pay the Weekly Remittance.</p>
        <p className="mb-3 text-justify"><strong>3.4 Compliance with Laws:</strong> The Rider shall possess a valid driver’s/rider’s license and comply with all state and federal traffic laws. Any fines, impoundment fees, or penalties incurred due to traffic violations shall be paid entirely by the Rider.</p>
        <p className="mb-8 text-justify"><strong>3.5 GPS Tracker:</strong> The Rider acknowledges that a GPS tracking device is installed on the Asset. Tampering with, disconnecting, or damaging the GPS tracker is a fundamental breach of this Agreement and will result in immediate repossession.</p>

        <h3 className={headingStyle}>4. ADMINISTRATOR’S RIGHTS AND REPOSSESSION</h3>
        <p className="mb-3 text-justify"><strong>4.1 Ownership:</strong> The Asset remains the absolute property of the Asset Owner (managed by the Administrator) until the Total Hire Purchase Price is fully paid. The Rider is merely a "Hirer" and cannot sell, pawn, rent, or use the Asset as collateral.</p>
        <p className="mb-3 text-justify"><strong>4.2 Inspection:</strong> The Administrator reserves the right to inspect the Asset at any reasonable time to ensure it is being properly maintained.</p>
        <p className="mb-3 text-justify"><strong>4.3 Default and Repossession:</strong> The Administrator reserves the right to forcefully repossess the Asset without prior court order or legal notice if:</p>
        <ul className="list-disc pl-8 mb-3 space-y-2">
          <li>The Rider defaults on the Weekly Remittance for <strong>7</strong> consecutive days.</li>
          <li>The Rider tampers with the GPS tracker.</li>
          <li>The Rider uses the Asset for any illegal or criminal activity.</li>
          <li>The Asset is found to be abandoned or grossly poorly maintained.</li>
        </ul>
        <p className="mb-8 text-justify"><strong>4.4 Forfeiture:</strong> In the event of repossession due to default, all previous payments made by the Rider shall be treated as standard rental fees for the use of the Asset and shall <strong>not</strong> be refunded.</p>

        <h3 className={headingStyle}>5. TRANSFER OF OWNERSHIP</h3>
        <p className="mb-3 text-justify"><strong>5.1</strong> Upon the complete and timely payment of the Total Hire Purchase Price, the Administrator shall issue a <strong>Letter of Completion</strong> to the Rider.</p>
        <p className="mb-8 text-justify"><strong>5.2</strong> The Administrator shall facilitate the provision of the Change of Ownership Form and the original purchase receipts from the Asset Owner within fourteen (14) days of completion, transferring full legal ownership to the Rider.</p>

        <h3 className={headingStyle}>6. GUARANTORS’ UNDERTAKING AND LIABILITY</h3>
        <p className="mb-3 text-justify"><strong>6.1</strong> The Guarantors unconditionally, jointly, and severally guarantee the strict performance of the Rider under this Agreement.</p>
        <p className="mb-8 text-justify"><strong>6.2</strong> If the Rider absconds, damages the Asset, defaults on the Weekly Remittance, or abandons the Asset, the Administrator shall have the legal right to pursue the Guarantors for the recovery of the Asset, outstanding monetary balances, and any repair costs incurred.</p>

        <h3 className={headingStyle}>7. GENERAL PROVISIONS</h3>
        <p className="mb-3 text-justify"><strong>7.1 Dispute Resolution:</strong> Any dispute arising from this Agreement shall be resolved via mediation. If unresolved, the Administrator may enforce its rights through the appropriate law enforcement agencies or courts in Lagos State.</p>
        <p className="mb-10 text-justify"><strong>7.2 Binding Nature:</strong> This Agreement is legally binding upon signature by all Parties, without the requisite presence of legal counsel.</p>

        {/* --- GUARANTORS SECTION --- */}
        <div style={{ pageBreakBefore: 'always', paddingTop: '20px' }}></div>
        
        <h3 className={headingStyle}>8. GUARANTORS' EXECUTION</h3>
        <div className={`mb-10 p-6 ${isPdf ? "border-2 border-black" : "border-2 border-red-500 bg-red-50"}`}>
          <p className="font-bold mb-4 uppercase text-red-700">Legal Notice & Guarantor Verification</p>
          <p className="text-justify mb-6">
            The Guarantors whose details are listed below have previously executed Sworn Guarantor Attestations digitally. By doing so, they legally undertook the following covenant: <strong>"I hereby undertake to be jointly and severally liable for any default, debt, theft, or damage caused by the Rider during the pendency of this Agreement."</strong> Their IP addresses, identity documents, and digital signatures are permanently verified and held by the Administrator.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <p className="font-bold underline mb-2 uppercase">First Guarantor</p>
              <ul className="list-none pl-0 mb-4 space-y-1">
                <li><strong>Name:</strong> {g1?.firstName || "N/A"} {g1?.lastName || "N/A"}</li>
                <li><strong>NIN:</strong> {g1?.nin || "N/A"}</li>
                <li><strong>Address:</strong> {g1?.address || "N/A"}</li>
                <li><strong>Phone:</strong> {g1?.phone || "N/A"}</li>
              </ul>
              <div className="flex items-end gap-2 mb-2 h-16">
                <strong>Signature:</strong>
                {g1?.signatureUrl ? <img src={g1.signatureUrl} alt="G1 Sig" className="h-12 object-contain mix-blend-multiply" /> : <span className="border-b border-black w-24 inline-block"></span>}
              </div>
              <p><strong>Signed On:</strong> {g1?.signedAt ? new Date(g1.signedAt).toLocaleDateString('en-GB') : "N/A"}</p>
            </div>
            
            <div>
              <p className="font-bold underline mb-2 uppercase">Second Guarantor</p>
              <ul className="list-none pl-0 mb-4 space-y-1">
                <li><strong>Name:</strong> {g2?.firstName || "N/A"} {g2?.lastName || "N/A"}</li>
                <li><strong>NIN:</strong> {g2?.nin || "N/A"}</li>
                <li><strong>Address:</strong> {g2?.address || "N/A"}</li>
                <li><strong>Phone:</strong> {g2?.phone || "N/A"}</li>
              </ul>
              <div className="flex items-end gap-2 mb-2 h-16">
                <strong>Signature:</strong>
                {g2?.signatureUrl ? <img src={g2.signatureUrl} alt="G2 Sig" className="h-12 object-contain mix-blend-multiply" /> : <span className="border-b border-black w-24 inline-block"></span>}
              </div>
              <p><strong>Signed On:</strong> {g2?.signedAt ? new Date(g2.signedAt).toLocaleDateString('en-GB') : "N/A"}</p>
            </div>
          </div>
        </div>

        {/* --- VEHICLE HANDOVER NOTE (INTERACTIVE IN UI, STATIC IN PDF) --- */}
        <h3 className={headingStyle}>9. VEHICLE HANDOVER AND CONDITION NOTE</h3>
        <div className={`mb-10 p-6 ${isPdf ? "" : "bg-gray-50 border border-gray-300 shadow-inner"}`}>
          <p className="mb-6"><strong>Date of Handover:</strong> {formattedDate} &nbsp;&nbsp;&nbsp;&nbsp; <strong>Time of Handover:</strong> {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>

          <p className="font-bold underline mb-2">A. CURRENT STATUS AT HANDOVER</p>
          <p className="mb-4"><strong>Odometer Reading:</strong> _______________ km <span className="text-[10px] italic">(To be filled by Admin if applicable)</span></p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
            <span className="font-bold">Fuel Level:</span>
            {["Empty", "Quarter", "Half", "Full"].map(level => (
              <label key={level} className="flex items-center gap-2 cursor-pointer">
                {isPdf ? (
                  <span className="font-mono">[{handoverData.fuelLevel === level ? "X" : " "}] {level}</span>
                ) : (
                  <><input type="radio" name="fuel" checked={handoverData.fuelLevel === level} onChange={() => handleRadio("fuelLevel", level)} className="w-5 h-5 accent-black" /> {level}</>
                )}
              </label>
            ))}
          </div>

          <p className="font-bold underline mb-2 mt-6">B. EXTERIOR & INTERIOR CONDITION</p>
          <p className="italic text-xs mb-4 text-gray-600">(Select 'OK', 'Damaged', or 'N/A' for assets without those features).</p>
          <div className="space-y-4 mb-6">
            {[
              { label: "Front Bumper & Grille", key: "frontBumper" },
              { label: "Rear Bumper & Trunk", key: "rearBumper" },
              { label: "Left Side (Doors/Panels)", key: "leftSide" },
              { label: "Right Side (Doors/Panels)", key: "rightSide" },
              { label: "Windshield & Mirrors", key: "windshield" },
              { label: "Interior Seats & Dashboard", key: "interior" },
            ].map((item) => (
              <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-2">
                <span className="w-64 font-medium">{item.label}:</span>
                <div className="flex gap-4 mt-2 sm:mt-0">
                  {["OK", "Damaged", "N/A"].map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      {isPdf ? (
                        <span className="font-mono">[{ (handoverData as any)[item.key] === opt ? "X" : " " }] {opt}</span>
                      ) : (
                        <><input type="radio" name={item.key} checked={(handoverData as any)[item.key] === opt} onChange={() => handleRadio(item.key, opt)} className="w-4 h-4 accent-black" /> {opt}</>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center border-b border-gray-200 pb-4">
            <span className="font-bold">Air Conditioning:</span>
            {["Working", "Not Working", "N/A"].map(status => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                {isPdf ? (
                  <span className="font-mono">[{ handoverData.acStatus === status ? "X" : " " }] {status}</span>
                ) : (
                  <><input type="radio" name="ac" checked={handoverData.acStatus === status} onChange={() => handleRadio("acStatus", status)} className="w-4 h-4 accent-black" /> {status}</>
                )}
              </label>
            ))}
          </div>

          <p className="font-bold underline mb-2">C. ACCESSORIES INCLUDED</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {[
              { label: "Vehicle Ignition Keys", key: "keys" },
              { label: "Spare Tire", key: "spareTire" },
              { label: "Car Jack & Spanner", key: "jack" },
              { label: "C-Caution (Warning Triangle)", key: "cCaution" },
              { label: "Fire Extinguisher", key: "extinguisher" },
              { label: "Original Particulars (Copies)", key: "documents" },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                {isPdf ? (
                  <span className="font-mono">[{ (handoverData as any)[item.key] ? "X" : " " }] {item.label}</span>
                ) : (
                  <><input type="checkbox" checked={(handoverData as any)[item.key]} onChange={() => handleCheckbox(item.key)} className="w-5 h-5 accent-black" /> {item.label}</>
                )}
              </label>
            ))}
          </div>

          <div className={`p-4 font-bold text-sm uppercase mb-4 flex items-center gap-2 ${isPdf ? "border border-black" : "bg-white border border-gray-300"}`}>
            <AlertTriangle size={20} className="shrink-0 text-red-600" />
            <span>[✓] GPS Tracker installed, tested, and confirmed active.</span>
          </div>
        </div>

        {/* --- SIGNATURES --- */}
        <h3 className={headingStyle}>10. FINAL DECLARATION & SIGNATURES</h3>
        <p className="text-justify mb-8">I, <strong>{rider.firstName} {rider.lastName}</strong>, hereby confirm that I have physically inspected the vehicle described above. I acknowledge that I am receiving the vehicle and the checked accessories in the exact condition stated in this document. I agree that I am fully responsible for maintaining this condition and replacing any missing tools or accessories as stipulated in this Hire Purchase Agreement.</p>

        {/* Independent Witness */}
        <div className="mb-10">
          <p className="font-bold underline mb-4">IN THE PRESENCE OF INDEPENDENT WITNESS:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <strong>Name:</strong> 
                {isPdf ? (
                  <span className="flex-1 border-b border-black pb-1">{witnessName || "_________________________"}</span>
                ) : (
                  <input type="text" value={witnessName} onChange={(e) => setWitnessName(e.target.value)} className="flex-1 border-b border-gray-400 p-2 text-sm bg-gray-50 outline-none focus:border-black" placeholder="Type Witness Full Name" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <strong>Address:</strong> 
                {isPdf ? (
                  <span className="flex-1 border-b border-black pb-1">{witnessAddress || "_________________________"}</span>
                ) : (
                  <input type="text" value={witnessAddress} onChange={(e) => setWitnessAddress(e.target.value)} className="flex-1 border-b border-gray-400 p-2 text-sm bg-gray-50 outline-none focus:border-black" placeholder="Type Witness Full Address" />
                )}
              </div>
            </div>
            
            <div>
              <p className="font-bold mb-2">Witness Signature:</p>
              <div className={`relative w-full sm:w-[300px] h-24 ${!isPdf ? "border-2 border-dashed border-gray-400 bg-white" : ""}`}>
                {isPdf ? (
                  <>
                    {pdfWitnessSig && <img src={pdfWitnessSig} alt="Witness Sig" className="absolute left-0 bottom-0 h-20 object-contain mix-blend-multiply" />}
                    <div className="absolute bottom-2 w-full border-b border-black"></div>
                  </>
                ) : (
                  <>
                    <SignatureCanvas ref={witnessSigCanvas} penColor="black" canvasProps={{ className: "w-full h-full cursor-crosshair absolute top-0 left-0" }} />
                    <button type="button" onClick={() => witnessSigCanvas.current?.clear()} className="absolute -bottom-6 right-0 text-[10px] font-bold text-red-500 uppercase">Clear Canvas</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Parties Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-12 pt-8 border-t-2 border-gray-400">
          <div>
            <p className="font-bold uppercase mb-4">SIGNED BY ADMINISTRATOR</p>
            <div className="relative h-20 w-48 mb-2">
              <img src="/images/stamp.png" alt="Company Stamp" className="absolute left-0 bottom-0 h-24 object-contain opacity-90 mix-blend-multiply" />
              <div className="absolute bottom-4 w-full border-b border-black"></div>
            </div>
            <p className="text-xs font-bold">Yussuf Dare Orelaja (MD)</p>
            <p className="text-xs mt-1">Date: {formattedDate}</p>
          </div>

          <div>
            <p className="font-bold text-red-600 uppercase mb-4">SIGNED BY DRIVER/RIDER</p>
            <div className={`relative w-full sm:w-[300px] h-24 ${!isPdf ? "border-2 border-dashed border-gray-400 bg-white" : ""}`}>
              {isPdf ? (
                <>
                  {pdfRiderSig && <img src={pdfRiderSig} alt="Rider Sig" className="absolute left-0 bottom-0 h-20 object-contain mix-blend-multiply" />}
                  <div className="absolute bottom-2 w-full border-b border-black"></div>
                </>
              ) : (
                <>
                  <SignatureCanvas ref={riderSigCanvas} penColor="black" canvasProps={{ className: "w-full h-full cursor-crosshair absolute top-0 left-0" }} />
                  <button type="button" onClick={() => riderSigCanvas.current?.clear()} className="absolute -bottom-6 right-0 text-[10px] font-bold text-red-500 uppercase">Clear Canvas</button>
                </>
              )}
            </div>
            <p className="text-xs font-bold mt-4">Name: {rider?.firstName} {rider?.lastName}</p>
            <p className="text-xs mt-1">Date: {formattedDate}</p>
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
    <div ref={topRef} className="fixed inset-0 z-[100] h-[100dvh] w-screen flex items-center justify-center bg-void-navy/95 backdrop-blur-md p-0 sm:p-6 overscroll-none">
      <div className="bg-gray-200 w-full max-w-5xl h-full sm:max-h-[95dvh] rounded-none sm:rounded-xl shadow-2xl flex flex-col border-0 sm:border border-gray-400 overflow-hidden relative">
        
        <div className="bg-void-navy p-4 sm:p-6 border-b border-gray-400 flex items-center gap-4 shrink-0 shadow-md z-10">
          <ShieldCheck size={32} className="text-signal-red shrink-0" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-crisp-white uppercase tracking-wider">Pending Legal Execution</h2>
            <p className="text-[10px] sm:text-xs text-slate-light font-bold uppercase tracking-widest">Read, complete handover note, and sign within the document below.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-none touch-pan-y p-0 sm:p-8">
          {errorMsg && (
            <div className="sticky top-0 z-20 bg-red-100 border-b border-red-500 text-red-700 px-4 py-3 text-sm font-bold flex items-center gap-2 shadow-lg">
              <XCircle size={18} /> {errorMsg}
            </div>
          )}

          {/* THE INTERACTIVE DOCUMENT "PAPER" */}
          <div className="bg-white p-6 sm:p-12 shadow-xl mx-auto w-full max-w-4xl relative z-0 border border-gray-300">
            <HpaDocument isPdf={false} />
            
            <div className="mt-12 pt-8 border-t border-gray-300 bg-gray-50 p-6 rounded border">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" className="mt-1 w-5 h-5 accent-black cursor-pointer" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <span className="text-sm text-gray-800 leading-relaxed font-bold">I, {rider.firstName} {rider.lastName}, acknowledge that checking this box, filling the handover note, and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 border-t border-gray-300 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-10">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center sm:text-left flex-1 font-bold">
            Please ensure all fields and signatures are completed above.
          </p>
          <button 
            onClick={handleSubmitAll}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-4 w-full sm:w-auto bg-red-600 text-white font-bold uppercase tracking-wider rounded shadow-lg hover:bg-red-700 transition disabled:opacity-50 shrink-0"
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> {loadingText}</> : <><CheckSquare size={18} /> Execute Agreement</>}
          </button>
        </div>

        {/* HIDDEN OFF-SCREEN RENDERER FOR PERFECT PDF */}
        <div className="absolute top-[-10000px] left-[-10000px]">
          <div ref={pdfContractRef} className="bg-white w-[800px] p-[40px]">
            <HpaDocument isPdf={true} />
          </div>
        </div>

      </div>
    </div>
  );
}
