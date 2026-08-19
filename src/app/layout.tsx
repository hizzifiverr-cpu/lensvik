import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "LENSVIK | Premium Eyewear & Virtual Try-On",
  description: "Experience the future of eyewear with our AI-powered virtual try-on and size-finding platform.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className="font-sans antialiased"
      >
        <CustomerProvider>
          <CartProvider>
            {children}
            <Toaster position="top-right" />
          </CartProvider>
        </CustomerProvider>
      </body>
    </html>
  );
}
