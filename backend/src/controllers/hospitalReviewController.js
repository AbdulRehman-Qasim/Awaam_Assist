/**
 * hospitalReviewController.js
 * Handles fetching, storing, and serving Reddit-sourced hospital review data.
 *
 * Public routes:
 *   GET  /api/hospitals/:id/reviews
 *   GET  /api/hospitals/reviews/compare?ids=id1,id2,id3
 *
 * Background:
 *   runBackgroundScraper() — called once after DB connects
 */

'use strict';

const Hospital           = require('../models/HospitalSchema');
const HospitalReviewData = require('../models/HospitalReviewDataSchema');
const { scrapeHospitalReviews } = require('../services/redditScraperService');
const { analyzeHospitalPosts }  = require('../services/reviewAnalyzerService');

// Reviews are considered fresh for 7 days
const FRESHNESS_MS = 7 * 24 * 60 * 60 * 1000;

// Keep track of active scrapes in memory to prevent duplicate parallel runs
const activeScrapes = new Set();

// ── Core scrape-and-analyze pipeline ─────────────────────────────────────────

async function scrapeAndStore(hospital) {
  const hospitalIdStr = hospital._id.toString();
  if (activeScrapes.has(hospitalIdStr)) {
    console.log(`[HospitalReview] Skip scraping for "${hospital['Hospital Name'] || hospital.hospitalName}" — scrape already active in memory.`);
    return null;
  }
  activeScrapes.add(hospitalIdStr);

  const hospitalName = hospital['Hospital Name'] || hospital.hospitalName || '';
  const city         = hospital.City || '';

  if (!hospitalName) {
    activeScrapes.delete(hospitalIdStr);
    return null;
  }

  console.log(`[HospitalReview] ▶ Scraping: "${hospitalName}" (${city})`);

  // Mark as in-progress (upsert)
  await HospitalReviewData.findOneAndUpdate(
    { hospitalId: hospital._id },
    {
      $set: {
        hospitalName,
        city,
        status: 'scraping',
      },
    },
    { upsert: true }
  );

  try {
    const posts = await scrapeHospitalReviews(hospitalName, city);

    if (!posts || posts.length === 0) {
      console.log(`[HospitalReview] ✗ No Reddit data for "${hospitalName}"`);
      await HospitalReviewData.findOneAndUpdate(
        { hospitalId: hospital._id },
        {
          $set: {
            status:       'no_data',
            totalMentions: 0,
            lastScrapedAt: new Date(),
          },
        },
        { upsert: true }
      );
      return null;
    }

    const analysis = await analyzeHospitalPosts(hospitalName, city, posts);

    if (!analysis) {
      await HospitalReviewData.findOneAndUpdate(
        { hospitalId: hospital._id },
        { $set: { status: 'error', lastScrapedAt: new Date() } },
        { upsert: true }
      );
      return null;
    }

    const saved = await HospitalReviewData.findOneAndUpdate(
      { hospitalId: hospital._id },
      {
        $set: {
          hospitalName,
          city,
          ratings:       analysis.ratings,
          overallRating: analysis.overallRating,
          totalMentions: analysis.totalMentions,
          summary:       analysis.summary,
          redditPosts:   posts.slice(0, 5).map((p) => ({
            title:     p.title,
            url:       p.url,
            subreddit: p.subreddit,
            score:     p.score,
            snippet:   (p.snippet || '').slice(0, 250),
            postedAt:  p.postedAt,
          })),
          status:        'analyzed',
          lastScrapedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    console.log(
      `[HospitalReview] ✔ "${hospitalName}" — overall: ${analysis.overallRating}/10 ` +
      `(${analysis.totalMentions} mentions)`
    );
    return saved;
  } catch (err) {
    console.error(`[HospitalReview] ✗ Error for "${hospitalName}":`, err.message);
    await HospitalReviewData.findOneAndUpdate(
      { hospitalId: hospital._id },
      { $set: { status: 'error', lastScrapedAt: new Date() } },
      { upsert: true }
    );
    return null;
  } finally {
    activeScrapes.delete(hospitalIdStr);
  }
}

// ── Check if a review doc needs refreshing ────────────────────────────────────

function needsRefresh(doc) {
  if (!doc) return true;

  // If scraping is already in progress, only retry if it timed out (e.g. server crashed/stuck)
  if (doc.status === 'scraping') {
    const updatedAt = doc.updatedAt || doc.createdAt || new Date();
    const timeSinceUpdate = Date.now() - new Date(updatedAt).getTime();
    const SCRAPE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes timeout
    if (timeSinceUpdate > SCRAPE_TIMEOUT_MS) {
      console.log(`[HospitalReview] Scrape timeout detected for "${doc.hospitalName}". Retrying...`);
      return true;
    }
    return false; // Still scraping, do not trigger a parallel scrape
  }

  if (doc.status === 'pending' || doc.status === 'error') return true;
  if (!doc.lastScrapedAt) return true;
  return Date.now() - new Date(doc.lastScrapedAt).getTime() > FRESHNESS_MS;
}

// ── Public: GET /api/hospitals/:id/reviews ────────────────────────────────────

const getHospitalReviews = async (req, res) => {
  try {
    const { id } = req.params;

    const hospital = await Hospital.findById(id).lean();
    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, message: 'Hospital not found' });
    }

    let reviewDoc = await HospitalReviewData.findOne({ hospitalId: id }).lean();

    if (needsRefresh(reviewDoc)) {
      // Fire-and-forget background scrape — don't block the response
      const h = hospital; // capture for async closure
      setImmediate(() => scrapeAndStore(h).catch(console.error));

      // Return whatever we have (may be null / stale)
      if (!reviewDoc) {
        return res.status(200).json({
          success: true,
          data:    {
            status:  'scraping',
            message: 'Gathering community reviews — check back shortly.',
          },
        });
      }
    }

    return res.status(200).json({ success: true, data: reviewDoc });
  } catch (err) {
    console.error('[getHospitalReviews]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Public: GET /api/hospitals/reviews/compare?ids=id1,id2,id3 ───────────────

const getCompareReviews = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res
        .status(400)
        .json({ success: false, message: '`ids` query param required' });
    }

    const idArray = ids
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    const reviews = await HospitalReviewData.find({
      hospitalId: { $in: idArray },
    }).lean();

    // Map by hospitalId string for easy frontend lookup
    const result = {};
    for (const id of idArray) {
      result[id] = reviews.find((r) => r.hospitalId.toString() === id) || null;
    }

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error('[getCompareReviews]', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Background scraper (runs once after DB connects) ─────────────────────────

/**
 * Iterates all approved hospitals that have never been scraped (or have
 * stale / error data) and processes them in parallel batches of 3.
 * Hospitals scraped within the freshness window are skipped.
 */
async function runBackgroundScraper() {
  try {
    console.log('[BackgroundScraper] 🔍 Starting hospital community review scraping...');

    const hospitals = await Hospital.find({ status: 'approved' })
      .select({ _id: 1, 'Hospital Name': 1, City: 1 })
      .lean();

    if (hospitals.length === 0) {
      console.log('[BackgroundScraper] No hospitals found.');
      return;
    }

    const existing = await HospitalReviewData.find(
      {},
      { hospitalId: 1, status: 1, lastScrapedAt: 1 }
    ).lean();

    const existingMap = {};
    for (const r of existing) {
      existingMap[r.hospitalId.toString()] = r;
    }

    const toScrape = hospitals.filter((h) => needsRefresh(existingMap[h._id.toString()]));

    console.log(
      `[BackgroundScraper] ${hospitals.length} hospitals total, ` +
      `${toScrape.length} need scraping.`
    );

    if (toScrape.length === 0) {
      console.log('[BackgroundScraper] All hospitals already up to date.');
      return;
    }

    // ── Parallel batch processing ────────────────────────────────────────────
    // Process 3 hospitals concurrently, pause 8 s between batches
    // → 60 hospitals: 20 batches × 8 s = ~2.7 minutes total
    const BATCH_SIZE       = 3;
    const BATCH_DELAY_MS   = 8000;

    for (let i = 0; i < toScrape.length; i += BATCH_SIZE) {
      const batch = toScrape.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((h) => scrapeAndStore(h).catch(console.error)));

      console.log(
        `[BackgroundScraper] ✔ Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(toScrape.length / BATCH_SIZE)} done`
      );

      if (i + BATCH_SIZE < toScrape.length) {
        await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
      }
    }

    console.log('[BackgroundScraper] ✅ All hospitals processed.');
  } catch (err) {
    console.error('[BackgroundScraper] Fatal error:', err.message);
  }
}

module.exports = {
  getHospitalReviews,
  getCompareReviews,
  runBackgroundScraper,
};
