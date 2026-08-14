import { createRolinoRevalidationHandler } from "@rolino/nextjs-blog";

export async function POST(request: Request) {
  return createRolinoRevalidationHandler()(request);
}
