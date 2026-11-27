import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Search, 
  Users, 
  Globe, 
  Sparkles, 
  MessageSquare, 
  ExternalLink,
  Printer,
  FileText,
  Mail,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface ShareCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoodName: string;
  zipCode: string;
}

type TemplateType = 'nextdoor' | 'hoa' | 'facebook' | 'reddit';

export const ShareCommunityModal: React.FC<ShareCommunityModalProps> = ({
  isOpen,
  onClose,
  neighborhoodName,
  zipCode,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState<'invite' | 'flyer' | 'seo'>('invite');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('nextdoor');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://neighborshare.austin';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl)}&margin=10`;

  const templates: Record<TemplateType, { title: string; text: string }> = {
    nextdoor: {
      title: 'Nextdoor Neighborhood Post',
      text: `Hey neighbors! 🏡 If anyone ever needs to borrow household tools (lawn aerator, pressure washer, drill, tall ladder) or party tables instead of buying brand new, check out NeighborShare for our ${neighborhoodName} neighborhood: ${currentUrl}\n\nWhy buy when we can borrow from a neighbor? It's zero-commission, free to use, and helps us share what's already sitting in our garages.`,
    },
    hoa: {
      title: 'HOA Newsletter / Community Email',
      text: `Community Tool & Equipment Sharing: NeighborShare for ${neighborhoodName}\n\nDear neighbors,\n\nDid you know the average power tool is only used for 13 minutes in its entire lifespan? To save money, reduce clutter, and build local community, neighbors in ${neighborhoodName} (${zipCode}) can borrow and share equipment—from pressure washers and lawn aerators to folding tables and camping gear.\n\nVisit ${currentUrl} to see what items are available nearby or list a tool from your garage!`,
    },
    facebook: {
      title: 'Local Facebook / Buy Nothing Group',
      text: `Hey everyone! Just sharing a wonderful free neighbor-to-neighbor resource: ${currentUrl}\n\nBefore spending money on tools or gear you only need for one weekend (pressure washers, carpet cleaners, miter saws, canopy tents), you can borrow them from neighbors in ${neighborhoodName}. Let's make borrowing the new normal!`,
    },
    reddit: {
      title: 'Reddit r/Austin Community Post',
      text: `[Austin Resource] NeighborShare — Peer-to-peer neighborhood tool & equipment sharing in South Austin\n\nHey r/Austin! If you're tackling weekend DIY projects in ${neighborhoodName} or nearby areas, check out ${currentUrl}. You can borrow lawn aerators, ladders, power drills, and event tables from verified neighbors instead of buying things you'll only use once. Zero platform cut, 100% neighbor-to-neighbor.`,
    },
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyTemplate = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `NeighborShare — ${neighborhoodName}`,
          text: `Borrow and share tools, party gear, and lawn equipment in ${neighborhoodName}!`,
          url: currentUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePrintFlyer = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>NeighborShare Community Flyer - ${neighborhoodName}</title>
          <style>
            @page { size: letter portrait; margin: 0.5in; }
            body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; margin: 0; padding: 24px; }
            .header { text-align: center; border-bottom: 3px solid #059669; padding-bottom: 20px; }
            .badge { display: inline-block; background: #ecfdf5; color: #065f46; padding: 6px 14px; border-radius: 999px; font-weight: bold; font-size: 14px; margin-bottom: 12px; }
            h1 { font-size: 32px; margin: 6px 0; color: #0f172a; font-weight: 800; letter-spacing: -0.5px; }
            .tagline { font-size: 20px; color: #059669; font-weight: 700; margin-top: 4px; }
            .grid { display: flex; align-items: center; justify-content: space-between; margin: 30px 0; gap: 24px; }
            .qr-box { text-align: center; border: 2px dashed #059669; padding: 16px; border-radius: 16px; width: 220px; }
            .qr-box img { width: 180px; height: 180px; }
            .content { flex: 1; font-size: 15px; line-height: 1.6; }
            .features { list-style: none; padding: 0; margin: 16px 0; }
            .features li { margin-bottom: 10px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
            .tear-off { margin-top: 40px; border-top: 2px dashed #94a3b8; padding-top: 16px; display: flex; justify-content: space-between; }
            .tab { border-right: 1px dashed #cbd5e1; padding: 8px 12px; text-align: center; font-size: 11px; flex: 1; transform: rotate(0deg); }
            .tab:last-child { border-right: none; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="badge">🏡 ${neighborhoodName} Community Bulletin</div>
            <h1>Why buy when you can borrow from a neighbor?</h1>
            <div class="tagline">NeighborShare — Borrow & Lend Tools with Neighbors</div>
          </div>

          <div class="grid">
            <div class="content">
              <p>Need a tool for a quick weekend project? Don't spend hundreds at the big box store for an item you'll only use once.</p>
              <ul class="features">
                <li>✅ <strong>Lawn & Garden:</strong> Pressure washers, lawn aerators, broadcast spreaders</li>
                <li>✅ <strong>Workshop & Tools:</strong> Cordless drills, ladders, miter saws</li>
                <li>✅ <strong>Events & Outdoors:</strong> 10x10 canopies, folding chairs & tables, camping gear</li>
                <li>✅ <strong>100% Free Platform:</strong> Zero commission, neighbor-to-neighbor handoffs</li>
              </ul>
              <p><strong>Scan the QR code to see what's available or list items from your garage:</strong></p>
              <p style="font-size: 16px; color: #047857; font-weight: bold;">${currentUrl}</p>
            </div>
            <div class="qr-box">
              <img src="${qrCodeUrl}" alt="Scan QR Code" />
              <div style="font-size: 12px; font-weight: bold; margin-top: 8px; color: #065f46;">Scan with Phone Camera</div>
            </div>
          </div>

          <div class="tear-off">
            ${Array(6).fill(0).map(() => `
              <div class="tab">
                <strong>NeighborShare</strong><br/>
                ${neighborhoodName}<br/>
                <span style="font-size: 9px; color: #047857;">${currentUrl}</span>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Boost Exposure & Spread the Word
              </h2>
              <p className="text-[11px] text-slate-300">
                SEO indexing, printable neighborhood flyers, and community outreach for {neighborhoodName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'invite'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Community Templates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('flyer')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'flyer'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Printable Flyer & QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
              activeTab === 'seo'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Search Engine SEO</span>
          </button>
        </div>

        {/* Tab 1: Community Templates */}
        {activeTab === 'invite' && (
          <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 flex-1">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950 font-bold block mb-0.5">
                  The #1 Fastest Way to Get Active Users:
                </strong>
                <span>
                  Posting once on <strong>Nextdoor</strong> or in your <strong>local Facebook HOA group</strong> typically brings 20–50 nearby neighbors into your sharing pool on day one!
                </span>
              </div>
            </div>

            {/* Template Selector Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Choose Channel Template:
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(templates) as TemplateType[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedTemplate(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedTemplate === key
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {templates[key].title}
                  </button>
                ))}
              </div>
            </div>

            {/* Pre-Written Post Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Ready-to-Post Text
                </label>
                <button
                  type="button"
                  onClick={() => handleCopyTemplate(templates[selectedTemplate].text)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedTemplate ? 'Copied to Clipboard!' : 'Copy Post Text'}</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={5}
                value={templates[selectedTemplate].text}
                className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-hidden leading-relaxed font-sans"
              />
            </div>

            {/* Direct Shortcuts */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                1-Click Sharing Shortcuts:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-center font-bold text-slate-800 flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Phone Share Menu</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(templates[selectedTemplate].text)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-center font-bold text-slate-800 flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp / SMS</span>
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-center font-bold text-slate-800 flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                  <span>Facebook Group</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Printable Flyer & QR Code */}
        {activeTab === 'flyer' && (
          <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 flex-1">
            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
              <Printer className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-950 font-bold block mb-0.5">
                  Physical Bulletins Convert at 40%+
                </strong>
                <span>
                  Printing a single flyer with a QR code and pinning it to your <strong>neighborhood mail kiosk</strong>, <strong>HOA pool bulletin board</strong>, or <strong>dog park gate</strong> connects with neighbors who don't read social media.
                </span>
              </div>
            </div>

            {/* Flyer Preview Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
              <div className="w-36 h-36 bg-white p-2 border border-slate-200 rounded-xl shadow-2xs shrink-0 flex items-center justify-center">
                <img src={qrCodeUrl} alt="App QR Code" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-1.5 text-left">
                <div className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Print-Ready (Letter 8.5" x 11")
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Neighborhood Bulletin Flyer with Tear-Off Tabs
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Includes a high-contrast camera-scannable QR code directly pointing to your website, tool categories, and 6 tear-off slips for neighbors.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handlePrintFlyer}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Open & Print Flyer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Technical SEO & Search Engine Checklist */}
        {activeTab === 'seo' && (
          <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 flex-1">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Web Indexing & Technical SEO: Active & Ready</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                All modern technical search engine standards are now embedded directly in the site code.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-xs">
                  ✅ 1. Search Engine Crawler Directives (<code>robots.txt</code> & <code>sitemap.xml</code>)
                </span>
                <p className="text-[11px] text-slate-500">
                  Created <code>/robots.txt</code> and <code>/sitemap.xml</code> instructing Googlebot, Bingbot, and Applebot to index all pages, feeds, and categories.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-xs">
                  ✅ 2. Schema.org WebApplication & Organization JSON-LD
                </span>
                <p className="text-[11px] text-slate-500">
                  Search engines use this structured data to qualify NeighborShare for rich search snippets (free community platform rating, pricing: $0, category: LifestyleApplication).
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-xs">
                  ✅ 3. Web App Manifest (<code>manifest.json</code>)
                </span>
                <p className="text-[11px] text-slate-500">
                  Enables neighbors on iOS Safari and Android Chrome to tap "Add to Home Screen" like an app store app.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-xs">
                  ✅ 4. Crawlable Fallback Content (HTML Shell)
                </span>
                <p className="text-[11px] text-slate-500">
                  Added a crawlable semantic fallback describing all Austin neighborhoods and tool categories so search engines that don't execute heavy JavaScript index full textual content immediately.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-xs">
                  🌐 5. Next Step: Google Search Console Submission
                </span>
                <p className="text-[11px] text-slate-500">
                  When you have your production or custom domain mapped, submit your sitemap at <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-700 underline">search.google.com/search-console</a> to accelerate crawling for queries like <em>"borrow pressure washer Austin"</em>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="text-[11px] text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1 font-mono max-w-[200px] truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              {copiedLink ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
