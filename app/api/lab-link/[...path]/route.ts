import { createLabLinkHandler } from '../../../../lib/lab-link-server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const handle = createLabLinkHandler();
type Context = { params: Promise<{ path: string[] }> };
export async function GET(request: Request, context: Context) {
  return handle(request, (await context.params).path);
}
export async function POST(request: Request, context: Context) {
  return handle(request, (await context.params).path);
}
export async function DELETE(request: Request, context: Context) {
  return handle(request, (await context.params).path);
}
