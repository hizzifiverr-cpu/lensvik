export const metadata = {
  title: "Terms & Conditions | Lensvik",
  description: "Terms and Conditions for Lensvik.",
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-slate-50 pt-32 pb-16">
            <div className="max-w-3xl mx-auto px-4 md:px-6">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-100 border border-slate-100">
                    <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-slate-900 mb-8">Terms & Conditions</h1>
                    
                    <div className="prose prose-slate max-w-none text-sm md:text-base text-slate-600 space-y-6">
                        <p>Last updated: {new Date().toLocaleDateString()}</p>
                        
                        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Agreement to Terms</h2>
                        <p>By accessing or using our website, you agree to be bound by these Terms and Conditions. If you disagree with any part of the terms, you may not access the service.</p>

                        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Products and Prescriptions</h2>
                        <p>When ordering prescription eyewear, you confirm that the prescription details provided are accurate and were given to you by a registered medical practitioner or optometrist.</p>

                        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Returns and Refunds</h2>
                        <p>Please refer to our Return Policy page for detailed information about our returns and refund process.</p>

                        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Modifications</h2>
                        <p>We reserve the right to modify or replace these Terms at any time. Material changes will be communicated via our website.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
