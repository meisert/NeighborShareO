import React from 'react';
import { X, ShieldAlert, CheckCircle2, ShieldCheck, HeartHandshake, AlertTriangle, FileText, ExternalLink } from 'lucide-react';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  showAcceptButton = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Member Agreement & Terms of Service
              </h2>
              <p className="text-[11px] text-slate-300">
                Item Liability Disclaimer & Neighbor-to-Neighbor Policy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close Terms modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-600 leading-relaxed">
          {/* Key Summary Box (modeled after Nextdoor member policy) */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-amber-950">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Summary: NeighborShare Is Not Responsible for Items or User Conduct</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              Like community bulletin boards (such as Nextdoor), <strong>NeighborShare is solely a communication platform</strong> to connect neighbors. NeighborShare is <strong>not a party</strong> to any member-to-member transaction, does not inspect or insure items, and <strong>assumes no responsibility or liability</strong> for lost, broken, damaged, defective, or unreturned items, or for any personal injury or property damage arising from borrowing or lending.
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Platform Role Only (Not a Party to Transactions)</span>
            </h3>
            <p>
              NeighborShare provides an online directory and messaging software for residents to connect within their local neighborhoods. We do not own, buy, sell, rent, lease, store, or inspect any items listed. We are not a party to member-to-member agreements, and we do not broker, guarantee, or insure any exchanges. Any loan or borrowing arrangement is made directly between the lender and borrower at their sole discretion and risk.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>2. No Responsibility for Item Condition, Damage, or Loss</span>
            </h3>
            <p>
              All items are offered strictly <strong>&ldquo;AS IS&rdquo;</strong> and <strong>&ldquo;AS AVAILABLE&rdquo;</strong> by individual neighbors.
            </p>
            <ul className="list-disc pl-5 space-y-1 pt-1 text-slate-600">
              <li>
                <strong>No Item Warranties:</strong> NeighborShare makes no representations or warranties regarding the condition, mechanical safety, roadworthiness, electrical grounding, structural integrity, or fitness for purpose of any tool, ladder, equipment, or supply.
              </li>
              <li>
                <strong>Borrower Inspection:</strong> Borrowers are solely responsible for carefully inspecting items before acceptance and use, reading applicable operator manuals, and adhering to all recommended safety standards (including protective gear).
              </li>
              <li>
                <strong>No Loss / Damage Coverage:</strong> NeighborShare provides no insurance, warranty, or financial protection against item theft, breakage, cosmetic wear, water damage, total loss, or failure of a borrower to return an item.
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>3. Total Release of Liability & Assumption of Risk</span>
            </h3>
            <p>
              By using NeighborShare to borrow or lend items, you voluntarily assume all associated risks, including but not limited to the risk of tool malfunction, bodily injury, property damage, or dispute. To the maximum extent permitted by applicable law, you release and hold harmless NeighborShare, its founders, operators, affiliates, and developers from any claims, liabilities, lawsuits, or demands arising out of member interactions, handoffs, and equipment use.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>4. Neighbor-to-Neighbor Deposits & Voluntary Fees</span>
            </h3>
            <p>
              NeighborShare is a zero-commission service and does not process, escrow, or mediate financial payments. Any voluntary wear-and-tear fee or refundable deposit noted in listings is strictly an informal neighbor-to-neighbor understanding handled directly in person (e.g. at porch handoff). NeighborShare cannot compel payments, enforce deposits, demand refunds, or act as a collection agent.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>5. Community Honor Code & Safe Handoffs</span>
            </h3>
            <p>
              Members agree to uphold the neighborhood honor code: treat borrowed items with utmost care, return items on time and cleaned, communicate openly if an issue occurs, and exercise reasonable caution when meeting neighbors at front porches or gates.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
            Last Updated: October 2026 · Austin, TX · NeighborShare Community Network
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Community peer-to-peer honor agreement</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors"
            >
              Close
            </button>
            {showAcceptButton && onAccept && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
              >
                I Understand & Agree
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
