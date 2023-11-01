"use client";

import useCloudflare from "@/src/useCloudflare";
import React from "react";

const ClientComponent = () => {
  const posts = useCloudflare("getPosts");
  const profile = useCloudflare("getProfile");

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-slate-300">
      <div className="w-[400px] flex flex-col gap-4">
        <h1 className="text-gray-900">Do you see the data?</h1>
        <p className="text-gray-700">
          If this worked, you should see "null" show on the screen briefly
          before the data renders to the page. That's because NextJS only
          displays non-interactive HTML until the JS stuff loads in the browser.
          Because "useCloudflare" accesses the window object, we must wait for
          our React component to mount, which requires that the JS has loaded.
        </p>
        <div>
          <pre>
            {JSON.stringify(
              {
                posts,
                profile,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ClientComponent;
