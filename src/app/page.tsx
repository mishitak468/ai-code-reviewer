"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { History, Zap, Code2, Copy, Check } from 'lucide-react';
import { useUser, UserButton, useClerk } from "@clerk/nextjs";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReview = async () => {
    setLoading(true);
    setResult(null); // Clear previous result
    try {
      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Review failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Code2 size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AI Code Reviewer</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/history" className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition border border-slate-700">
              <History size={18} /> View History
            </Link>

            {isLoaded && (
              <>
                {!isSignedIn ? (
                  <button
                    onClick={() => openSignIn()}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition shadow-lg shadow-indigo-600/20"
                  >
                    Sign In
                  </button>
                ) : (
                  <div className="scale-110"><UserButton /></div>
                )}
              </>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition cursor-pointer"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
                <option value="cpp">C++</option>
              </select>
              <span className="text-xs text-slate-500">Powered by Llama 3.3 & Groq</span>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code snippet here..."
              className="w-full h-[550px] bg-[#1e293b] text-indigo-300 font-mono p-6 rounded-2xl border border-slate-700 focus:outline-none focus:border-indigo-500 transition shadow-inner resize-none scrollbar-thin scrollbar-thumb-slate-700"
            />

            <button
              onClick={handleReview}
              disabled={loading || !code || !isSignedIn}
              className={`w-full py-4 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-xl ${!isSignedIn
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white active:scale-[0.98]"
                }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>{!isSignedIn ? "Sign in to Analyze" : <><Zap size={18} /> Analyze Code</>}</>
              )}
            </button>
          </section>

          {/* Results Section */}
          <section className="bg-[#1e293b] rounded-2xl border border-slate-700 p-8 min-h-[625px] shadow-2xl overflow-hidden">
            {!result ? (
              <div className="h-[550px] flex flex-col items-center justify-center text-slate-500 space-y-4">
                <div className="p-4 bg-slate-800 rounded-full animate-pulse">
                  <Code2 size={48} className="opacity-40" />
                </div>
                <p className="text-center max-w-[200px]">Paste some code and run an analysis to see feedback.</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-b border-slate-700 pb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Analysis Result</h2>
                    <p className="text-sm text-slate-400 mt-1">{language.toUpperCase()} Analysis</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-4xl font-black text-indigo-400 tracking-tighter">{result.score}/10</div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Health Score</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-indigo-400 font-semibold mb-3 text-xs uppercase tracking-[0.2em]">Summary</h3>
                  <p className="text-slate-300 italic border-l-4 border-indigo-600/50 pl-4 leading-relaxed">
                    "{result.summary}"
                  </p>
                </div>

                <div>
                  <h3 className="text-red-400 font-semibold mb-4 text-xs uppercase tracking-[0.2em]">Key Issues</h3>
                  <ul className="grid gap-3">
                    {result.issues?.map((issue: string, i: number) => (
                      <li key={i} className="bg-red-400/5 border border-red-400/10 p-3 rounded-lg text-slate-300 text-sm flex gap-3">
                        <span className="text-red-400 font-bold">•</span>
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>

                {result.fixedCode && (
                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-emerald-400 font-semibold text-xs uppercase tracking-[0.2em]">Suggested Fix</h3>
                      <button
                        onClick={() => copyToClipboard(result.fixedCode)}
                        className="flex items-center gap-2 text-[10px] bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md transition border border-slate-700"
                      >
                        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copied ? "COPIED" : "COPY CODE"}
                      </button>
                    </div>
                    { }
                    <div className="relative group">
                      <pre className="bg-[#0f172a] p-6 rounded-xl text-[13px] leading-relaxed font-mono text-emerald-400/90 border border-slate-800 shadow-inner min-h-[300px] max-h-[600px] overflow-auto">
                        <code className="block whitespace-pre-wrap break-words text-left">
                          {result.fixedCode}
                        </code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}