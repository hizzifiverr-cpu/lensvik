'use client';

import { useState } from 'react';
import { Sparkles, Wand2, Copy, Check, RotateCw, Type, Search, Tag, MessageSquare, Image as ImageIcon } from 'lucide-react';

export default function AILabPage() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Sunglasses');
  const [material, setMaterial] = useState('Acetate');
  const [style, setStyle] = useState('Classic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    description: '',
    seoTitle: '',
    seoKeywords: '',
    socialCaption: ''
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedContent({
        description: `Experience timeless elegance with the ${productName || 'New Frame'}. Crafted from premium ${material.toLowerCase()} and featuring a ${style.toLowerCase()} silhouette, these ${category.toLowerCase()} are designed for both comfort and high-fashion impact. The lightweight construction ensures all-day wearability, while the precision-engineered hinges provide durability. Perfect for any face shape, the ${productName || 'New Frame'} is a must-have addition to your eyewear collection.`,
        seoTitle: `${productName || 'Eyewear'} | Premium ${category} | Lensvik Pakistan`,
        seoKeywords: `${category.toLowerCase()}, ${material.toLowerCase()} frames, ${style.toLowerCase()} glasses, lensvik, premium eyewear pakistan`,
        socialCaption: `Elevate your look with the all-new ${productName || 'Collection'}. ✨\n\nClassic design meets modern craftsmanship. Whether you're in a meeting or out in the sun, our new ${category.toLowerCase()} have you covered.\n\nShop the ${style.toLowerCase()} vibes now at Lensvik.com 👓\n\n#Lensvik #EyewearFashion #Sunglasses #Style #Pakistan`
      });
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-screen-2xl mx-auto pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" /> AI Content Lab
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Generate premium product descriptions and SEO metadata using AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-4">Product Context</h3>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Product Name</label>
              <input 
                value={productName} 
                onChange={e => setProductName(e.target.value)}
                placeholder="e.g. Ray-Ban Aviator Classic" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                <select 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 outline-none appearance-none"
                >
                  <option>Sunglasses</option>
                  <option>Eyeglasses</option>
                  <option>Blue Light</option>
                  <option>Luxury</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Material</label>
                <select 
                  value={material} 
                  onChange={e => setMaterial(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 outline-none appearance-none"
                >
                  <option>Acetate</option>
                  <option>Titanium</option>
                  <option>Metal</option>
                  <option>TR90</option>
                  <option>Carbon Fiber</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Style Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {['Classic', 'Modern', 'Minimalist', 'Luxury', 'Sporty', 'Vintage'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setStyle(s)}
                    className={`text-xs py-2 rounded-xl border transition-all font-bold ${style === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg ${isGenerating ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-600/25 active:scale-[0.98]'}`}
            >
              {isGenerating ? <RotateCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isGenerating ? 'Generating Content...' : 'Generate with AI'}
            </button>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 shadow-sm">
            <h4 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-2">Pro Tip</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
              Include specific features like <span className="text-indigo-700">"Polarized Lenses"</span> or <span className="text-indigo-700">"Adjustable Nose Pads"</span> in the product name for more accurate descriptions.
            </p>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2 space-y-6">
          {!generatedContent.description && !isGenerating ? (
            <div className="h-full min-h-[400px] bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-12 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Sparkles className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-bold mb-2">Ready to create magic?</h3>
              <p className="text-slate-500 text-sm max-w-xs font-medium">Fill in the product context on the left and click generate to see AI in action.</p>
            </div>
          ) : (
            <div className={`space-y-6 transition-all duration-500 ${isGenerating ? 'opacity-40 blur-[2px] pointer-events-none' : 'opacity-100'}`}>
              
              {/* Product Description */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden group shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Product Description</h3>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(generatedContent.description, 'desc')}
                    className="text-[10px] font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                  >
                    {copiedField === 'desc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'desc' ? 'Copied' : 'Copy Text'}
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium italic">&ldquo;{generatedContent.description}&rdquo;</p>
                </div>
              </div>

              {/* SEO Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-emerald-600" />
                      <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">SEO Title</h3>
                    </div>
                    <button onClick={() => copyToClipboard(generatedContent.seoTitle, 'title')} className="text-slate-400 hover:text-blue-600 transition-all">
                      {copiedField === 'title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-blue-600 font-bold">{generatedContent.seoTitle}</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest">SEO Keywords</h3>
                    </div>
                    <button onClick={() => copyToClipboard(generatedContent.seoKeywords, 'keywords')} className="text-slate-400 hover:text-blue-600 transition-all">
                      {copiedField === 'keywords' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-slate-500 italic font-medium">{generatedContent.seoKeywords}</p>
                  </div>
                </div>
              </div>

              {/* Social Media Content */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden group shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-pink-600" />
                    <h3 className="text-sm font-bold text-slate-900">Social Media Caption</h3>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(generatedContent.socialCaption, 'social')}
                    className="text-[10px] font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                  >
                    {copiedField === 'social' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'social' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-6 bg-slate-50">
                  <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed font-medium">
                    {generatedContent.socialCaption}
                  </pre>
                </div>
              </div>

              {/* VTO Visualization Suggestion */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 mb-1">VTO Suggestion</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Based on the <span className="text-emerald-700 font-bold">{style.toLowerCase()}</span> style and <span className="text-emerald-700 font-bold">{material.toLowerCase()}</span> material, we recommend using the <span className="underline decoration-emerald-300">"Luxury High-Gloss"</span> lighting model for the Virtual Try-On configuration to best showcase frame reflections.
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
