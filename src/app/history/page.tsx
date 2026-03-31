"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code2, Calendar, ChevronRight } from 'lucide-react';
import { useUser } from "@clerk/nextjs";

export default function HistoryPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetch('/api/history')
        .then(res => res.json())
        .then(data => {
          setReviews(data);
          setLoading(false);
        })
        .catch(err => console.error("Failed to fetch history", err));
    }
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Loading your history...</div>;

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <ArrowLeft size={20} /> Back to Editor
          </Link>
          <h1 className="text-2xl font-bold text-white">Review History</h1>
        </header>

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-20 bg-[#1e293b] rounded-2xl border border-slate-700">
              <p className="text-slate-500">No reviews found yet. Go analyze some code!</p>
            </div>
          ) : (
            reviews.map((review: any) => (
              <div key={review.id} className="bg-[#1e293b] p-6 rounded-xl border border-slate-700 hover:border-indigo-500 transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono uppercase tracking-wider">
                      <Calendar size={14} />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                    <h3 className="text-lg font-semibold text-white capitalize">{review.language} Snippet</h3>
                    <p className="text-sm text-slate-400 line-clamp-1 italic">"{review.feedback.summary}"</p>
                  </div>
                  <div className="text-2xl font-black text-indigo-500 group-hover:scale-110 transition-transform">
                    {review.feedback.score}/10
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}