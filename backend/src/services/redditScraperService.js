/**
 * redditScraperService.js
 * Uses Reddit's FREE public JSON API (no API key / Apify needed).
 * Searches general Reddit + Pakistan-specific subreddits for hospital mentions.
 */

'use strict';

const axios = require('axios');

// ── Config ────────────────────────────────────────────────────────────────────

const REDDIT_BASE  = 'https://www.reddit.com';
const REQUEST_DELAY_MS = 2200; // respect Reddit's rate limit (~30 req/min)

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json',
};

// Pakistan city → subreddit mapping
const CITY_SUBREDDITS = {
  lahore:     'lahore',
  karachi:    'karachi',
  islamabad:  'islamabad',
  rawalpindi: 'islamabad',  // closest subreddit
  peshawar:   'pakistan',
  quetta:     'pakistan',
  multan:     'pakistan',
  faisalabad: 'pakistan',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Query Reddit search JSON API.
 * @param {string} query  - search string
 * @param {string|null} subreddit - restrict to subreddit if provided
 * @param {number} limit  - max posts to return
 */
async function queryReddit(query, subreddit = null, limit = 15) {
  try {
    const url    = subreddit
      ? `${REDDIT_BASE}/r/${subreddit}/search.json`
      : `${REDDIT_BASE}/search.json`;

    const params = {
      q:    query,
      type: 'link',
      sort: 'relevance',
      limit,
      ...(subreddit ? { restrict_sr: '1' } : {}),
    };

    const { data } = await axios.get(url, {
      headers: HEADERS,
      params,
      timeout: 12000,
    });

    const children = data?.data?.children || [];

    return children
      .filter((c) => c.kind === 't3')
      .map(({ data: p }) => ({
        title:     (p.title         || '').trim(),
        url:       `https://reddit.com${p.permalink}`,
        subreddit: p.subreddit      || '',
        score:     p.score          || 0,
        snippet:   (p.selftext      || '').slice(0, 600),
        postedAt:  new Date((p.created_utc || 0) * 1000),
        numComments: p.num_comments || 0,
      }));
  } catch (err) {
    // Silently swallow — network hiccups are expected
    console.warn(`[RedditScraper] query failed: "${query}" →`, err.message);
    return [];
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Scrape Reddit for all mentions of a hospital.
 * Runs several search queries across global Reddit + Pakistan subreddits.
 *
 * @param {string} hospitalName
 * @param {string} city
 * @returns {Promise<Array>} deduplicated list of relevant Reddit posts
 */
async function scrapeHospitalReviews(hospitalName, city) {
  const name    = hospitalName.trim();
  const cityLow = (city || '').toLowerCase();

  // Build search queries (most specific → general)
  const queries = [
    `"${name}" hospital Pakistan review`,
    `${name} ${city} hospital`,
    `${name} Pakistan`,
  ];

  // Decide which subreddits to search
  const subreddits = new Set(['pakistan']);
  if (CITY_SUBREDDITS[cityLow]) subreddits.add(CITY_SUBREDDITS[cityLow]);

  const seen    = new Set();
  const allPosts = [];

  const addPosts = (posts) => {
    for (const p of posts) {
      if (!seen.has(p.url) && p.title.length > 5) {
        seen.add(p.url);
        allPosts.push(p);
      }
    }
  };

  // Global Reddit search
  for (const q of queries) {
    addPosts(await queryReddit(q));
    await sleep(REQUEST_DELAY_MS);
  }

  // Pakistan subreddit search
  for (const sr of subreddits) {
    addPosts(await queryReddit(`${name} hospital`, sr));
    await sleep(REQUEST_DELAY_MS);
  }

  // Filter: post must mention at least the first word of hospital name
  // OR have a decent score, to avoid totally unrelated results
  const firstWord = name.split(/\s+/)[0].toLowerCase();
  const relevant  = allPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(firstWord) ||
      p.snippet.toLowerCase().includes(firstWord) ||
      p.score >= 5
  );

  // Sort by score descending and cap at 20
  relevant.sort((a, b) => b.score - a.score);
  return relevant.slice(0, 20);
}

module.exports = { scrapeHospitalReviews };
