import Script from 'next/script';
import type { PublicTrackingConfig } from '@/lib/siteSettings';

function gtmBootstrapScript(containerId: string): string {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${containerId}');`;
}

/** GTM noscript + GA + AdSense — yalnızca body içinde (head hydration hatası önlenir) */
export function SiteTrackingScripts({ tracking }: { tracking: PublicTrackingConfig }) {
  return (
    <>
      {tracking.gtmEnabled && tracking.gtmContainerId ? (
        <>
          <Script
            id="google-tag-manager"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: gtmBootstrapScript(tracking.gtmContainerId) }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${tracking.gtmContainerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}
      {tracking.gaEnabled && tracking.gaMeasurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${tracking.gaMeasurementId}`}
            strategy="lazyOnload"
          />
          <Script id="google-analytics" strategy="lazyOnload">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${tracking.gaMeasurementId}');
          `}
          </Script>
        </>
      ) : null}
      {tracking.adsenseEnabled && tracking.adsenseClientId ? (
        <Script
          id="google-adsense"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${tracking.adsenseClientId}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      ) : null}
    </>
  );
}
