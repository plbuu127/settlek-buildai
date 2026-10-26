import { env } from 'cloudflare:workers';
import { handleRecordsRequest } from '../../../lib/records';

export async function GET(request: Request) {
  return handleRecordsRequest(request, env.DB);
}
export async function PUT(request: Request) {
  return handleRecordsRequest(request, env.DB);
}
export async function DELETE(request: Request) {
  return handleRecordsRequest(request, env.DB);
}
