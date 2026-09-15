import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    // Let the Express app stream and parse the request body itself.
    bodyParser: false,
  },
};

/**
 * Next.js API bridge — every /api/* request is delegated to the same Express
 * app that powers standalone deployments (server/expressApp.js).
 *
 * The Pages-Router handler receives real Node.js IncomingMessage /
 * ServerResponse objects, which Express drives natively — full streaming,
 * real header handling, uploads — with no bridging shim needed.
 */

type ExpressModule = (req: unknown, res: unknown, next?: (err?: Error) => void) => void;

function getExpressApp(): ExpressModule {
  const g = globalThis as unknown as { __izyExpressApp?: ExpressModule };
  if (!g.__izyExpressApp) {
    g.__izyExpressApp = require('@server/expressApp');
  }
  return g.__izyExpressApp as ExpressModule;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // req.url arrives as the full original path (e.g. "/api/health?x=1") and the
  // Express app's routes are defined WITH the /api prefix, so the request is
  // passed through untouched.
  const expressApp = getExpressApp();
  expressApp(req, res, (err?: Error) => {
    if (err) {
      console.error('Express next(err):', err.message);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    } else if (!res.writableEnded) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });
}
