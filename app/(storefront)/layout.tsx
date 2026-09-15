import { StorefrontWrapper } from "@/components/storefront/StorefrontWrapper";
import { createPublicClient } from "@/lib/supabase/server";
import { getActiveAnnouncements } from "@/lib/actions/announcements";
import { AnnouncementManager } from "@/components/storefront/AnnouncementManager";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { PageTransition } from "@/components/providers/PageTransition";
import { ScrollToTop } from "@/components/storefront/ScrollToTop";
import { CurrencyProvider } from "@/lib/contexts/CurrencyContext";
import { FloatingCurrencySelector } from "@/components/storefront/FloatingCurrencySelector";
import { getStoreSettings } from "@/lib/actions/settings";
import { MaintenanceScreen } from "@/components/storefront/MaintenanceScreen";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings()

  // If Maintenance Mode is enabled, render the maintenance screen exclusively
  if (settings.maintenance_mode === 'true') {
    return <MaintenanceScreen settings={settings} />
  }

  const supabase = createPublicClient()
  const { data: categories } = await supabase.from('categories').select('*')
  
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
          <FloatingCurrencySelector />
        </StorefrontWrapper>
      </SmoothScrollProvider>
      </CurrencyProvider>
    </>
  );
}
