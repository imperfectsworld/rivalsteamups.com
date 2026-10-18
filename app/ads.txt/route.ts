const journeyAdsTxtUrl = "https://adstxt.journeymv.com/sites/03568703-34c7-4e62-b073-a1491d1fbc8b/ads.txt";

export function GET() {
  return Response.redirect(journeyAdsTxtUrl, 301);
}

export const HEAD = GET;
