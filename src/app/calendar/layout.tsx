import type { Metadata } from "next";
import {
  CALENDAR_DESCRIPTION,
  CALENDAR_OG_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  description: CALENDAR_DESCRIPTION,
  alternates: {
    canonical: "/calendar",
  },
  openGraph: {
    title: CALENDAR_OG_TITLE,
    description: CALENDAR_DESCRIPTION,
    url: "/calendar",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: CALENDAR_OG_TITLE,
    description: CALENDAR_DESCRIPTION,
  },
};

const calendarJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: CALENDAR_OG_TITLE,
  description: CALENDAR_DESCRIPTION,
  url: `${SITE_URL}/calendar`,
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
};

export default function CalendarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calendarJsonLd) }}
      />
      <noscript>
        <p>{CALENDAR_DESCRIPTION}</p>
      </noscript>
      {children}
    </>
  );
}
