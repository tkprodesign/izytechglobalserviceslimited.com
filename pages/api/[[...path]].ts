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
  // Keep the original /api URL because Express routes are defined with the
  // /api prefix.
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