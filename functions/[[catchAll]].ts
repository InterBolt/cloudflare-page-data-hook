// `api/index.ts` is shared between this Cloudflare Page Function
// and our frontend (React/NextJS). But we ONLY call functions defined within
// `api/index.ts` from this file. Our NextJS code will use `api/index.ts` as a
// glorified d.ts file 😬. Not perfect, but it compiles, works, and adds very
// little to our React bundle size.
import * as api from "../api";

// `constants.ts` is another file that we'll need to share with our
// frontend code.
import { WINDOW_ACCESS_KEY } from "../constants";

// Cloudflare doesn't include the .html extension in the url
// so this returns true if the url ends in a slash or a page
// name without an extension.
const isHTMLFile = (cloudflareUrl: string) => {
  return cloudflareUrl.split("/").at(-1).split(".").length === 1;
};

// Grabs the data from all the api requests and returns an object
// where the keys are the api request names and the values
// are their corresponding responses.
// Example return: { getProfile: { ...data }, getPosts: [ ...data ] }
const getApiData = async (params: Record<string, any>) => {
  const data = await Promise.all(
    Object.values(api).map((fn: any) => fn(params) as any)
  ).then((values) =>
    Object.keys(api).reduce(
      (acc, key, index) => ({ ...acc, [key]: values[index] }),
      {}
    )
  );

  return data;
};

// Injects a script tag with the api data into the head of our html file.
// Docs: https://developers.cloudflare.com/workers/runtime-apis/html-rewriter#element
const injectDataViaScriptTag = async (element: Element, href: string) => {
  // Convert the request href into a plain object
  const params = Object.fromEntries(new URL(href).searchParams);
  // Call the function that grabs all of the data we need to inject
  const data = await getApiData(params);

  // Inject the data by attaching a script tag which runs some JS
  // on the client to store the api response in the window object.
  element.after(
    `<script>
        window["${WINDOW_ACCESS_KEY}"] = ${JSON.stringify(data)};
      </script>`,
    { html: true }
  );
};

// The main function that runs on every asset request.
// Docs: https://developers.cloudflare.com/pages/platform/functions/get-started/#create-a-function
export const onRequest: PagesFunction = async ({ next, request }) => {
  // `onRequest` will run on each and every static asset request.
  // But we wouldn't inject script tags into non-HTML files so return
  // early for non-HTML files.
  if (!isHTMLFile(request.url)) {
    return next(request);
  }

  // Grab the HTML from cloudflare's cache
  const htmlResponse = await next(request);

  // Use HTMLRewriter to inject our script tag into the HTML's
  // head section.
  // Docs: https://developers.cloudflare.com/workers/runtime-apis/html-rewriter
  const htmlResponseWithApiData = new HTMLRewriter()
    .on("head", {
      element: (element: Element) =>
        injectDataViaScriptTag(element, request.url),
    })
    .transform(htmlResponse);

  // For safety, we always assume the data returned by
  // `getApiData` has changed and avoid a 304 response.
  // A 304 status tells the browser to use the version
  // of the page in its local cache, which could contain
  // stale data.
  return new Response(htmlResponseWithApiData.body, {
    ...htmlResponseWithApiData,
    status:
      htmlResponseWithApiData.status !== 304
        ? htmlResponseWithApiData.status
        : 200,
  });
};
