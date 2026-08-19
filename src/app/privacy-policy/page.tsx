export const metadata = {
  title: "Privacy Policy | Lensvik",
  description: "Privacy Policy for Lensvik.",
};

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-slate-50 pt-32 pb-16">
            <div className="max-w-3xl mx-auto px-4 md:px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-100 border border-slate-100">
                    <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-8">Privacy Policy</h1>
                    
                    <div className="prose prose-slate max-w-none text-sm md:text-base text-slate-600 space-y-6">
                        <p>Last updated: {new Date().toLocaleDateString()}</p>
                        
                        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us when you make a purchase, create an account, or contact us for support. This may include your name, email address, phone number, shipping address, and prescription details.</p>

                        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. How We Use Your Information</h2>
                        <p>We use the information we collect to process your orders, provide customer support, send you updates about your order, and improve our services.</p>

                        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Data Security</h2>
                        <p>We implement appropriate security measures to protect your personal information. However, please note that no method of transmission over the internet is 100% secure.</p>

                        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at Lensvikoptics@gmail.com.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
