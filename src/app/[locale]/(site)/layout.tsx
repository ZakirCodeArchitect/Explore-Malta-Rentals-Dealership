import { SiteNavbar } from "@/components/site-navbar";
import { Footer } from "@/features/home/components/footer";
import { WhatsAppFloatingButton } from "@/features/home/components/whatsapp-floating-button";

type SiteLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <>
      <SiteNavbar />
      {children}
      <Footer />
      <WhatsAppFloatingButton />
    </>
  );
}
