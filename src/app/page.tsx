import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { ProductStrip } from "@/components/home/ProductStrip";
import { Testimonials } from "@/components/home/Testimonials";
import { LensShowcase } from "@/components/home/LensShowcase";
import { SectionReveal } from "@/components/home/SectionReveal";
import { getProductsServer } from "@/lib/server-api";

export default async function Home() {
  // Query the DB directly — fetch() with relative URLs won't work in Server Components
  const products = await getProductsServer('Active', 8);

  return (
    <main className="min-h-screen bg-background selection:bg-primary selection:text-white">
      <Navbar />
      <Hero />
      
      <SectionReveal>
        <CategoryGrid />
      </SectionReveal>

      <SectionReveal delay={0.1}>
        <ProductStrip
          title="New Arrivals"
          subtitle="Fresh from the workshop. Explore our newest materials and color palettes."
          products={products}
          viewAllHref="/collections/new-arrivals"
          loading={false}
          scrollable={true}
        />
      </SectionReveal>

      <SectionReveal delay={0.2}>
        <LensShowcase />
      </SectionReveal>

      <SectionReveal>
        <Testimonials />
      </SectionReveal>

      <Footer />
    </main>
  );
}
