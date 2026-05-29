import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { Scale, FileText, Download, ShieldCheck, Calendar, CarFront, Clock } from "lucide-react";

const prisma = new PrismaClient();

export default async function LegalVaultPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect("/owner/login");
  }

  // Fetch the user's vehicles and their associated contracts
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      ownedVehicles: {
        include: {
          contract: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) redirect("/owner/login");

  // Filter ONLY vehicles that have a signed contract
  const signedAssets = user.ownedVehicles.filter(
    (v) => v.contract && v.contract.isSigned === true
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-x-hidden pb-20">
      
      {/* Header Section */}
      <div className="border-b border-cobalt/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide mb-2 flex items-center gap-3">
            <Scale className="text-cobalt" /> Legal Vault
          </h1>
          <p className="text-slate-light">Secure repository for all your executed Hire Purchase Agreements and Powers of Attorney.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-400/10 text-emerald-400 px-4 py-2 rounded-lg border border-emerald-400/20 shrink-0 w-fit">
          <ShieldCheck size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">End-to-End Encrypted</span>
        </div>
      </div>

      {signedAssets.length === 0 ? (
        // Empty State
        <div className="bg-void-light/5 border border-cobalt/20 rounded-xl p-12 text-center shadow-lg">
          <FileText className="w-16 h-16 text-slate-light/20 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-crisp-white mb-2 uppercase tracking-widest">No Executed Documents Found</h3>
          <p className="text-sm text-slate-light max-w-md mx-auto">
            You currently have no signed agreements in your vault. When a new asset is assigned to you and you execute the specific agreements, they will appear here.
          </p>
        </div>
      ) : (
        // Document List (Loops per Vehicle)
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {signedAssets.map((vehicle) => {
            const contract = vehicle.contract!;
            const signedDate = new Date(contract.updatedAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric'
            });

            // FALLBACK FIX: Use the new contract-specific URL, but if it's an old signature, fall back to the user's saved URL
            const baseDocumentUrl = contract.signedDocumentUrl || user.hpaAgreementUrl;

            // Cloudinary trick: force download and name the file using the vehicle's plate number
            const hpaDownloadLink = baseDocumentUrl 
              ? `${baseDocumentUrl}?fl_attachment=YUSDAAM_HPA_${vehicle.registrationNumber}.pdf` 
              : null;
              
            // THE SHORTCUT: Swap "_HPA_Agreement" for "_Power_Of_Attorney" in the URL dynamically
            const poaDownloadLink = baseDocumentUrl 
              ? `${baseDocumentUrl.replace("_HPA_Agreement", "_Power_Of_Attorney")}?fl_attachment=YUSDAAM_POA_${vehicle.registrationNumber}.pdf` 
              : null;

            return (
              <div key={vehicle.id} className="bg-void-navy/50 border border-cobalt/20 rounded-xl p-6 shadow-lg hover:border-cobalt/50 transition duration-300 flex flex-col h-full">
                
                {/* Vehicle Identification */}
                <div className="flex items-start justify-between border-b border-cobalt/20 pb-4 mb-4">
                  <div>
                    <h2 className="text-lg font-black text-crisp-white uppercase tracking-wider flex items-center gap-2">
                      <CarFront size={18} className="text-cobalt" /> {vehicle.makeModel}
                    </h2>
                    <p className="text-xs text-slate-light font-mono mt-1">Plate: {vehicle.registrationNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                      Executed
                    </span>
                  </div>
                </div>

                {/* Contract Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-light">
                    <Calendar size={16} className="text-cobalt" />
                    <span><strong>Signed On:</strong> {signedDate}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-light">
                    <ShieldCheck size={16} className="text-cobalt" />
                    <span><strong>Witnessed By:</strong> {contract.witnessName || "Registered Witness"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-light">
                    <FileText size={16} className="text-cobalt" />
                    <span><strong>Status:</strong> Legally Binding & Active</span>
                  </div>
                </div>

                {/* Download Actions (Pushed to bottom of card) */}
                <div className="mt-auto">
                  <div className="grid grid-cols-2 gap-3">
                    {hpaDownloadLink ? (
                      <a 
                        href={hpaDownloadLink}
                        download
                        className="flex items-center justify-center gap-2 py-3 bg-cobalt/10 text-cobalt hover:bg-cobalt/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition border border-cobalt/30"
                      >
                        <Download size={14} /> Download HPA
                      </a>
                    ) : (
                      <button disabled className="flex items-center justify-center gap-2 py-3 bg-void-light/5 text-slate-light/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg border border-white/5 cursor-not-allowed">
                        <Clock size={14} /> Awaiting PDF
                      </button>
                    )}
                    
                    {poaDownloadLink ? (
                      <a 
                        href={poaDownloadLink}
                        download
                        className="flex items-center justify-center gap-2 py-3 bg-cobalt/10 text-cobalt hover:bg-cobalt/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition border border-cobalt/30"
                      >
                        <Download size={14} /> Download POA
                      </a>
                    ) : (
                      <button disabled className="flex items-center justify-center gap-2 py-3 bg-void-light/5 text-slate-light/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-lg border border-white/5 cursor-not-allowed">
                        <Clock size={14} /> Awaiting PDF
                      </button>
                    )}
                  </div>

                  {/* Updated conditional to check baseDocumentUrl instead of contract.signedDocumentUrl directly */}
                  {!baseDocumentUrl && (
                    <p className="text-[10px] text-amber-400/70 mt-4 text-center italic">
                      * Final combined PDFs are currently being generated by the Administrator.
                    </p>
                  )}
                </div>
                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
