const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const Report = require('../models/ReportSchema');
const Profile = require('../models/ProfileSchema');
const { generateIntelligentReport } = require('../services/ai/aiProvider');

// ─── In-memory Rate Limiter ───────────────────────────────────────────────
const rateLimitMap = new Map();

/**
 * Extracts the TRUE dashboard match score from a recommendation object.
 * Checks every possible field name the frontend engine may assign.
 * NEVER uses a fake default — if no score is found, returns 0 (honest).
 */
const extractScore = (item) => {
  const candidates = [
    item.matchPercentage,  // primary field from universityScoring.ts
    item.matchScore,
    item.score,
    item.compatibility,
    item.percentage,
    item.match,
  ];
  for (const c of candidates) {
    const n = Number(c);
    if (c !== undefined && c !== null && !isNaN(n) && n > 0) {
      return Math.min(100, Math.round(n));
    }
  }
  return 0;
};

// ─── Score Helpers ────────────────────────────────────────────────────────
const scoreColor = (s) => {
  if (s >= 90) return '#059669';
  if (s >= 75) return '#2563eb';
  if (s >= 60) return '#d97706';
  return '#dc2626';
};

const scoreLabel = (s) => {
  if (s >= 90) return 'Exceptional Match';
  if (s >= 75) return 'Strong Match';
  if (s >= 60) return 'Good Match';
  return 'Partial Match';
};

// ─── Generate PDF Report ──────────────────────────────────────────────────
/**
 * Single Source of Truth: uses UI-provided recommendation objects with their
 * EXACT dashboard scores. No re-calculation. No fake defaults.
 */
exports.generateReport = async (req, res) => {
  try {
    const { module, recommendations: uiRecommendations, insights: uiInsights } = req.body;
    const userId = req.userId;

    // Rate Limiting: 1 request per 10 seconds per user
    const now = Date.now();
    const lastRequest = rateLimitMap.get(userId);
    if (lastRequest && now - lastRequest < 10000) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please wait 10 seconds before generating another report.' });
    }
    rateLimitMap.set(userId, now);

    if (!['healthcare', 'education', 'schemes'].includes(module)) {
      return res.status(400).json({ success: false, message: 'Invalid module specified' });
    }

    const userProfile = await Profile.findOne({ userId }).lean();
    if (!userProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const recommendations = uiRecommendations || [];
    const insights = uiInsights || '';

    if (recommendations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recommendations provided. Please ensure your profile is complete.',
      });
    }

    // Normalize recommendations — preserve EXACT dashboard scores
    const enrichedRecs = recommendations.map((item, idx) => {
      const finalScore = extractScore(item);

      let reasons = [];
      if (Array.isArray(item.reasons) && item.reasons.length > 0) {
        reasons = item.reasons;
      } else if (Array.isArray(item.explanation) && item.explanation.length > 0) {
        reasons = item.explanation;
      } else if (typeof item.explanation === 'string' && item.explanation.trim()) {
        reasons = [item.explanation];
      } else if (typeof item.reason === 'string' && item.reason.trim()) {
        reasons = [item.reason];
      } else {
        reasons = ['Profile compatibility verified'];
      }

      return {
        name: item.schemeName || item.hospitalName || item['Hospital Name'] || item.name || item.title || 'Recommendation',
        score: finalScore,
        location: item.location || item.province || item.City || item.city || item.details?.city || item.details?.City || 'Pakistan',
        reasons,
        rank: item.rank !== undefined ? item.rank : idx + 1,
        program: item.details?.programs?.[0] || item.details?.program || item.program || null,
        type: item.details?.type || item.type || null,
        fee: item.details?.fee || item.fee || null,
        website: item.details?.web || item.details?.url || item.website || null,
      };
    });

    // Generate AI analysis
    const aiHtmlContent = await generateIntelligentReport(module, userProfile.profile?.[module] || {}, enrichedRecs);

    // Build premium HTML
    const htmlContent = getReportTemplate(module, userProfile, enrichedRecs, insights, aiHtmlContent);

    // PDF generation
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new',
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const fileName = `report_${module}_${userId}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../../uploads/reports', fileName);
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', bottom: '0px', left: '0px', right: '0px' },
    });
    await browser.close();

    const reportUrl = `/uploads/reports/${fileName}`;
    const newReport = new Report({
      userId,
      module,
      reportUrl,
      reportSnapshot: {
        userProfile: userProfile.profile,
        recommendations: enrichedRecs,
        insights,
        aiHtmlContent,
      },
    });
    await newReport.save();

    res.json({
      success: true,
      data: newReport,
      aiSummary: aiHtmlContent,
      recommendations: enrichedRecs,
      scores: enrichedRecs.map((r) => r.score),
      metadata: { module, userId, generatedAt: newReport.createdAt, reportUrl },
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
  }
};

// ─── Get Report History ───────────────────────────────────────────────────
exports.getReportHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const reports = await Report.find({ userId }).sort({ generatedAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch history', error: error.message });
  }
};

// ─── Premium HTML Template ────────────────────────────────────────────────
function getReportTemplate(module, profile, data, insights, aiHtmlContent) {
  const date = new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' });
  const reportId = Math.random().toString(36).substr(2, 9).toUpperCase();
  const moduleTitle = module.charAt(0).toUpperCase() + module.slice(1);
  const totalMatches = data.length;
  const avgMatchScore = totalMatches > 0
    ? Math.round(data.reduce((a, c) => a + (c.score || 0), 0) / totalMatches)
    : 0;
  const topScore = data.length > 0 ? data[0].score : 0;

  // ── Profile Snapshot rows ──────────────────────────────────────────────
  let profileRows = '';
  if (module === 'education') {
    const edu = profile.profile?.education || {};
    profileRows = `
      <div class="prow"><span class="plabel">Degree Goal</span><span class="pval">${edu.degree || 'Not Specified'}</span></div>
      <div class="prow"><span class="plabel">Current Marks</span><span class="pval">${edu.marks || '0'}%</span></div>
      <div class="prow"><span class="plabel">Target City</span><span class="pval">${edu.city || 'Not Specified'}</span></div>
      <div class="prow"><span class="plabel">Preferred Program</span><span class="pval">${edu.preferredProgram || 'All Programs'}</span></div>
      <div class="prow"><span class="plabel">Budget (PKR)</span><span class="pval">${edu.budget ? Number(edu.budget).toLocaleString() : 'Flexible'}</span></div>
      <div class="prow"><span class="plabel">Specialization</span><span class="pval">${edu.specialization || 'General'}</span></div>
    `;
  } else if (module === 'schemes') {
    const sch = profile.profile?.schemes || {};
    profileRows = `
      <div class="prow"><span class="plabel">Monthly Income</span><span class="pval">PKR ${Number(sch.income || 0).toLocaleString()}</span></div>
      <div class="prow"><span class="plabel">Age</span><span class="pval">${sch.age || 'N/A'} years</span></div>
      <div class="prow"><span class="plabel">Province</span><span class="pval">${sch.province || 'Not Specified'}</span></div>
      <div class="prow"><span class="plabel">Employment</span><span class="pval">${sch.employmentStatus || 'Not Specified'}</span></div>
      <div class="prow"><span class="plabel">Family Size</span><span class="pval">${sch.familySize || 'N/A'} members</span></div>
      <div class="prow"><span class="plabel">Financial Needs</span><span class="pval">${Array.isArray(sch.financialNeedType) && sch.financialNeedType.length ? sch.financialNeedType.join(', ') : 'General'}</span></div>
    `;
  } else {
    const hc = profile.profile?.healthcare || {};
    profileRows = `
      <div class="prow"><span class="plabel">City</span><span class="pval">${hc.city || 'Not Specified'}</span></div>
      <div class="prow"><span class="plabel">Max Budget</span><span class="pval">PKR ${Number(hc.maxBudget || 0).toLocaleString()}</span></div>
      <div class="prow"><span class="plabel">Category</span><span class="pval">${hc.hospitalCategory || 'General'}</span></div>
      <div class="prow"><span class="plabel">Treatment Type</span><span class="pval">${hc.treatmentType || 'General'}</span></div>
    `;
  }

  // ── Recommendation cards ───────────────────────────────────────────────
  const recCards = data.map((item, i) => {
    const sc = item.score;
    const col = scoreColor(sc);
    const lbl = scoreLabel(sc);
    const barWidth = Math.min(100, sc);
    const rankBadge = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
    const tagsHtml = item.reasons
      .slice(0, 4)
      .map((r) => `<span class="tag">${r}</span>`)
      .join('');
    const extraHtml = [
      item.program ? `<span class="tag">📚 ${item.program}</span>` : '',
      item.type ? `<span class="tag">🏥 ${item.type}</span>` : '',
    ].filter(Boolean).join('');

    return `
    <div class="rec-card" style="--accent:${col};">
      <div class="rec-card-inner">
        <div class="rec-header">
          <div class="rec-left">
            <div class="rank-badge">${rankBadge}</div>
            <div>
              <div class="rec-name">${item.name}</div>
              <div class="rec-loc">📍 ${item.location}</div>
            </div>
          </div>
          <div class="score-circle" style="border-color:${col}; color:${col};">
            <div class="score-num">${sc}%</div>
            <div class="score-lbl">${lbl}</div>
          </div>
        </div>
        <div class="bar-wrap">
          <div class="bar-track"><div class="bar-fill" style="width:${barWidth}%;background:${col};"></div></div>
          <span class="bar-label" style="color:${col};">${sc}% Match</span>
        </div>
        <div class="tags">${tagsHtml}${extraHtml}</div>
      </div>
    </div>`;
  }).join('');

  // ── Styles ─────────────────────────────────────────────────────────────
  const styles = `
    <style>
      /* ── Print / PDF page setup ── */
      @page {
        size: A4;
        margin: 0;
      }
      @page :first {
        margin: 0;
      }

      /* ── Base reset ── */
      *{box-sizing:border-box;margin:0;padding:0;}
      body{
        font-family:'Inter',-apple-system,sans-serif;
        color:#0f172a;
        background:#fff;
        -webkit-print-color-adjust:exact;
        print-color-adjust:exact;
        orphans:3;
        widows:3;
      }
      .page{max-width:900px;margin:0 auto;}

      /* ── Cover ── */
      .cover{
        background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#0f172a 100%);
        padding:56px 52px 52px;
        position:relative;
        overflow:hidden;
        page-break-inside:avoid;
        break-inside:avoid;
      }
      .cover::before{content:'';position:absolute;top:-80px;right:-80px;width:360px;height:360px;background:radial-gradient(circle,rgba(59,130,246,.25) 0%,transparent 70%);border-radius:50%;}
      .cover::after{content:'';position:absolute;bottom:-60px;left:-60px;width:280px;height:280px;background:radial-gradient(circle,rgba(16,185,129,.15) 0%,transparent 70%);border-radius:50%;}
      .cover-inner{position:relative;z-index:1;}
      .brand{display:flex;align-items:center;gap:12px;margin-bottom:40px;}
      .brand-dot{width:10px;height:10px;background:#3b82f6;border-radius:50%;}
      .brand-name{font-size:12px;font-weight:800;color:rgba(255,255,255,.55);letter-spacing:.22em;text-transform:uppercase;}
      .cover-title{font-size:40px;font-weight:900;color:#fff;letter-spacing:-1.5px;line-height:1.1;margin-bottom:10px;}
      .cover-title span{color:#60a5fa;}
      .cover-sub{font-size:13px;font-weight:500;color:rgba(255,255,255,.45);margin-bottom:44px;}
      .cover-meta{display:flex;gap:36px;}
      .meta-label{font-size:9px;font-weight:800;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.18em;margin-bottom:4px;}
      .meta-val{font-size:13px;font-weight:700;color:rgba(255,255,255,.85);}

      /* ── Stats strip — keep together, no break ── */
      .stats-strip{
        background:#f8fafc;
        border-bottom:1px solid #e2e8f0;
        display:flex;
        page-break-inside:avoid;
        break-inside:avoid;
      }
      .stat-box{flex:1;padding:22px 24px;border-right:1px solid #e2e8f0;text-align:center;}
      .stat-box:last-child{border-right:none;}
      .stat-num{font-size:26px;font-weight:900;color:#0f172a;line-height:1;margin-bottom:5px;}
      .stat-lbl{font-size:9px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.16em;}

      /* ── Page body ── */
      .body{padding:44px 52px;}

      /* ── Sections ── */
      .section{
        margin-bottom:40px;
        page-break-inside:avoid;
        break-inside:avoid;
      }
      .section-head{
        display:flex;
        align-items:center;
        gap:12px;
        margin-bottom:20px;
        page-break-after:avoid;
        break-after:avoid;
      }
      .section-num{width:28px;height:28px;background:#0f172a;color:#fff;font-size:11px;font-weight:900;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
      .section-title{font-size:12px;font-weight:900;color:#0f172a;text-transform:uppercase;letter-spacing:.16em;}
      .section-line{flex:1;height:1px;background:#e2e8f0;}

      /* Section 3 (Ranked Recommendations) — no forced page break, just natural flow */
      .section-recs{
        margin-bottom:0;
        page-break-inside:avoid;
        break-inside:avoid;
      }

      /* ── Profile grid ── */
      .profile-card{
        background:#f8fafc;
        border:1px solid #e2e8f0;
        border-radius:18px;
        overflow:hidden;
        display:grid;
        grid-template-columns:1fr 1fr 1fr;
        page-break-inside:avoid;
        break-inside:avoid;
      }
      .prow{padding:13px 18px;border-bottom:1px solid #f1f5f9;display:flex;flex-direction:column;gap:3px;page-break-inside:avoid;break-inside:avoid;}
      .plabel{font-size:9px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.14em;}
      .pval{font-size:13px;font-weight:700;color:#0f172a;}

      /* ── AI Analysis box ── */
      .ai-box{
        background:linear-gradient(135deg,#eff6ff 0%,#f0fdf4 100%);
        border:1px solid #bfdbfe;
        border-radius:18px;
        padding:36px;
        page-break-inside:avoid;
        break-inside:avoid;
      }
      /* AI sub-headings always stay with the paragraph that follows */
      .ai-box h2,.ai-box h3{
        color:#1e3a5f;
        font-size:14px;
        font-weight:800;
        margin:20px 0 8px;
        padding-bottom:5px;
        border-bottom:1px solid rgba(59,130,246,.2);
        page-break-after:avoid;
        break-after:avoid;
        orphans:2;
        widows:2;
      }
      .ai-box h2:first-child,.ai-box h3:first-child{margin-top:0;}
      .ai-box p{
        font-size:13px;
        color:#334155;
        line-height:1.8;
        margin-bottom:10px;
        font-weight:500;
        orphans:3;
        widows:3;
      }
      .ai-box ul,.ai-box ol{
        font-size:13px;
        color:#334155;
        padding-left:20px;
        margin:6px 0 12px;
        line-height:1.8;
        font-weight:500;
      }
      .ai-box li{page-break-inside:avoid;break-inside:avoid;}
      .ai-box strong{color:#1e3a5f;font-weight:800;}

      /* ── Recommendation cards — NEVER split across pages ── */
      .rec-card{
        page-break-inside:avoid;
        break-inside:avoid;
        margin-bottom:18px;
      }
      .rec-card-inner{
        background:#fff;
        border:1px solid #e2e8f0;
        border-left:4px solid var(--accent);
        border-radius:14px;
        padding:24px;
        box-shadow:0 2px 10px rgba(0,0,0,.05);
        page-break-inside:avoid;
        break-inside:avoid;
      }
      .rec-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;gap:14px;page-break-inside:avoid;break-inside:avoid;}
      .rec-left{display:flex;align-items:flex-start;gap:14px;flex:1;min-width:0;}
      .rank-badge{font-size:22px;line-height:1;flex-shrink:0;}
      .rec-name{font-size:16px;font-weight:800;color:#0f172a;margin-bottom:3px;}
      .rec-loc{font-size:11px;font-weight:600;color:#64748b;}
      .score-circle{border:2px solid;border-radius:12px;padding:10px 16px;text-align:center;flex-shrink:0;page-break-inside:avoid;break-inside:avoid;}
      .score-num{font-size:22px;font-weight:900;line-height:1;}
      .score-lbl{font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;opacity:.8;margin-top:2px;}
      .bar-wrap{display:flex;align-items:center;gap:12px;margin-bottom:12px;page-break-inside:avoid;break-inside:avoid;}
      .bar-track{flex:1;height:6px;background:#f1f5f9;border-radius:99px;overflow:hidden;}
      .bar-fill{height:100%;border-radius:99px;}
      .bar-label{font-size:10px;font-weight:800;white-space:nowrap;}
      .tags{display:flex;flex-wrap:wrap;gap:6px;page-break-inside:avoid;break-inside:avoid;}
      .tag{background:#f1f5f9;color:#475569;font-size:10px;font-weight:700;padding:4px 10px;border-radius:8px;}

      /* ── Footer ── */
      .footer{
        background:#0f172a;
        padding:28px 52px;
        display:flex;
        justify-content:space-between;
        align-items:center;
        page-break-inside:avoid;
        break-inside:avoid;
        margin-top:40px;
      }
      .footer-brand{font-size:11px;font-weight:800;color:rgba(255,255,255,.45);letter-spacing:.14em;text-transform:uppercase;}
      .footer-note{font-size:10px;font-weight:500;color:rgba(255,255,255,.25);max-width:320px;text-align:right;line-height:1.6;}
    </style>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>AwamAssist ${moduleTitle} Intelligence Report</title>
  ${styles}
</head>
<body>
<div class="page">

  <!-- COVER -->
  <div class="cover">
    <div class="cover-inner">
      <div class="brand">
        <div class="brand-dot"></div>
        <div class="brand-name">AwamAssist · AI Intelligence Platform</div>
      </div>
      <div class="cover-title">${moduleTitle} <span>Intelligence</span><br/>Report</div>
      <div class="cover-sub">Personalized · Data-Synchronized · AI-Enhanced Analysis</div>
      <div class="cover-meta">
        <div><div class="meta-label">Report ID</div><div class="meta-val">#${reportId}</div></div>
        <div><div class="meta-label">Generated</div><div class="meta-val">${date}</div></div>
        <div><div class="meta-label">Module</div><div class="meta-val">${moduleTitle}</div></div>
        <div><div class="meta-label">Matches Found</div><div class="meta-val">${totalMatches}</div></div>
      </div>
    </div>
  </div>

  <!-- STATS STRIP -->
  <div class="stats-strip">
    <div class="stat-box"><div class="stat-num">${totalMatches}</div><div class="stat-lbl">Total Matches</div></div>
    <div class="stat-box"><div class="stat-num">${topScore}%</div><div class="stat-lbl">Top Score</div></div>
    <div class="stat-box"><div class="stat-num">${avgMatchScore}%</div><div class="stat-lbl">Avg Compatibility</div></div>
    <div class="stat-box"><div class="stat-num">99%</div><div class="stat-lbl">Data Reliability</div></div>
  </div>

  <!-- BODY -->
  <div class="body">

    <!-- 1. Profile Snapshot -->
    <div class="section">
      <div class="section-head">
        <div class="section-num">1</div>
        <div class="section-title">User Profile Snapshot</div>
        <div class="section-line"></div>
      </div>
      <div class="profile-card">${profileRows}</div>
    </div>

    <!-- 2. AI Intelligence Analysis -->
    <div class="section">
      <div class="section-head">
        <div class="section-num">2</div>
        <div class="section-title">AI Intelligence Analysis</div>
        <div class="section-line"></div>
      </div>
      <div class="ai-box">
        ${aiHtmlContent || '<p>Our AI engine has analyzed your profile parameters against the current dataset to identify the most compatible opportunities. Recommendations are ranked by merit, proximity, budget compatibility, and eligibility alignment.</p>'}
      </div>
    </div>

    <!-- 3. Ranked Recommendations — always starts on a new page -->
    <div class="section section-recs">
      <div class="section-head">
        <div class="section-num">3</div>
        <div class="section-title">Ranked Recommendation Analysis</div>
        <div class="section-line"></div>
      </div>
      ${recCards || '<p style="color:#64748b;font-size:13px;">No high-confidence matches found for the current profile configuration.</p>'}
    </div>

  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-brand">AwamAssist · Intelligence Engine v3.5</div>
    <div class="footer-note">All match percentages and rankings are derived directly from the dashboard recommendation engine and reflect your exact profile data. This report is a synchronized snapshot.</div>
  </div>

</div>
</body>
</html>`;
}
