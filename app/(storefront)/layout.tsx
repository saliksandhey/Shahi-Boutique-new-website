import { StorefrontWrapper } from "@/components/storefront/StorefrontWrapper";
import { createPublicClient } from "@/lib/supabase/server";
import { getActiveAnnouncements } from "@/lib/actions/announcements";
import { AnnouncementManager } from "@/components/storefront/AnnouncementManager";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { PageTransition } from "@/components/providers/PageTransition";
import { ScrollToTop } from "@/components/storefront/ScrollToTop";
import { CurrencyProvider } from "@/lib/contexts/CurrencyContext";

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createPublicClient()
  const { data: categories } = await supabase.from('categories').select('*')
  
  // Need to use the secure admin client or bypass RLS for reading announcements if RLS is strict. 
  // Wait, I created a public read policy on announcements! So this will work fine.
  const announcements = await getActiveAnnouncements()

  return (
    <>
      <AnnouncementManager announcements={announcements || []} />
      <CurrencyProvider>
      <SmoothScrollProvider>
        <StorefrontWrapper categories={categories || []}>
          <PageTransition>
            {children}
          </PageTransition>
          <ScrollToTop />
        </StorefrontWrapper>
      </SmoothScrollProvider>
      </CurrencyProvider>
    </>
  );
}

