import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const image = host ? `${protocol}://${host}/og.png` : undefined;
  return {
    title: { default:"SIMSIMENT — Make The Next Scene", template:"%s | SIMSIMENT" },
    description:"새로운 목소리와 오래 남을 장면을 만드는 독립 엔터테인먼트, simsiment.",
    icons: { icon:"/favicon.svg", shortcut:"/favicon.svg" },
    openGraph: {
      title:"SIMSIMENT — Make The Next Scene",
      description:"새로운 목소리와 오래 남을 장면을 만듭니다.",
      type:"website",
      images:image ? [{url:image,width:1200,height:630,alt:"SIMSIMENT — Make The Next Scene"}] : undefined,
    },
    twitter: {
      card:"summary_large_image",
      title:"SIMSIMENT — Make The Next Scene",
      description:"새로운 목소리와 오래 남을 장면을 만듭니다.",
      images:image ? [image] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" style={{ backgroundColor: "#f3f1eb", color: "#11110f", colorScheme: "light" }}>
      <body style={{ margin: 0, minHeight: "100vh", background: "#f3f1eb", color: "#11110f" }}>
        <noscript>
          <div className="boot-fallback">
            <div><h1>SIMSIMENT</h1><p>MAKE THE NEXT SCENE.</p></div>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
