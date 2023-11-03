// This is that shared `api/index.ts` file we used in
// our cloudflare page function.
import * as api from "@/api";
// This is also shared with the cloudflare page function
import { WINDOW_ACCESS_KEY } from "@/constants";
import { useEffect, useState } from "react";

// This line is the entire reason we share the `api/index.ts` file
// between the cloudflare page function and this file.
// We'll use this inferred type to build a typesafe hook below.
type TApi = typeof api;

// This type will ensure that the return type of `useCloudflareInjected`
// depends on the `key` param provided. So for example, when the
// `key` param is "getProfile", the return type of this hook will
// be either `null` or the return type of the resolved
// `api.getProfile` function.
// Docs: https://www.typescriptlang.org/docs/handbook/2/generics.html
type TUseCloudflareHook = <TSuppliedApiRequestName extends keyof TApi>(
  key: TSuppliedApiRequestName
) => Awaited<ReturnType<TApi[TSuppliedApiRequestName]>> | null;

// A helper function to account for calling `useCloudflareInjected`
// on the server, where the `window` object does not exist yet.
const getInjectedData = (key: keyof TApi) => {
  if (typeof window !== "undefined") {
    return (window as any)?.[WINDOW_ACCESS_KEY]?.[key] || null;
  }
  return null;
};

// Even when `useCloudflareInjected` is called in components
// that include a "use client" directive, the first render
// will still happen at request or build time, which means
// the window object will not exist. So for a split second,
// just before our component calling this hook mounts, we
// expect `data` to equal `null`. Typescript should prevent
// us from making dumb mistakes since `TUseCloudflareHook`'s
// return type accounts for the possible `null` value.
// If, on the other hand, `useCloudflareInjected` is called
// within a component imported via `next/dynamic`, we'll get a
// non-null value on the first render.
//
// Doesn't make sense? Read this to better understand "use client":
// https://nextjs.org/docs/app/building-your-application/rendering/
//
// And read this to better understand `next/dynamic`:
// https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#nextdynamic
const useCloudflareInjected: TUseCloudflareHook = (key) => {
  const [data, setData] = useState(getInjectedData(key));

  useEffect(() => {
    if (!data) {
      setData(getInjectedData(key));
    }
  }, []);

  return data;
};

export default useCloudflareInjected;
