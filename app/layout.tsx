import React from "react";
import "@/src/styles/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <meta
        name="description"
        content="An example site to show how to use data supplied to a static website via cloudflare page functions."
      />
      <title>Cloudflare page data hook</title>
      <body className="app min-h-[100vh]">{children}</body>
    </html>
  );
}
