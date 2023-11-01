"use client";

import useCloudflare from "@/src/useCloudflare";
import React from "react";

const ClientComponent = () => {
  const posts = useCloudflare("getPosts");
  const profile = useCloudflare("getProfile");

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-8 bg-slate-300">
      <div className="w-[1000px] flex bg-gray-100 rounded-xl shadow-2xl">
        <div className="flex gap-6 flex-col w-[550px] p-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Do you see the data on the right?
          </h1>
          <h2 className="text-lg font-bold text-gray-800">
            If not, are you seeing null for each field?
          </h2>
          <p className="text-gray-700">
            If you're viewing this page by running <strong>yarn dev</strong>,
            you'll see <strong>null</strong> because the Cloudflare Worker is
            not running and therefore not populating the data.
          </p>
          <h2 className="text-lg font-bold text-gray-800">
            Or are you seeing <strong>null</strong> for a split second before
            the data appears?
          </h2>
          <p className="text-gray-700">
            If you're viewing the page either on a live url or by running{" "}
            <strong>yarn wrangler</strong>, you'll see <strong>null</strong> for
            a split second before the data appears. This is expected behavior
            that results from relying on the window object to populate the data
            in our React hook, and{" "}
            <i>
              we can't access the window object until our React component
              mounts.
            </i>
          </p>
        </div>
        <div className="flex w-[450px] overflow-hidden border-0 border-l border-gray-300 p-8">
          <pre className="text-[8px]">
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
