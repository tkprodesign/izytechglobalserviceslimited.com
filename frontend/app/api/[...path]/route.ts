import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Delegates all /api/* requests to the existing Express app (backend/expressApp.js).
// Loaded lazily inside the handler to keep build-time memory usage low.
async function handler(req: NextRequest) {
  const params = (req as any).params as { path: string[] };
  const url = new URL(req.url);
  const apiPath = '/api/' + params.path.join('/') + url.search;

  const method = req.method;
  const headers = Object.fromEntries(req.headers.entries());
  const body = method === 'GET' || method === 'HEAD' ? undefined : Buffer.from(await req.arrayBuffer());

  const expressApp: any = (globalThis as any).__izyExpressApp ??= require('@backend/expressApp');

  return new Promise<NextResponse>((resolve) => {
    let settled = false;
    const done = (r: NextResponse) => { if (!settled) { settled = true; resolve(r); } };

    const res: any = {
      headers: {} as Record<string, string>,
      statusCode: 200,
      setHeader(k: string, v: string) { this.headers[k.toLowerCase()] = v; },
      getHeader(k: string) { return this.headers[k.toLowerCase()]; },
      removeHeader(k: string) { delete this.headers[k.toLowerCase()]; },
      status(code: number) { this.statusCode = code; return this; },
      json(data: unknown) { done(NextResponse.json(data, { status: this.statusCode, headers: this.headers })); },
      send(data: unknown) {
        if (typeof data === 'object' && data !== null) return this.json(data);
        done(new NextResponse(String(data), { status: this.statusCode, headers: this.headers }));
      },
      end(data?: unknown) {
        if (data !== undefined) this.send(data);
        else done(new NextResponse(null, { status: this.statusCode, headers: this.headers }));
      },
      writeHead(code: number, headers?: Record<string, string>) {
        this.statusCode = code;
        if (headers) for (const [k, v] of Object.entries(headers)) this.setHeader(k, v);
        return this;
      },
      on() {}, once() {}, emit() {}, write() { return true; },
      writable: true, writableEnded: false, finished: false, headersSent: false,
      locals: {}, app: expressApp, connection: {}, socket: {},
    } as any;

    const nodeReq: any = {
      method,
      url: apiPath,
      originalUrl: apiPath,
      path: '/api/' + params.path.join('/'),
      headers,
      socket: { remoteAddress: '127.0.0.1' },
      connection: { remoteAddress: '127.0.0.1' },
      on(event: string, cb: (chunk?: Buffer) => void) {
        if (event === 'data' && body && body.length) cb(body);
        if (event === 'end') cb();
        return this;
      },
      once(event: string, cb: () => void) { if (event === 'end') cb(); return this; },
      emit() { return true; }, resume() {}, pause() {}, readable: true,
    };
    nodeReq.req = nodeReq;

    try {
      expressApp(nodeReq, res, (err?: Error) => {
        if (err) {
          console.error('Express next(err):', err.message);
          done(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
        } else {
          done(NextResponse.json({ error: 'Not found' }, { status: 404 }));
        }
      });
    } catch (err: any) {
      console.error('Express handler error:', err?.message || err);
      done(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
    }
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;
