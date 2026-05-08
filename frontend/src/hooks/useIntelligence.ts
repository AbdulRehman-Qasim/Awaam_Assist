import { useState, useEffect, useMemo, useRef } from 'react';
import { RecommendationEngine } from '@/intelligence/engine/recommendationEngine';

export const useIntelligence = (userProfile: any, userBasics: any, profileVersion: number = 0) => {
  const [loading, setLoading] = useState(true);
  const [fetchedData, setFetchedData] = useState<{unis: any[], schemes: any[], hosps: any[]}>({ unis: [], schemes: [], hosps: [] });
  const [error, setError] = useState<string | null>(null);
  const renderCountRef = useRef(0);

  // Increment render count for diagnostics
  useEffect(() => { renderCountRef.current++; });

  useEffect(() => {
    const abortController = new AbortController();

    const fetchAllData = async () => {
      if (!userProfile) {
        setLoading(false);
        return;
      }

      setLoading(true);
      // HARD WIPE: clear all stale data before fetching fresh results
      setFetchedData({ unis: [], schemes: [], hosps: [] });

      try {
        const token = userBasics?.token;
        const headers = {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        };
        const apiUrl = import.meta.env.VITE_API_URL;
        // Cache buster tied to profileVersion ensures browser never serves stale responses
        const cacheBuster = `v=${profileVersion}&t=${Date.now()}`;

        console.info(`[Intelligence Engine] Re-fetch triggered. Profile version: ${profileVersion}`);

        const [uniRes, schemeRes, hospRes] = await Promise.all([
          fetch(`${apiUrl}/api/universities?${cacheBuster}`, { headers, signal: abortController.signal }),
          fetch(`${apiUrl}/api/schemes?${cacheBuster}`, { headers, signal: abortController.signal }),
          fetch(`${apiUrl}/api/hospitals?${cacheBuster}`, { headers, signal: abortController.signal })
        ]);

        const [unis, schemes, hosps] = await Promise.all([
          uniRes.ok ? uniRes.json() : { data: [] },
          schemeRes.ok ? schemeRes.json() : { data: [] },
          hospRes.ok ? hospRes.json() : { data: [] }
        ]);

        setFetchedData({
          unis: Array.isArray(unis) ? unis : (unis.data || []),
          schemes: Array.isArray(schemes) ? schemes : (schemes.data || []),
          hosps: Array.isArray(hosps) ? hosps : (hosps.data || [])
        });
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.error("Intelligence Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    return () => abortController.abort();
  // profileVersion is the SINGLE reliable trigger for full recompute
  // userBasics?.token handles auth changes
  }, [profileVersion, userBasics?.token, !!userProfile]);

  // Re-score whenever raw data OR the profile object changes
  // useMemo here uses the full profile object — any field change in profile triggers this
  const results = useMemo(() => {
    if (!userProfile || loading) return null;
    if (fetchedData.unis.length === 0 && fetchedData.schemes.length === 0 && fetchedData.hosps.length === 0) return null;

    const context = RecommendationEngine.mapRawProfile(userProfile, userBasics);

    console.info(`[Intelligence Engine] Scoring with city="${context.location?.city}", degree="${context.education?.degree}"`);

    return RecommendationEngine.generateRecommendations({
      user: context,
      universities: fetchedData.unis,
      schemes: fetchedData.schemes,
      hospitals: fetchedData.hosps,
      renderCount: renderCountRef.current
    });
  // fetchedData reference changes every fetch (new array objects), profile changes after fetchProfile()
  }, [fetchedData, userProfile, userBasics, loading]);

  return {
    loading,
    data: results,
    error,
    diagnostics: results?.diagnostics,
    confidence: results?.overallConfidence
  };
};
