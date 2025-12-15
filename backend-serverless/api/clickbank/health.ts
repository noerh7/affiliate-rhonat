import type { VercelRequest, VercelResponse } from '@vercel/node';
import ClickBankService from '../../lib/clickbank.service';

// Helper pour gérer CORS
function setCorsHeaders(res: VercelResponse) {
    const allowedOrigin = process.env.FRONTEND_URL || '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    console.log('[Health API] Request received:', {
        method: req.method,
        url: req.url,
    });

    setCorsHeaders(res);

    // Handle preflight
    if (req.method === 'OPTIONS') {
        console.log('[Health API] Handling OPTIONS request');
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        console.log('[Health API] Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('[Health API] Creating ClickBankService instance');
        const clickBankService = new ClickBankService();
        console.log('[Health API] Calling healthCheck');
        const health = await clickBankService.healthCheck();

        console.log('[Health API] Health check result:', health);
        return res.status(200).json(health);
    } catch (error) {
        console.error('[Health API] Unhandled error:', error);
        console.error('[Health API] Error stack:', error instanceof Error ? error.stack : 'No stack');
        return res.status(500).json({
            error: 'Health check failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
