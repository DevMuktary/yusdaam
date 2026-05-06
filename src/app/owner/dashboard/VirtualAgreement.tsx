"use client";

import { useState, useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";
import { Loader2, PenTool, CheckSquare, Download, ArrowRight, CheckCircle2, MailCheck } from "lucide-react";

export interface AgreementProps {
  ownerName: string;
  bvn?: string;
  nin?: string;
  ownerAddress?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerId?: string;
  vehicleType?: string;
  makeModel?: string;
  year?: string;
  engineNo?: string;
  chassisNo?: string;
  plateNo?: string;
  startDate?: string;
  endDate?: string;
  targetWeeklyRemittance?: string;
  ownerBank?: string;
  ownerAcctNo?: string;
  grossRemittance?: string;
  adminCharge?: string;
  policyNo?: string;
}

export default function VirtualAgreement(props: AgreementProps) {
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

  const hpaOwnerSigCanvas = useRef<SignatureCanvas>(null);
  const hpaWitnessSigCanvas = useRef<SignatureCanvas>(null);
  const [hpaAgreed, setHpaAgreed] = useState(false);
  const [witnessName, setWitnessName] = useState("");
  const [witnessAddress, setWitnessAddress] = useState("");
  const [hpaOwnerSig, setHpaOwnerSig] = useState<string | null>(null);
  const [hpaWitnessSig, setHpaWitnessSig] = useState<string | null>(null);

  const poaOwnerSigCanvas = useRef<SignatureCanvas>(null);
  const [poaAgreed, setPoaAgreed] = useState(false);
  const [poaOwnerSig, setPoaOwnerSig] = useState<string | null>(null);

  const hpaContractRef = useRef<HTMLDivElement>(null);
  const poaContractRef = useRef<HTMLDivElement>(null);
  const [isDownloadingHpa, setIsDownloadingHpa] = useState(false);
  const [isDownloadingPoa, setIsDownloadingPoa] = useState(false);
  
  // Step 3 Background Dispatch State
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchComplete, setDispatchComplete] = useState(false);

  // Dynamic Date Helpers
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();
  const formattedDate = today.toLocaleDateString();

  const fallback = "[Pending Admin Input]";

  const handleNextToPoa = () => {
    setErrorMsg("");
    if (!witnessName || !witnessAddress) return setErrorMsg("Please provide your witness's name and address.");
    if (hpaOwnerSigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your owner signature.");
    if (hpaWitnessSigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your witness signature.");
    if (!hpaAgreed) return setErrorMsg("You must check the agreement box to proceed.");

    setStep(2);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleSubmitAll = async () => {
    setErrorMsg("");
    if (poaOwnerSigCanvas.current?.isEmpty()) return setErrorMsg("Please provide your signature for the Power of Attorney.");
    if (!poaAgreed) return setErrorMsg("You must check the agreement box to proceed.");

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/owner/agreement/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: hpaOwnerSig }), 
      });

      if (!res.ok) throw new Error("Failed to process agreements.");
      
      setStep(3);
      setIsDispatching(true);
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // BACKGROUND TASK: Compile PDFs and Email them
  useEffect(() => {
    if (step === 3 && isDispatching && !dispatchComplete) {
      const compileAndSend = async () => {
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

          const hpaDataUri = await html2pdf().set({ ...opt, filename: 'HPA.pdf' }).from(hpaContractRef.current).output('datauristring');
          const poaDataUri = await html2pdf().set({ ...opt, filename: 'POA.pdf' }).from(poaContractRef.current).output('datauristring');

          const hpaBase64 = hpaDataUri.split(',')[1];
          const poaBase64 = poaDataUri.split(',')[1];

          await fetch("/api/owner/agreement/dispatch-docs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hpaBase64, poaBase64 })
          });

        } catch (error) {
          console.error("Background dispatch failed", error);
        } finally {
          setIsDispatching(false);
          setDispatchComplete(true);
        }
      };
      compileAndSend();
    }
  }, [step, isDispatching, dispatchComplete]);

  // Safari-safe Blob Download
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

  const HpaDocument = ({ isPdf = false }: { isPdf?: boolean }) => {
    const textStyle = isPdf ? "text-[11px] leading-relaxed text-black font-serif" : "text-sm text-slate-light leading-relaxed font-sans";
    const headingStyle = isPdf ? "font-bold text-[12px] underline mt-6 mb-2 text-black uppercase" : "font-bold text-crisp-white text-base mt-8 border-b border-cobalt/20 pb-2 uppercase";

    return (
      <div className={textStyle}>
        <div className={`text-center ${isPdf ? "border-b-2 border-[#001232] pb-4 mb-6" : "border-b border-cobalt/30 pb-6 mb-8"}`}>
          <h1 className={`${isPdf ? "text-3xl text-[#001232]" : "text-3xl text-crisp-white"} font-black tracking-widest mb-1`}>
            YUSDAAM<span className="text-[#FFB902]">.</span>
          </h1>
          <p className={`${isPdf ? "text-[10px]" : "text-xs"} font-bold uppercase tracking-widest`}>YUSDAAM Autos Fleet Management Nigeria Limited</p>
          <p className={`${isPdf ? "text-[9px]" : "text-[10px] text-slate-light"} mt-1`}>RC: 9335611 | 18, Alhaji Olakunle Close Selewu Teacher's Quater Igbogbo Ikorodu Lagos. | admin@yusdaamautos.com</p>
        </div>

        <h2 className={`text-center font-black uppercase ${isPdf ? "text-sm mb-6" : "text-lg text-signal-red mb-8"}`}>HIRE PURCHASE ADMINISTRATION AGREEMENT</h2>

        <p className="mb-4"><strong>THIS AGREEMENT</strong> is made this <strong>{currentDay}</strong> day of <strong>{currentMonth}</strong>, <strong>{currentYear}</strong>.</p>

        <p className="mb-2 font-bold">BETWEEN</p>
        <p className="mb-6"><strong>YUSDAAM AUTOS FLEET MANAGEMENT NIGERIA LIMITED</strong>, a company duly incorporated under the Companies and Allied Matters Act (CAMA) with RC: 9335611, having its registered office at 18, Alhaji Olakunle Close Selewu Teacher's Quater Igbogbo Ikorodu Lagos., Nigeria, Email: admin@yusdaamautos.com (hereinafter referred to as the <strong>“Administrator”</strong>, which expression shall, where the context so admits, include its successors-in-title and assigns) of the first part;</p>

        <p className="mb-2 font-bold">AND</p>
        <p className="mb-6"><strong>{props.ownerName || fallback}</strong>, BVN: {props.bvn || fallback}, NIN: {props.nin || fallback}, residing at {props.ownerAddress || fallback}, Email: {props.ownerEmail || fallback}, Phone: {props.ownerPhone || fallback} (hereinafter referred to as the <strong>“Owner”</strong>, which expression shall, where the context so admits, include their heirs, personal representatives, and assigns) of the second part.</p>
        <p className="mb-8">The Administrator and the Owner are hereinafter collectively referred to as the <strong>"Parties"</strong> and individually as a <strong>"Party"</strong>.</p>

        <h3 className={headingStyle}>RECITALS</h3>
        <p className="mb-2 font-bold">WHEREAS:</p>
        <ul className="list-[upper-alpha] pl-5 mb-8 space-y-2">
          <li>The Owner is the absolute legal owner, or intends to become the legal purchaser, of a commercial transport asset (including but not limited to a tricycle, mini-bus, car, truck, tipper, or bus) and desires to engage professional administrative services to manage the asset under a hire purchase arrangement.</li>
          <li>The Administrator specializes in the management of hire purchase vehicles on behalf of asset owners via a Power of Attorney, providing services that include rider/driver vetting, remittance collection, GPS monitoring, compliance enforcement, and asset repossession.</li>
          <li>The Parties have agreed that the Administrator shall provide these services to the Owner at zero direct cost (₦0), deriving its revenue exclusively from administrative charges levied directly upon the designated rider/driver.</li>
          <li>The Parties now wish to enter into this Agreement to formalize the terms, conditions, and obligations governing this arrangement.</li>
        </ul>

        <p className="mb-4 font-bold">NOW, THEREFORE, IT IS HEREBY AGREED AS FOLLOWS:</p>

        <h3 className={headingStyle}>1. DEFINITIONS AND INTERPRETATION</h3>
        <p className="mb-2">1.1 In this Agreement, unless the context otherwise requires:</p>
        <ul className="list-disc pl-5 mb-6 space-y-2">
          <li><strong>"Asset"</strong> means the commercial transport vehicle described in Clause 2.1 of this Agreement.</li>
          <li><strong>"Gross Weekly Remittance"</strong> means the total monetary sum collected from the Rider weekly.</li>
          <li><strong>"Net Weekly Remittance"</strong> means the balance of the Gross Weekly Remittance after the deduction of the Administrator’s weekly charge.</li>
          <li><strong>"Rider"</strong> or <strong>"Driver"</strong> means the third-party individual selected and managed by the Administrator to operate the Asset under a separate hire purchase agreement.</li>
          <li><strong>"Tenure"</strong> means the agreed duration of the hire purchase arrangement necessary for the Rider to pay the Total Hire Purchase Price.</li>
        </ul>

        <h3 className={headingStyle}>2. APPOINTMENT AND ASSET DESCRIPTION</h3>
        <p className="mb-2">2.1 The Owner hereby appoints the Administrator, and the Administrator accepts such appointment, to manage, operate, monitor, and enforce the hire purchase terms for one (1) unit of a commercial transport asset (the "Asset") detailed as follows:</p>
        <ul className={`list-disc pl-5 mb-4 space-y-1 ${isPdf ? "font-mono text-[10px]" : "font-mono bg-void-navy/50 p-4 rounded-lg"}`}>
          <li><strong>Owner ID:</strong> {props.ownerId || fallback}</li>
          <li><strong>Asset Type:</strong> {props.vehicleType || fallback}</li>
          <li><strong>Make/Model:</strong> {props.makeModel || fallback}</li>
          <li><strong>Year of Manufacture:</strong> {props.year || fallback}</li>
          <li><strong>Engine Number:</strong> {props.engineNo || fallback}</li>
          <li><strong>Chassis Number:</strong> {props.chassisNo || fallback}</li>
          <li><strong>Registration/Plate Number:</strong> {props.plateNo || fallback}</li>
        </ul>
        <p className="mb-2">2.2 The Owner shall execute a Power of Attorney (attached hereto as <strong>Schedule D</strong>) granting the Administrator the legal authority to act on their behalf regarding the daily management, enforcement, and repossession of the Asset.</p>
        <p className="mb-6">2.3 Legal and beneficial ownership of the Asset shall remain wholly vested in the Owner until successfully transferred to the Rider upon the completion of the Tenure, as outlined in Clause 9. The Administrator claims no ownership interest in the Asset.</p>

        <h3 className={headingStyle}>3. VEHICLE PURCHASE AND PAYMENT FACILITATION</h3>
        <p className="mb-2">3.1 The Owner shall make all payments for the acquisition of the Asset directly to the vehicle dealer or supplier. Under no circumstances shall the Administrator receive, hold, or disburse the Owner’s capital funds for the purchase of the Asset.</p>
        <p className="mb-2">3.2 The Administrator's role is strictly limited to facilitation. The Administrator shall provide the Owner with a Purchase Facilitation Quote and a supplier invoice for approval.</p>
        <p className="mb-6">3.3 Proof of the Owner’s direct payment to the dealer shall be annexed to this Agreement as <strong>Schedule A</strong>.</p>

        <h3 className={headingStyle}>4. TENURE AND FINANCIAL PROVISIONS</h3>
        <p className="mb-2">4.1 <strong>Tenure:</strong> This Agreement shall remain valid for an estimated period of {fallback} weeks, commencing on {props.startDate || fallback} and terminating on {props.endDate || fallback}, subject to earlier termination as provided in Clause 10.</p>
        <p className="mb-2">4.2 <strong>Target Remittance:</strong> The Owner’s Target Weekly Remittance is defined as <strong>₦{props.targetWeeklyRemittance || fallback}</strong>. The Parties acknowledge that this figure is a target based on current market data for the Asset type and is expressly not guaranteed by the Administrator.</p>
        <p className="mb-6">4.3 <strong>Payment Collection:</strong> All payments made by the Rider shall be deposited directly into the Administrator’s designated Client Remittance Account. The Administrator shall transfer the Net Weekly Remittance to the Owner’s nominated bank account (<strong>Bank:</strong> {props.ownerBank || fallback}, <strong>Account No:</strong> {props.ownerAcctNo || fallback}) within forty-eight (48) hours of cleared receipt.</p>

        <h3 className={headingStyle}>5. ADMINISTRATOR’S OBLIGATIONS AND REMUNERATION</h3>
        <p className="mb-2">5.1 The Administrator shall provide the following services at no cost to the Owner: vetting and recruiting Riders, executing hire purchase contracts with Riders, installing GPS tracking devices, monitoring the Asset, collecting remittances, enforcing payment compliance, executing repossessions in the event of a default, and providing Monthly Operation Reports.</p>
        <p className="mb-2">5.2 The Administrator shall automatically forward Weekly Remittance Advice and GPS location logs to the Owner’s designated email address.</p>
        <p className="mb-6">5.3 The Administrator shall not charge the Owner any administration fees. The Administrator’s sole income for its services is derived from the administrative charges paid by the Rider.</p>

        <h3 className={headingStyle}>6. REMITTANCE STRUCTURE AND DEDUCTIONS</h3>
        <p className="mb-2">6.1 <strong>Gross Collection:</strong> The current target Gross Weekly Remittance expected from the Rider is <strong>₦{props.grossRemittance || fallback}</strong>.</p>
        <p className="mb-2">6.2 <strong>Administrator’s Fee:</strong> The Administrator shall deduct <strong>₦{props.adminCharge || fallback}</strong> weekly from the Gross Weekly Remittance as a Rider Administration Fee. This fee covers GPS monitoring, enforcement, reporting, insurance facilitation, and repossession efforts. This fee is the exclusive property of the Administrator.</p>
        <p className="mb-2">6.3 <strong>Net Remittance:</strong> The Net Weekly Remittance transferred to the Owner shall be the Gross Weekly Remittance less the Administrator's Fee.</p>
        <p className="mb-6">6.4 <strong>Shortfall Non-Liability:</strong> If the Rider defaults on payment due to accidents, illness, or other unforeseen circumstances, resulting in a reduced or zero Gross Weekly Remittance, the Administrator does not guarantee the Owner’s Net Weekly Remittance. The Administrator shall not be held financially liable for such shortfalls but remains obligated to enforce recovery or repossession using the Power of Attorney.</p>

        <h3 className={headingStyle}>7. RISK ALLOCATION, INSURANCE, AND LIABILITY</h3>
        <p className="mb-2">7.1 <strong>Owner's Risk:</strong> The Owner bears the absolute risk of total loss of the Asset arising from events including, but not limited to, natural disasters, government confiscation, theft, and acts of war.</p>
        <p className="mb-2">7.2 <strong>Rider's Risk:</strong> The Rider bears one hundred percent (100%) of the risk and financial cost associated with mechanical failures, accident damage, routine maintenance, and breakdowns occurring during the Tenure. The Administrator makes no warranties regarding the Rider’s performance or the Asset's mechanical longevity.</p>
        <p className="mb-2">7.3 <strong>Insurance:</strong> The Asset must carry, at a minimum, Third-Party Insurance as required by the National Insurance Commission (NAICOM), bearing Policy No: {props.policyNo || fallback}. The Owner shall pay the insurer directly. Comprehensive insurance is highly recommended and shall be at the Owner’s sole discretion and expense. A copy of the insurance policy shall be annexed as <strong>Schedule B</strong>.</p>
        <p className="mb-6">7.4 <strong>Enforcement Liability:</strong> While the Administrator is strictly obligated to execute repossessions if the Rider defaults on payments or repairs, the Administrator shall bear no financial liability for the loss of the Asset, lost anticipated income, or any repair costs.</p>

        <h3 className={headingStyle}>8. OWNER’S OBLIGATIONS</h3>
        <p className="mb-2">8.1 The Owner covenants not to interfere with the Administrator’s day-to-day management, Rider selection, route optimization, or enforcement actions carried out under the Power of Attorney.</p>
        <p className="mb-2">8.2 The Owner shall notify the Administrator in writing within forty-eight (48) hours of any changes to their bank details, residential address, or next of kin.</p>
        <p className="mb-6">8.3 The Owner warrants and represents that all funds utilized for the acquisition of the Asset originate from legitimate sources and do not constitute the proceeds of unlawful activity.</p>

        <h3 className={headingStyle}>9. TRANSFER OF OWNERSHIP</h3>
        <p className="mb-2">9.1 Upon the Rider's successful completion of the Tenure and the full remittance of the Total Hire Purchase Price, the Administrator shall promptly issue a Letter of Completion to both the Owner and the Rider.</p>
        <p className="mb-2">9.2 Upon receipt of the Letter of Completion, the Owner shall, within fourteen (14) days, execute a Change of Ownership Form and surrender the original purchase receipt to the Rider.</p>
        <p className="mb-6">9.3 The Administrator shall facilitate this transfer but shall not be held legally liable if the Owner fails or delays in executing the required transfer documentation. The Power of Attorney shall automatically expire upon the successful transfer of ownership.</p>

        <h3 className={headingStyle}>10. TERMINATION AND REPOSSESSION</h3>
        <p className="mb-2">10.1 <strong>Lock-in Period:</strong> The Owner shall not terminate this Agreement within the first twenty-six (26) weeks of the Tenure, except in the event of a proven material breach of contract by the Administrator.</p>
        <p className="mb-2">10.2 <strong>Standard Termination:</strong> Subsequent to Week 26, the Owner may terminate this Agreement by providing thirty (30) days’ written notice. Upon such termination, the Administrator shall hand over all Rider agreements, GPS access credentials, and repossession rights to the Owner.</p>
        <p className="mb-2">10.3 <strong>Termination for Administrator Default:</strong> If the Administrator fails to enforce or remit collected payments for four (4) consecutive weeks (excluding Force Majeure events), the Owner may revoke the Power of Attorney with seven (7) days’ written notice and assume direct management of the Asset.</p>
        <p className="mb-6">10.4 <strong>Rider Default:</strong> In the event the Rider permanently defaults or fails to complete the Tenure, full control of the Asset shall revert to the Owner. The Administrator shall deliver the Asset, keys, relevant documents, and a formal repossession report to the Owner within seven (7) days of the Rider's termination.</p>

        <h3 className={headingStyle}>11. FORCE MAJEURE</h3>
        <p className="mb-2">11.1 Neither Party shall be deemed in breach of this Agreement or otherwise liable for any delay or failure in performance arising from circumstances beyond their reasonable control (a "Force Majeure Event"). Such events include, but are not limited to, acts of God, war, nationwide strikes, government bans on specific vehicle types, pandemic lockdowns, or natural disasters.</p>
        <p className="mb-6">11.2 Administrative duties and remittance obligations shall be suspended during a Force Majeure Event and shall resume immediately upon its resolution. The Tenure of the Agreement shall be extended by a period equal to the duration of the suspension.</p>

        <h3 className={headingStyle}>12. COMPLIANCE, ANTI-MONEY LAUNDERING, AND DATA PRIVACY</h3>
        <p className="mb-2">12.1 <strong>Confidentiality:</strong> The Parties agree to maintain strict confidentiality regarding the terms of this Agreement, disclosing information only as strictly required for tax, regulatory, or judicial purposes.</p>
        <p className="mb-2">12.2 <strong>Statutory Compliance:</strong> The Administrator shall comply with the Money Laundering (Prevention and Prohibition) Act 2022 and the Nigeria Data Protection Act (NDPA) 2023. The Owner’s KYC documents are annexed as <strong>Schedule C</strong>. Sensitive data (including BVN and NIN) shall be stored in an encrypted drive accessible only by authorized compliance personnel.</p>
        <p className="mb-6">12.3 <strong>Reporting:</strong> The Administrator reserves the right to report any suspicious financial transactions to the Nigerian Financial Intelligence Unit (NFIU) in accordance with statutory obligations.</p>

        <h3 className={headingStyle}>13. DISPUTE RESOLUTION AND GOVERNING LAW</h3>
        <p className="mb-2">13.1 This Agreement shall be governed by and construed in accordance with the Laws of the Federal Republic of Nigeria.</p>
        <p className="mb-2">13.2 Any dispute, controversy, or claim arising out of or relating to this Agreement shall first be referred to mediation at the Lagos Multi-Door Courthouse.</p>
        <p className="mb-2">13.3 Should mediation fail to yield a settlement within thirty (30) days, the dispute shall be resolved by binding arbitration in Lagos, Nigeria, conducted by a single arbitrator in accordance with the Arbitration and Mediation Act 2023.</p>
        <p className="mb-6">13.4 The Courts of Lagos State shall retain exclusive jurisdiction for the enforcement of any arbitral award or equitable relief.</p>

        <h3 className={headingStyle}>14. GENERAL PROVISIONS</h3>
        <p className="mb-2">14.1 <strong>Entire Agreement:</strong> This Agreement, alongside Schedules A, B, C, and D, constitutes the entire understanding between the Parties and supersedes all prior agreements or representations. Any amendments must be made in writing and duly signed by both Parties.</p>
        <p className="mb-2">14.2 <strong>Severability:</strong> If any provision of this Agreement is found to be void or unenforceable by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect.</p>
        <p className="mb-2">14.3 <strong>Notices:</strong> Official notices shall be sent to the email addresses provided herein and shall be legally deemed received twenty-four (24) hours after successful transmission.</p>
        <p className="mb-6">14.4 <strong>Stamp Duty:</strong> Any applicable stamp duties associated with this Agreement shall be borne by the Administrator.</p>

        <p className="mb-10 font-bold italic uppercase">IN WITNESS WHEREOF, the Parties hereto have executed this Agreement on the day and year first above written.</p>

        {/* SIGNATURE BLOCKS */}
        <div className={`grid grid-cols-2 gap-10 mt-12 ${isPdf ? "pt-8 border-t border-gray-300" : ""}`}>
          <div>
            <p className="font-bold mb-6">SIGNED by the within-named ADMINISTRATOR</p>
            <p className="font-bold text-xs uppercase">YUSDAAM AUTOS FLEET MANAGEMENT NIGERIA LIMITED</p>
            
            <div className="relative h-20 w-48 mt-4 mb-2">
               <img src="/images/stamp.png" alt="Company Seal" className="absolute left-0 -top-4 h-24 opacity-80 object-contain" />
               <div className={`absolute bottom-0 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
            </div>
            
            <p className="font-bold text-xs">Name: Yussuf Dare Orelaja</p>
            <p className={isPdf ? "text-xs" : "text-xs text-slate-light"}>Designation: Managing Director</p>
            <p className={`mt-2 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>Date: {formattedDate}</p>
            <p className="italic text-[10px] text-gray-500 mt-1">(COMPANY SEAL)</p>
            
            <p className="mt-8 font-bold underline text-xs">In the presence of WITNESS 1 (For the Administrator):</p>
            <p className={isPdf ? "text-xs mt-2" : "text-xs text-slate-light mt-2"}>Name: ASHIA ADEKUNBI OLABINTAN</p>
            <p className={isPdf ? "text-[10px] mt-2 leading-tight" : "text-xs text-slate-light mt-2 leading-tight"}>Address: 18, Alhaji Olakunle Close Selewu Teacher's Quater Igbogbo Ikorodu Lagos.</p>
            
            <div className="relative h-12 mt-2 w-48">
               <span className={isPdf ? "text-xs absolute bottom-0 left-0" : "text-xs text-slate-light absolute bottom-0 left-0"}>Signature:</span>
               <img src="/images/aisha_signature.png" alt="Witness Signature" className="absolute left-16 bottom-0 h-12 object-contain" />
               <div className={`absolute bottom-0 left-14 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
            </div>
            <p className={isPdf ? "text-xs mt-2" : "text-xs text-slate-light mt-2"}>Date: {formattedDate}</p>
          </div>

          <div>
            <p className="font-bold mb-6">SIGNED by the within-named OWNER</p>
            <div className="relative h-20 w-48 mt-4 mb-2">
              {hpaOwnerSig ? (
                <img src={hpaOwnerSig} alt="Owner Signature" className="absolute left-0 bottom-0 h-20 object-contain" />
              ) : (
                <div className={`absolute bottom-0 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
              )}
            </div>
            <p className="font-bold text-xs uppercase">Name: {props.ownerName}</p>
            <p className={`mt-2 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>Date: {formattedDate}</p>
            <p className={`mt-2 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>THUMBPRINT: [Digitally Captured]</p>

            <p className="mt-8 font-bold underline text-xs">In the presence of WITNESS 2 (For the Owner):</p>
            <p className={isPdf ? "text-xs mt-2" : "text-xs text-slate-light mt-2"}>Name: {witnessName || fallback}</p>
            <p className={isPdf ? "text-[10px] mt-2 leading-tight" : "text-xs text-slate-light mt-2 leading-tight"}>Address: {witnessAddress || fallback}</p>
            
            <div className="relative h-12 mt-2 w-48">
               <span className={isPdf ? "text-xs absolute bottom-0 left-0" : "text-xs text-slate-light absolute bottom-0 left-0"}>Signature:</span>
               {hpaWitnessSig ? (
                 <img src={hpaWitnessSig} alt="Witness Signature" className="absolute left-16 bottom-0 h-12 object-contain" />
               ) : (
                 <div className={`absolute bottom-0 left-14 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
               )}
            </div>
            <p className={isPdf ? "text-xs mt-2" : "text-xs text-slate-light mt-2"}>Date: {formattedDate}</p>
          </div>
        </div>

        <div className={`mt-16 pt-8 ${isPdf ? "text-[10px]" : "text-xs text-slate-light"}`}>
          <p><strong>SCHEDULE A:</strong> Dealer Invoice + Proof of Payment by Owner</p>
          <p><strong>SCHEDULE B:</strong> Insurance Certificate</p>
          <p><strong>SCHEDULE C:</strong> Owner KYC Documents</p>
          <p><strong>SCHEDULE D:</strong> Power of Attorney</p>
        </div>
      </div>
    );
  };

  const PoaDocument = ({ isPdf = false }: { isPdf?: boolean }) => {
    const textStyle = isPdf ? "text-[11px] leading-relaxed text-black font-serif" : "text-sm text-slate-light leading-relaxed font-sans";
    const headingStyle = isPdf ? "font-bold text-[12px] underline mt-6 mb-2 text-black uppercase" : "font-bold text-crisp-white text-base mt-8 border-b border-cobalt/20 pb-2 uppercase";

    return (
      <div className={textStyle}>
        <div className={`text-center ${isPdf ? "border-b-2 border-[#001232] pb-4 mb-6" : "border-b border-cobalt/30 pb-6 mb-8"}`}>
          <h1 className={`${isPdf ? "text-3xl text-[#001232]" : "text-3xl text-crisp-white"} font-black tracking-widest mb-1`}>
            YUSDAAM<span className="text-[#FFB902]">.</span>
          </h1>
          <p className={`${isPdf ? "text-[10px]" : "text-xs"} font-bold uppercase tracking-widest`}>YUSDAAM Autos Fleet Management Nigeria Limited</p>
          <p className={`${isPdf ? "text-[9px]" : "text-[10px] text-slate-light"} mt-1`}>RC: 9335611 | 18, Alhaji Olakunle Close Selewu Teacher's Quater Igbogbo Ikorodu Lagos. | admin@yusdaamautos.com</p>
        </div>

        <h2 className={`text-center font-black uppercase ${isPdf ? "text-sm mb-8" : "text-lg text-signal-red mb-8"}`}>SPECIFIC POWER OF ATTORNEY</h2>

        <p className="mb-6 leading-relaxed">
          <strong>KNOW ALL MEN BY THESE PRESENTS</strong> that I, <strong>{props.ownerName}</strong>, of {props.ownerAddress || fallback}, holding Bank Verification Number (BVN) {props.bvn || fallback} and National Identification Number (NIN) {props.nin || fallback} (hereinafter referred to as the <strong>"Donor"</strong>), DO HEREBY APPOINT <strong>YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</strong>, a company incorporated under the laws of the Federal Republic of Nigeria with RC: 9335611, having its registered address at 18, Alhaji Olakunle Close Selewu Teacher's Quater Igbogbo Ikorodu Lagos. (hereinafter referred to as the <strong>"Donee"</strong>), to be my true and lawful Attorney, to act in my name and on my behalf to do all or any of the following acts and things in respect of my commercial transport asset (hereinafter referred to as the <strong>"Asset"</strong>):
        </p>

        <h3 className={headingStyle}>ASSET DESCRIPTION:</h3>
        <ul className={`list-disc pl-5 mb-6 space-y-1 ${isPdf ? "font-mono text-[10px]" : "font-mono bg-void-navy/50 p-4 rounded-lg"}`}>
          <li><strong>Asset Type:</strong> {props.vehicleType || fallback}</li>
          <li><strong>Make/Model:</strong> {props.makeModel || fallback}</li>
          <li><strong>Year of Manufacture:</strong> {props.year || fallback}</li>
          <li><strong>Engine Number:</strong> {props.engineNo || fallback}</li>
          <li><strong>Chassis Number:</strong> {props.chassisNo || fallback}</li>
          <li><strong>Registration/Plate Number:</strong> {props.plateNo || fallback}</li>
        </ul>

        <h3 className={headingStyle}>DELEGATED POWERS</h3>
        <p className="mb-4">I hereby grant my said Attorney the absolute power and legal authority to execute the following actions regarding the Asset:</p>
        
        <ul className="space-y-4 mb-6 list-none pl-0">
          <li><strong>1. General Management:</strong> To manage, control, and oversee the daily commercial operations of the Asset under a hire purchase arrangement.</li>
          <li><strong>2. Execution of Contracts:</strong> To vet riders/drivers and to negotiate, execute, sign, and deliver hire purchase agreements, terms of use, and any other relevant operational documents with third-party riders/drivers on my behalf.</li>
          <li><strong>3. Financial Collection:</strong> To demand, collect, receive, and issue receipts for all weekly remittances, fees, or charges payable by the rider/driver in connection with the use and hire purchase of the Asset.</li>
          <li><strong>4. Asset Monitoring & GPS:</strong> To install, maintain, and monitor Global Positioning System (GPS) tracking devices on the Asset, and to use the data derived to ensure compliance.</li>
          <li><strong>5. Enforcement & Repossession:</strong> To take all lawful and necessary steps to enforce the terms of the hire purchase agreement against the rider/driver. In the event of default, abandonment, or breach of contract by the rider/driver, to seize, recover, and repossess the Asset without further recourse to me.</li>
          <li><strong>6. Liaison with Authorities:</strong> To represent me and the Asset before any governmental agency, law enforcement agency (including the Nigerian Police Force), road traffic management authority, or insurance provider in matters concerning the recovery of the Asset, reporting of theft, or resolution of traffic and operational infractions.</li>
          <li><strong>7. Custody of Documents:</strong> To hold necessary operational copies of the vehicle's particulars and insurance documents for the purpose of carrying out the administrative duties described herein.</li>
        </ul>

        <h3 className={headingStyle}>LIMITATIONS</h3>
        <ul className="space-y-4 mb-6 list-none pl-0">
          <li><strong>1. No Transfer of Ownership:</strong> This Power of Attorney <strong>DOES NOT</strong> grant the Donee the right or authority to sell, mortgage, pledge, or permanently transfer the legal ownership of the Asset to any third party, except as explicitly directed by me upon the rider's successful completion of the hire purchase tenure as stipulated in our Administration Agreement.</li>
          <li><strong>2. Scope:</strong> The powers granted herein are strictly limited to the management and administration of the specific Asset described above.</li>
        </ul>

        <h3 className={headingStyle}>DURATION AND REVOCABILITY</h3>
        <p className="mb-6">This Power of Attorney is issued pursuant to the Hire Purchase Administration Agreement executed between the Donor and the Donee on {formattedDate}. It shall remain valid and operational for the duration of the agreed Tenure. It is irrevocable during the first twenty-six (26) weeks of the Tenure except in the event of a material breach by the Donee, after which it may be revoked subject to the termination clauses of the primary Administration Agreement.</p>

        <h3 className={headingStyle}>RATIFICATION</h3>
        <p className="mb-8">I HEREBY AGREE to ratify and confirm all lawful actions that my said Attorney shall do, or cause to be done, by virtue of this Power of Attorney, provided such actions are within the scope of the powers granted herein and align with the governing Hire Purchase Administration Agreement.</p>

        <p className="mb-10 font-bold italic uppercase">IN WITNESS WHEREOF, I have hereunto set my hand and seal this {currentDay} day of {currentMonth}, {currentYear}.</p>

        <div className={`grid grid-cols-2 gap-10 mt-12 ${isPdf ? "pt-8 border-t border-gray-300" : ""}`}>
          {/* Donor Side */}
          <div className="space-y-4">
            <p className="font-bold underline text-xs">SIGNED, SEALED, AND DELIVERED by the within-named DONOR:</p>
            
            <div className="relative h-20 w-48 mt-4 mb-2">
              {poaOwnerSig ? (
                <img src={poaOwnerSig} alt="Donor Signature" className="absolute left-0 bottom-0 h-20 object-contain" />
              ) : (
                <div className={`absolute bottom-0 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
              )}
            </div>
            
            <p className="font-bold text-xs uppercase">Name: {props.ownerName}</p>
            <p className={`mt-2 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>Date: {formattedDate}</p>
            <p className={`mt-2 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>THUMBPRINT: [Digitally Captured]</p>

            <p className="mt-8 font-bold underline text-xs">In the presence of WITNESS (For the Donor):</p>
            <p className={isPdf ? "text-xs mt-2" : "text-xs text-slate-light mt-2"}>Name: {witnessName || fallback}</p>
            <p className={isPdf ? "text-[10px] mt-2 leading-tight" : "text-xs text-slate-light mt-2 leading-tight"}>Address: {witnessAddress || fallback}</p>
            
            <div className="relative h-12 mt-2 w-48">
               <span className={isPdf ? "text-xs absolute bottom-0 left-0" : "text-xs text-slate-light absolute bottom-0 left-0"}>Signature:</span>
               {hpaWitnessSig ? (
                 <img src={hpaWitnessSig} alt="Witness Signature" className="absolute left-16 bottom-0 h-12 object-contain" />
               ) : (
                 <div className={`absolute bottom-0 left-14 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
               )}
            </div>
            <p className={`mt-2 ${isPdf ? "text-xs" : "text-xs text-slate-light"}`}>Date: {formattedDate}</p>
          </div>

          {/* Donee Side */}
          <div className="space-y-4">
            <p className="font-bold underline text-xs">ACCEPTED BY THE DONEE:</p>
            <p className="font-bold text-xs uppercase">YUSDAAM AUTOS FLEET ADMINISTRATORS NIGERIA LIMITED</p>
            
            <div className="relative h-20 w-48 mt-4 mb-2">
               <img src="/images/stamp.png" alt="Company Seal" className="absolute left-0 -top-4 h-24 opacity-80 object-contain" />
               <div className={`absolute bottom-0 w-full border-b ${isPdf ? "border-black" : "border-slate-light"}`}></div>
            </div>
            
            <p className="font-bold text-xs">Name: Yussuf Dare Orelaja</p>
            <p className={isPdf ? "text-xs" : "text-xs text-slate-light"}>Designation: Managing Director</p>
            <p className={isPdf ? "text-xs" : "text-xs text-slate-light"}>Date: {formattedDate}</p>
          </div>
        </div>
      </div>
    );
  };

  // --- SUCCESS VIEW (STEP 3) ---
  if (step === 3) {
    return (
      <div ref={topRef} className="max-w-3xl mx-auto mt-10 bg-void-light/5 border border-emerald-500/30 p-8 sm:p-12 rounded-2xl text-center shadow-2xl animate-in fade-in zoom-in duration-500 w-full overflow-x-hidden">
        
        {isDispatching ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 size={48} className="text-emerald-400 animate-spin mb-6" />
            <h2 className="text-2xl font-black uppercase tracking-wider text-crisp-white mb-2">Finalizing Documents</h2>
            <p className="text-slate-light">Please wait while we encrypt your signatures and securely dispatch the PDF copies to your registered email...</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-wider text-crisp-white mb-2">Agreements Executed</h2>
            <p className="text-slate-light leading-relaxed mb-10">
              Your digital signatures have been permanently attached. Copies of the finalized agreements have been automatically dispatched to your registered email address.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => handleDownloadPDF(hpaContractRef, `HPA_Agreement_${props.ownerName.replace(/\s+/g, '_')}`, setIsDownloadingHpa)} disabled={isDownloadingHpa} className="flex items-center justify-center gap-2 px-6 py-4 bg-void-navy border border-cobalt/30 text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-void-light/10 transition disabled:opacity-50">
                {isDownloadingHpa ? <><Loader2 size={16} className="animate-spin" /> Generating</> : <><Download size={16} /> Download HPA</>}
              </button>
              
              <button onClick={() => handleDownloadPDF(poaContractRef, `POA_Agreement_${props.ownerName.replace(/\s+/g, '_')}`, setIsDownloadingPoa)} disabled={isDownloadingPoa} className="flex items-center justify-center gap-2 px-6 py-4 bg-void-navy border border-cobalt/30 text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-void-light/10 transition disabled:opacity-50">
                {isDownloadingPoa ? <><Loader2 size={16} className="animate-spin" /> Generating</> : <><Download size={16} /> Download POA</>}
              </button>

              <button onClick={() => router.refresh()} className="flex items-center justify-center gap-2 px-6 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition shadow-lg">
                Access Dashboard <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}

        {/* Hidden Render for PDF Generation */}
        <div className="hidden">
          <div ref={hpaContractRef} className="bg-white p-12 w-[800px]"><HpaDocument isPdf={true} /></div>
          <div ref={poaContractRef} className="bg-white p-12 w-[800px]"><PoaDocument isPdf={true} /></div>
        </div>
      </div>
    );
  }

  // --- STEP 2: POA VIEW ---
  if (step === 2) {
    return (
      <div ref={topRef} className="max-w-5xl mx-auto bg-void-light/5 border border-cobalt/30 rounded-xl shadow-2xl animate-in slide-in-from-right-8 duration-500 w-full overflow-x-hidden">
        <div className="p-8 sm:p-12 bg-void-navy/50">
          <PoaDocument isPdf={false} />
        </div>

        <div className="p-8 border-t border-cobalt/30 bg-void-navy">
          {errorMsg && <p className="text-signal-red text-sm font-bold mb-4">{errorMsg}</p>}
          
          <div className="mb-6 p-6 bg-signal-red/5 border border-signal-red/20 rounded-xl">
            <label className="flex items-center gap-2 text-xs font-bold text-signal-red uppercase tracking-widest mb-3"><PenTool size={14} /> Draw Donor Signature</label>
            <div className="bg-crisp-white rounded-lg border-2 border-signal-red/30 overflow-hidden shadow-inner">
              <SignatureCanvas 
                ref={poaOwnerSigCanvas} 
                clearOnResize={false} 
                penColor="#001232" 
                canvasProps={{ className: "w-full h-40 cursor-crosshair" }} 
                onEnd={() => setPoaOwnerSig(poaOwnerSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || null)}
              />
            </div>
            <div className="flex justify-end mt-2">
              <button type="button" onClick={() => { poaOwnerSigCanvas.current?.clear(); setPoaOwnerSig(null); }} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red transition">Clear Canvas</button>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer mb-8 group">
            <input type="checkbox" className="mt-1 w-4 h-4 accent-signal-red cursor-pointer" checked={poaAgreed} onChange={(e) => setPoaAgreed(e.target.checked)} />
            <span className="text-xs text-slate-light leading-relaxed group-hover:text-crisp-white transition">I, {props.ownerName}, acknowledge that checking this box and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => { setStep(1); setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }} className="px-8 py-4 bg-void-light/10 text-slate-light text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-void-light/20 transition">
              Back
            </button>
            <button onClick={handleSubmitAll} disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition disabled:opacity-50">
              {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Processing Agreements</> : <><CheckSquare size={16} /> Submit & Execute Agreements</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 1: HPA VIEW ---
  return (
    <div ref={topRef} className="max-w-5xl mx-auto bg-void-light/5 border border-cobalt/30 rounded-xl shadow-2xl animate-in slide-in-from-bottom-8 duration-500 w-full overflow-x-hidden">
      <div className="p-8 sm:p-12 bg-void-navy/50">
        <HpaDocument isPdf={false} />
      </div>

      <div className="p-8 border-t border-cobalt/30 bg-void-navy">
        {errorMsg && <p className="text-signal-red text-sm font-bold mb-6 bg-signal-red/10 border border-signal-red/20 p-4 rounded-lg">{errorMsg}</p>}
        
        {/* Witness Details Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-void-light/5 border border-cobalt/20 rounded-xl">
          <div className="md:col-span-2"><h4 className="font-bold uppercase tracking-wider text-cobalt text-sm">Owner's Witness Details</h4></div>
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
                ref={hpaWitnessSigCanvas} 
                clearOnResize={false} 
                penColor="#001232" 
                canvasProps={{ className: "w-full h-40 cursor-crosshair" }} 
                onEnd={() => setHpaWitnessSig(hpaWitnessSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || null)}
              />
            </div>
            <div className="flex justify-end mt-2">
              <button type="button" onClick={() => { hpaWitnessSigCanvas.current?.clear(); setHpaWitnessSig(null); }} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red transition">Clear Witness Canvas</button>
            </div>
          </div>
        </div>

        {/* Owner Signature */}
        <div className="mb-6 p-6 bg-signal-red/5 border border-signal-red/20 rounded-xl">
          <label className="flex items-center gap-2 text-xs font-bold text-signal-red uppercase tracking-widest mb-3"><PenTool size={14} /> Draw Owner Signature</label>
          <div className="bg-crisp-white rounded-lg border-2 border-signal-red/30 overflow-hidden shadow-inner">
            <SignatureCanvas 
              ref={hpaOwnerSigCanvas} 
              clearOnResize={false} 
              penColor="#001232" 
              canvasProps={{ className: "w-full h-40 cursor-crosshair" }} 
              onEnd={() => setHpaOwnerSig(hpaOwnerSigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || null)}
            />
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" onClick={() => { hpaOwnerSigCanvas.current?.clear(); setHpaOwnerSig(null); }} className="text-[10px] uppercase tracking-wider text-slate-light hover:text-signal-red transition">Clear Owner Canvas</button>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-8 group">
          <input type="checkbox" className="mt-1 w-4 h-4 accent-signal-red cursor-pointer" checked={hpaAgreed} onChange={(e) => setHpaAgreed(e.target.checked)} />
          <span className="text-xs text-slate-light leading-relaxed group-hover:text-crisp-white transition">I, {props.ownerName}, acknowledge that checking this box and applying my digital signature carries the exact legal weight and binding authority as a physical signature on a paper document.</span>
        </label>

        <button onClick={handleNextToPoa} className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-signal-red text-crisp-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-signal-red/90 transition shadow-lg">
          Next: Review Power of Attorney <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
