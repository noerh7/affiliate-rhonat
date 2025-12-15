import type { VercelRequest, VercelResponse } from '@vercel/node';
import ClickBankService from '../../lib/clickbank.service';

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
    console.log('[Orders API] Request received:', {
        method: req.method,
        url: req.url,
        query: req.query,
    });

    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        console.log('[Orders API] Handling OPTIONS request');
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        console.log('[Orders API] Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { startDate, endDate } = req.query;
        console.log('[Orders API] Query params:', { startDate, endDate });

        console.log('[Orders API] Creating ClickBankService instance');
        const clickBankService = new ClickBankService();
        console.log('[Orders API] Calling getOrders');
        const orders = await clickBankService.getOrders(
            startDate as string,
            endDate as string
        );

        // Vérifier si c'est une erreur
        if ('error' in orders) {
            console.log('[Orders API] Error response from service:', orders);
            return res.status(orders.statusCode).json(orders);
        }

        console.log('[Orders API] Success - returning orders');
        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        console.error('[Orders API] Unhandled error:', error);
        console.error('[Orders API] Error stack:', error instanceof Error ? error.stack : 'No stack');
        return res.status(500).json({
            error: 'Failed to fetch orders',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
