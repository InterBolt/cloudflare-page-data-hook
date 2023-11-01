import { useEffect, useState } from "react";
import * as api from "@/api";

const { WINDOW_ACCESSOR, ...apiRequests } = api;

type ApiRequests = typeof apiRequests;
type ApiRequestName = keyof ApiRequests;

const useCloudflare = (key: ApiRequestName) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData((window as any)?.[WINDOW_ACCESSOR]?.[key] || null);
  }, []);

  return data;
};

export default useCloudflare;
