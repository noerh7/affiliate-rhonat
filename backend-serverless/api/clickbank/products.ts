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
    console.log('[Products API] Request received:', {
        method: req.method,
        url: req.url,
        headers: Object.keys(req.headers),
    });

    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        console.log('[Products API] Handling OPTIONS request');
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        console.log('[Products API] Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('[Products API] Creating ClickBankService instance');
        const clickBankService = new ClickBankService();
        console.log('[Products API] Calling getProducts');
        const products = await clickBankService.getProducts();

        // Vérifier si c'est une erreur
        if ('error' in products) {
            console.log('[Products API] Error response from service:', products);
            return res.status(products.statusCode).json(products);
        }

        console.log('[Products API] Success - returning products');
        return res.status(200).json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        console.error('[Products API] Unhandled error:', error);
        console.error('[Products API] Error stack:', error instanceof Error ? error.stack : 'No stack');
        return res.status(500).json({
            error: 'Failed to fetch products',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
