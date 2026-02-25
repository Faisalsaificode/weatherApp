'use client';

import { useState, useEffect } from 'react';
import { aiApi } from '@/lib/api';

interface AIInsightsPanelProps {
  selectedCity: {
    city: { id: string; name: string; country: string };
    weather: any;
  } | null;
}

const PRESET_QUESTIONS = [
  "What should I wear today?",
  "Is it good weather for outdoor activities?",
  "What's the weather trend this week?",
  "Should I carry an umbrella?",
];

export default function AIInsightsPanel({ selectedCity }: AIInsightsPanelProps) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'ai' | 'rule-based'>('rule-based');
  const [customQuestion, setCustomQuestion] = useState('');
  const [asked, setAsked] = useState(false);

  useEffect(() => {
    if (selectedCity && !asked) {
      fetchInsight(selectedCity.city.id);
    }
    if (!selectedCity) {
      setInsight('');
      setAsked(false);
    }
  }, [selectedCity]);

  const fetchInsight = async (cityId: string, question?: string) => {
    setLoading(true);
    try {
      const res = await aiApi.getInsights(cityId, question);
      setInsight(res.data.insight);
      setSource(res.data.source);
      setAsked(true);
    } catch {
      setInsight('Unable to generate insights at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (q: string) => {
    if (!selectedCity || !q.trim()) return;
    setCustomQuestion('');
    await fetchInsight(selectedCity.city.id, q);
  };

  return (
    <div className="glass-card p-6 h-fit sticky top-24">
   
      <div className="flex items-center gap-2 mb-5">
        <span className="text-2xl">🤖</span>
        <div>
          <h2 className="text-white font-bold">AI Weather Assistant</h2>
          <p className="text-slate-400 text-xs">Powered by intelligent insights</p>
        </div>
      </div>

      {!selectedCity ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">👆</div>
          <p className="text-slate-400 text-sm">Select a city card to get AI-powered weather insights and recommendations</p>
        </div>
      ) : (
        <>
       
          <div className="bg-white/5 rounded-xl px-3 py-2 mb-4 border border-white/10">
            <p className="text-xs text-slate-400">Analyzing</p>
            <p className="text-white font-medium">📍 {selectedCity.city.name}, {selectedCity.city.country}</p>
          </div>

          <div className="min-h-28 mb-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-8 h-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-xs animate-pulse">Generating insights...</p>
              </div>
            ) : insight ? (
              <div className="space-y-2">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-slate-200 text-sm leading-relaxed">{insight}</p>
                </div>
                <p className="text-xs text-slate-500 text-right">
                  {source === 'ai' ? '✨ OpenAI' : '⚙️ Rule-based'}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Quick questions</p>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleAskQuestion(q)}
                  disabled={loading}
                  className="text-left text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-2 rounded-lg border border-white/5 hover:border-white/20 transition-all disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion(customQuestion)}
              placeholder="Ask anything..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={loading}
            />
            <button
              onClick={() => handleAskQuestion(customQuestion)}
              disabled={loading || !customQuestion.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white px-3 py-2 rounded-xl transition-all text-sm"
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
