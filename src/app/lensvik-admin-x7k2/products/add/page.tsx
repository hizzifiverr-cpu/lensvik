'use client';

import { useState, useRef } from 'react';
import { Upload, X, Plus, Sparkles, Eye, Save, ArrowLeft, Glasses, Tag, Package, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { compressImage } from '@/lib/compressImage';

const CATEGORIES = ['Sunglasses', 'Eyeglasses', 'Prescription Glasses', 'Blue Light Glasses', 'Contact Lenses', 'Accessories'];
const FRAME_COLORS = ['Black', 'Matte Black', 'Tortoise', 'Gold', 'Silver', 'Grey', 'Gunmetal', 'Rose Gold', 'Brown', 'Navy', 'Clear', 'Red', 'Pink', 'Maroon', 'Blue', 'Purple', 'Green', 'Marble', 'Orange', 'Yellow', 'White', 'Two Tone or Multi'];
const LENS_TYPES = ['Clear', 'UV400', 'Polarized', 'Anti-Reflective', 'Blue Light Filter', 'Photochromic', 'Mirrored'];
const FRAME_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const MATERIALS = ['Plastic', 'Acetate', 'Mix Material', 'Metal', 'TR', 'Titanium'];
const SHAPES = ['Cat Eye', 'Wayfarer', 'Square', 'Aviator', 'Oval', 'Sports', 'Rectangle', 'Hexagonal', 'Round', 'Clubmaster'];
const RIM_TYPES = ['Full Rim', 'Half Rim', 'Rimless'];

export default function AddProductPage() {
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [refDragging, setRefDragging] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedLensTypes, setSelectedLensTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [tab, setTab] = useState<'basic' | 'variants' | 'eyewear' | 'seo'>('basic');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [form, setForm] = useState({
    name: '', category: '', price: '', comparePrice: '', sku: '', barcode: '',
    gender: 'Unisex', material: '', shape: '', rim: '', size: '', status: 'Draft', collectionName: '',
    pdMin: '', pdMax: '', bridgeWidth: '', templeLength: '', lensWidth: '', frameHeight: '',
    metaTitle: '', metaDesc: '', tags: '', referenceImage: '', lensSubtype: '',
    stock: '',
  });
  const [options, setOptions] = useState({
    prescriptionCompatible: true,
    blueLightFilter: true,
    virtualTryOn: false,
    lensCustomization: true,
  });

  const router = useRouter();

  const handlePublish = async (statusOverride?: string) => {
    if (!form.name || !form.category || !form.price) {
      toast.error('Please fill in all required fields (Name, Category, Price)');
      return;
    }

    // Helper: convert empty string to undefined for optional numeric fields
    const numOrUndef = (v: string) => v === '' ? undefined : Number(v);

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        comparePrice: numOrUndef(form.comparePrice),
        sku: form.sku || undefined,
        barcode: form.barcode || undefined,
        gender: form.gender,
        material: form.material || undefined,
        shape: form.shape || undefined,
        rim: form.rim || undefined,
        size: form.size || undefined,
        referenceImage: form.referenceImage || undefined,
        videoUrl: videoUrl || undefined,
        videoData: videoFile || undefined,
        subcategory: form.lensSubtype || undefined,
        status: statusOverride || form.status,
        collectionName: form.collectionName || undefined,
        description,
        images,
        image: images[1] || images[0] || undefined,
        vtoImage: images[0] || images[1] || undefined,
        tags: (form.tags || '').split(',').map(t => t.trim()).filter(Boolean),
        measurements: {
          pdMin: numOrUndef(form.pdMin),
          pdMax: numOrUndef(form.pdMax),
          lensWidth: numOrUndef(form.lensWidth),
          frameHeight: numOrUndef(form.frameHeight),
          bridgeWidth: numOrUndef(form.bridgeWidth),
          templeLength: numOrUndef(form.templeLength),
        },
        options,
        seo: {
          metaTitle: form.metaTitle || undefined,
          metaDesc: form.metaDesc || undefined,
        },
        // Generate variants from selected colors/sizes
        variants: selectedColors.flatMap(color =>
          (selectedSizes.length > 0 ? selectedSizes : ['M']).map(size => ({
            color,
            size,
            lensType: selectedLensTypes[0] || 'Clear',
            price: Number(form.price),
            sku: form.sku || undefined,
            stock: Number(form.stock || 100)
          }))
        )
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      toast.success(statusOverride === 'Active' ? 'Product published successfully!' : 'Product saved as draft!');
      router.push('/lensvik-admin-x7k2/products');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const refFileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setImages(prev => [...prev, compressed]);
      };
      reader.readAsDataURL(f);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setImages(prev => [...prev, compressed]);
      };
      reader.readAsDataURL(f);
    }
  };

  const handleRefDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setRefDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setForm({ ...form, referenceImage: compressed });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setForm({ ...form, referenceImage: compressed });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiDescription = async () => {
    if (!form.name) return;
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setDescription(`Experience luxury vision with the ${form.name}. Crafted with precision engineering and premium ${form.material || 'acetate'} materials, these frames offer the perfect fusion of style and functionality. Designed for ${form.gender?.toLowerCase() || 'everyone'}, they feature UV400 protection, lightweight construction, and timeless aesthetics that complement any lifestyle. Whether you're in a boardroom or on the beach, these frames deliver unmatched comfort and sophistication. Available in multiple sizes and lens options to suit your personal vision needs.`);
    setAiLoading(false);
  };

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Package },
    { id: 'variants', label: 'Variants', icon: Tag },
    { id: 'eyewear', label: 'Eyewear Specs', icon: Glasses },
    { id: 'seo', label: 'SEO', icon: Globe },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/lensvik-admin-x7k2/products" className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Add Product</h1>
            <p className="text-slate-500 text-xs font-medium">Create a new eyewear product listing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl px-4 py-2.5 hover:bg-slate-50 transition-all shadow-sm">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button
            onClick={() => handlePublish('Active')}
            disabled={loading}
            className="flex items-center gap-2 text-xs font-bold bg-blue-600 text-white rounded-xl px-5 py-2.5 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : <><Save className="w-4 h-4" /> Publish</>}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-sm">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl transition-all ${tab === t.id ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline uppercase tracking-tight">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-5">
          {tab === 'basic' && (
            <>
              {/* Image uploader */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-5 border-b border-slate-50 pb-4 uppercase tracking-tight">Product Images</h3>
                <div
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragging ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'}`}
                >
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 font-bold tracking-tight">Drop images here or <span className="text-blue-600">browse</span></p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">PNG, JPG, WebP up to 10MB · You can upload up to 10+ images</p>
                  <p className="text-[10px] text-purple-600/70 mt-2 font-bold uppercase tracking-tight">1st image = Try-On · 2nd image = Thumbnail (catalog/listing)</p>
                  <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
                {images.length > 0 && (
                  <div className="flex gap-4 mt-6 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 group shadow-sm">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={(e) => { e.stopPropagation(); setImages(images.filter((_, j) => j !== i)); }} className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {i === 0 && <span className="absolute bottom-2 left-2 text-[8px] bg-purple-600 text-white rounded-md px-2 py-0.5 font-bold uppercase">Try-On</span>}
                        {i === 1 && <span className="absolute bottom-2 left-2 text-[8px] bg-blue-600 text-white rounded-md px-2 py-0.5 font-bold uppercase">Thumbnail</span>}
                      </div>
                    ))}
                    <button onClick={() => fileRef.current?.click()} className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/30 flex items-center justify-center text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all shadow-sm">
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>

              {/* Basic fields */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-50 pb-4 uppercase tracking-tight">Product Details</h3>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Product Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ray-Ban Aviator Classic" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all font-medium" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                    <button onClick={handleAiDescription} disabled={!form.name || aiLoading} className="flex items-center gap-1.5 text-[10px] text-purple-600 bg-purple-50 border border-purple-100 rounded-lg px-2.5 py-1.5 hover:bg-purple-100 transition-all disabled:opacity-40 font-bold uppercase tracking-tight">
                      {aiLoading ? <div className="w-3 h-3 border-2 border-purple-400 border-t-purple-600 rounded-full animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      AI Generate
                    </button>
                  </div>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="Describe the product in detail..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all resize-none font-medium leading-relaxed" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Category *</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-blue-500/50 transition-all appearance-none font-medium">
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Gender</label>
                    <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-blue-500/50 transition-all appearance-none font-medium">
                      {['Unisex', 'Male', 'Female', 'Kids'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Price (PKR) *</label>
                    <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Compare Price</label>
                    <input value={form.comparePrice} onChange={e => setForm({ ...form, comparePrice: e.target.value })} type="number" placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">SKU</label>
                    <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="Auto-generated" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Barcode</label>
                    <input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} placeholder="ISBN, UPC, GTIN..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all font-mono font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Frame Shape</label>
                    <select value={form.shape} onChange={e => setForm({ ...form, shape: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-blue-500/50 transition-all appearance-none font-medium">
                      <option value="">Select shape</option>
                      {SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Rim Type</label>
                    <select value={form.rim} onChange={e => setForm({ ...form, rim: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-blue-500/50 transition-all appearance-none font-medium">
                      <option value="">Select rim type</option>
                      {RIM_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Size</label>
                    <select value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-blue-500/50 transition-all appearance-none font-medium">
                      <option value="">Select size</option>
                      {FRAME_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Frame Material</label>
                    <select value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-blue-500/50 transition-all appearance-none font-medium">
                      <option value="">Select material</option>
                      {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tags</label>
                  <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="sunglasses, polarized, summer (comma separated)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all font-medium" />
                </div>
                {form.category === 'Contact Lenses' && (
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Lens Type</label>
                        <select value={form.lensSubtype} onChange={e => setForm({ ...form, lensSubtype: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-blue-500/50 transition-all appearance-none font-medium">
                            <option value="">Select lens type</option>
                            <option value="Transparent Lenses">Transparent Lenses</option>
                            <option value="Colored Lenses">Colored Lenses</option>
                        </select>
                    </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Reference Image (Dimensions Diagram)</label>
                  <div onDrop={handleRefDrop} onDragOver={e => { e.preventDefault(); setRefDragging(true); }} onDragLeave={() => setRefDragging(false)} onClick={() => refFileRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${refDragging ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'}`}>
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs text-slate-600 font-bold">Drop reference image or browse</p>
                    <p className="text-[10px] text-slate-400 mt-1">PNG with dimension annotations</p>
                    <input ref={refFileRef} type="file" accept="image/*" className="hidden" onChange={handleRefFileChange} />
                  </div>
                  {form.referenceImage && (
                    <div className="mt-4 relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
                      <img src={form.referenceImage} alt="Reference" className="w-full h-full object-contain bg-slate-50" />
                      <button onClick={(e) => { e.stopPropagation(); setForm({ ...form, referenceImage: '' }); }} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600">×</button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Upload Product Video</label>
                  <div onDrop={(e) => { e.preventDefault(); setDragging(false); const file = e.dataTransfer.files[0]; if (file && file.type.startsWith('video/')) { const reader = new FileReader(); reader.onloadend = () => { setVideoFile(reader.result as string); setVideoUrl(''); }; reader.readAsDataURL(file); } }} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onClick={() => document.getElementById('video-upload-add')?.click()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragging ? 'border-purple-600 bg-purple-50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'}`}>
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 font-bold tracking-tight">Drop video file here or <span className="text-purple-600">browse</span></p>
                    <p className="text-xs text-slate-400 mt-1 font-medium">MP4, WebM up to 50MB</p>
                    <input id="video-upload-add" type="file" accept="video/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setVideoFile(reader.result as string); setVideoUrl(''); }; reader.readAsDataURL(file); } }} />
                  </div>
                  {(videoFile || videoUrl) && (
                    <div className="mt-4 relative">
                      <video src={videoFile || videoUrl} controls className="w-full max-w-md rounded-xl border border-slate-200" />
                      <button onClick={(e) => { e.stopPropagation(); setVideoFile(null); setVideoUrl(''); }} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold hover:bg-red-600 shadow-lg">×</button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {tab === 'variants' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-8 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-50 pb-4 uppercase tracking-tight">Product Variants</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Frame Colors</label>
                <div className="flex flex-wrap gap-3">
                  {FRAME_COLORS.map(c => (
                    <button key={c} onClick={() => toggle(selectedColors, setSelectedColors, c)} className={`text-xs px-4 py-2.5 rounded-xl border transition-all font-bold ${selectedColors.includes(c) ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 bg-white'}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Lens Types</label>
                <div className="flex flex-wrap gap-3">
                  {LENS_TYPES.map(l => (
                    <button key={l} onClick={() => toggle(selectedLensTypes, setSelectedLensTypes, l)} className={`text-xs px-4 py-2.5 rounded-xl border transition-all font-bold ${selectedLensTypes.includes(l) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 bg-white'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Frame Sizes</label>
                <div className="flex flex-wrap gap-4">
                  {FRAME_SIZES.map(s => (
                    <button key={s} onClick={() => toggle(selectedSizes, setSelectedSizes, s)} className={`w-14 h-14 rounded-2xl border text-sm font-bold transition-all ${selectedSizes.includes(s) ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10' : 'border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 bg-white'}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Frame Material</label>
                <select value={form.material} onChange={e => setForm({ ...form, material: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-blue-500/50 transition-all appearance-none font-medium">
                  <option value="">Select material</option>
                  {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          )}

          {tab === 'eyewear' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-50 pb-4 uppercase tracking-tight">Eyewear-Specific Specs</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">PD Min (mm)</label>
                  <input value={form.pdMin} onChange={e => setForm({ ...form, pdMin: e.target.value })} placeholder="58" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">PD Max (mm)</label>
                  <input value={form.pdMax} onChange={e => setForm({ ...form, pdMax: e.target.value })} placeholder="72" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Lens Width (mm)</label>
                  <input value={form.lensWidth} onChange={e => setForm({ ...form, lensWidth: e.target.value })} placeholder="52" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Frame Height (mm)</label>
                  <input value={form.frameHeight} onChange={e => setForm({ ...form, frameHeight: e.target.value })} placeholder="40" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Bridge Width (mm)</label>
                  <input value={form.bridgeWidth} onChange={e => setForm({ ...form, bridgeWidth: e.target.value })} placeholder="18" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Temple Length (mm)</label>
                  <input value={form.templeLength} onChange={e => setForm({ ...form, templeLength: e.target.value })} placeholder="140" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all font-bold" />
                </div>
              </div>
              {/* Checkboxes */}
              <div className="pt-4 space-y-4">
                {[
                  { id: 'prescriptionCompatible', label: 'Prescription Compatible' },
                  { id: 'blueLightFilter', label: 'Blue Light Filter Available' },
                  { id: 'virtualTryOn', label: 'Virtual Try-On Ready' },
                  { id: 'lensCustomization', label: 'Lens Customization Available' },
                ].map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={(options as any)[opt.id]}
                      onChange={e => setOptions({ ...options, [opt.id]: e.target.checked })}
                      className="w-5 h-5 rounded-lg border-slate-300 bg-slate-50 accent-blue-600 cursor-pointer"
                    />
                    <span className="text-sm text-slate-600 font-bold group-hover:text-slate-900 transition-colors uppercase tracking-tight">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {tab === 'seo' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-50 pb-4 uppercase tracking-tight">SEO Settings</h3>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Meta Title</label>
                <input value={form.metaTitle} onChange={e => setForm({ ...form, metaTitle: e.target.value })} placeholder="Product name | Lensvik" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all font-medium" />
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight">{form.metaTitle.length}/60 characters</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Meta Description</label>
                <textarea value={form.metaDesc} onChange={e => setForm({ ...form, metaDesc: e.target.value })} rows={3} placeholder="Brief product description for search engines..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500/50 transition-all resize-none font-medium leading-relaxed" />
                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight">{form.metaDesc.length}/160 characters</p>
              </div>
              {/* Preview */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-inner">
                <p className="text-[10px] text-slate-400 mb-3 uppercase tracking-widest font-bold">Search Preview</p>
                <p className="text-sm text-blue-600 font-bold leading-tight underline underline-offset-2">{form.metaTitle || 'Product Title | Lensvik'}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1">lensvik.com/products/{form.name?.toLowerCase().replace(/\s+/g, '-') || 'product-slug'}</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">{form.metaDesc || 'Your meta description will appear here...'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Publish Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 outline-none appearance-none font-bold">
              <option value="Draft">Draft</option>
              <option value="Active">Active (Published)</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
          {/* Collection */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Collection</label>
            <select value={form.collectionName} onChange={e => setForm({ ...form, collectionName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-900 outline-none appearance-none font-bold">
              <option value="">None</option>
              <option value="bestsellers">Best Sellers</option>
              <option value="new-arrivals">New Arrivals</option>
              <option value="summer-2025">Summer 2025</option>
              <option value="luxury">Luxury Edit</option>
            </select>
          </div>
          {/* Selected variants summary */}
          {(selectedColors.length > 0 || selectedSizes.length > 0) && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Variant Summary</p>
              <div className="space-y-3">
                {selectedColors.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Colors</p>
                    <p className="text-xs text-slate-900 font-bold">{selectedColors.join(', ')}</p>
                  </div>
                )}
                {selectedSizes.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Sizes</p>
                    <p className="text-xs text-slate-900 font-bold">{selectedSizes.join(', ')}</p>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-50">
                  <p className="text-xs text-blue-600 font-bold">
                    {selectedColors.length * (selectedSizes.length || 1)} total variants generated
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Save buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handlePublish('Active')}
              disabled={loading}
              className="w-full bg-blue-600 text-white text-sm font-bold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 uppercase tracking-tight disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Publishing...' : 'Publish Product'}
            </button>
            <button
              onClick={() => handlePublish('Draft')}
              disabled={loading}
              className="w-full bg-white border border-slate-200 text-slate-600 text-sm font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm uppercase tracking-tight disabled:opacity-50"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
