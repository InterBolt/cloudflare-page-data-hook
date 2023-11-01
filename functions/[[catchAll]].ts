import * as api from "../api";

const { WINDOW_ACCESSOR, ...apiRequests } = api;

// Cloudflare doesn't include the .html extension in the url
// so this returns true if the url ends in a slash or a page
// name without an extension.
const isHTMLFile = (cloudflareUrl: string) => {
  return cloudflareUrl.split("/").at(-1).split(".").length === 1;
};

// Grabs the data from all the api requests and returns an object
// were the keys are the api request names and the values
// are the corresponding responses.
// Likeso: { getProfile: { ... }, getPosts: [ ... ] }
const getApiData = async () => {
  const data = await Promise.all(
    Object.values(apiRequests).map((fn) => fn())
  ).then((values) =>
    Object.keys(apiRequests).reduce(
      (acc, key, index) => ({ ...acc, [key]: values[index] }),
      {}
    )
  );

  return data;
};

const injectScriptWithData = async (element: Element) => {
  const data = await getApiData();

  element.after(
    `<script>
      window["${WINDOW_ACCESSOR}"] = ${JSON.stringify(data)};
    </script>`
  );
};

export const onRequest: PagesFunction = async ({ next, request }) => {
  // Ensure that we break the browser cache for HTML files since
  // we're injecting potentially updated data into the page.
  if (isHTMLFile(request.url)) {
    request.headers.set("cache-control", "no-store");
  }

  const htmlResponse = await next(request);
  const htmlResponseWithApiData = new HTMLRewriter()
    .on("head", {
      element: injectScriptWithData,
    })
    .transform(htmlResponse);

  return htmlResponseWithApiData;
};