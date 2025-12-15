/**
 * Exemple d'utilisation de l'API ClickBank
 * 
 * Ce fichier montre comment utiliser les fonctions de l'API ClickBank
 * avec la clé developer fournie pour les tests.
 */

import {
  getOrders,
  getAllOrders,
  getClicksAnalytics,
  createAffiliateLink,
  testConnection,
  type ClickBankConfig,
  type OrderFilters,
  type AnalyticsFilters,
  type CreateAffiliateLinkRequest,
} from './clickbank';

// Configuration avec la clé developer pour les tests
const TEST_CONFIG: ClickBankConfig = {
  apiKey: 'DEV-123456789012345678901234567890123456',
  developerKey: 'DEV-123456789012345678901234567890123456',
};

/**
 * Exemple 1: Tester la connexion à l'API ClickBank
 */
export async function exampleTestConnection() {
  console.log('Testing ClickBank API connection...');
  
  const result = await testConnection(TEST_CONFIG);
  
  if (result.ok) {
    console.log('✅ Connection successful!');
    console.log('Payload:', JSON.stringify(result.payload, null, 2));
  } else {
    console.error('❌ Connection failed!');
    if (result.error) console.error('Error:', result.error);
  }
  
  return result.ok;
}

/**
 * Exemple 2: Récupérer les ventes avec filtres
 */
export async function exampleGetOrders() {
  console.log('Fetching orders from ClickBank...');
  
  const filters: OrderFilters = {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    type: 'SALE', // SALE, RFND, CGBK, etc.
    page: 1,
  };
  
  try {
    const response = await getOrders(TEST_CONFIG, filters);
    
    console.log(`✅ Found ${response.orders.length} orders`);
    console.log('Orders:', JSON.stringify(response.orders, null, 2));
    
    if (response.hasMore) {
      console.log('⚠️ More orders available. Use getAllOrders() to fetch all pages.');
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    throw error;
  }
}

/**
 * Exemple 3: Récupérer toutes les ventes (avec pagination automatique)
 */
export async function exampleGetAllOrders() {
  console.log('Fetching all orders from ClickBank (with pagination)...');
  
  const filters: OrderFilters = {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  };
  
  try {
    const allOrders = await getAllOrders(TEST_CONFIG, filters);
    
    console.log(`✅ Found ${allOrders.length} total orders`);
    console.log('Sample order:', JSON.stringify(allOrders[0], null, 2));
    
    return allOrders;
  } catch (error) {
    console.error('❌ Error fetching all orders:', error);
    throw error;
  }
}

/**
 * Exemple 4: Récupérer les statistiques de clics par Tracking ID
 */
export async function exampleGetClicksAnalytics() {
  console.log('Fetching clicks analytics from ClickBank...');
  
  const filters: AnalyticsFilters = {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    // trackingId: 'campagne_fb_1', // Optionnel: filtrer par Tracking ID spécifique
  };
  
  try {
    const response = await getClicksAnalytics(TEST_CONFIG, filters);
    
    console.log(`✅ Found analytics for ${response.data.length} tracking IDs`);
    console.log('Clicks data:', JSON.stringify(response.data, null, 2));
    
    // Afficher les détails de chaque lien
    response.data.forEach((clickData) => {
      console.log(`\nTracking ID: ${clickData.trackingId}`);
      console.log(`  - Clics (Hops): ${clickData.hops}`);
      console.log(`  - Ventes: ${clickData.sales}`);
      console.log(`  - Remboursements: ${clickData.refunds}`);
      console.log(`  - Chargebacks: ${clickData.chargebacks}`);
      console.log(`  - Gains: ${clickData.earnings}`);
    });
    
    return response;
  } catch (error) {
    console.error('❌ Error fetching clicks analytics:', error);
    throw error;
  }
}

/**
 * Exemple 5: Créer un lien d'affiliation (HopLink)
 */
export async function exampleCreateAffiliateLink() {
  console.log('Creating affiliate link...');
  
  const request: CreateAffiliateLinkRequest = {
    affiliateNickname: 'monaffilie', // Remplacez par votre nickname d'affilié
    vendorNickname: 'produitx', // Remplacez par le nickname du vendeur
    trackingId: 'campagne_fb_1', // Votre ID de suivi personnalisé
  };
  
  try {
    const response = await createAffiliateLink(TEST_CONFIG, request);
    
    if (response.success) {
      console.log('✅ Affiliate link created successfully!');
      console.log('Link details:', JSON.stringify(response.link, null, 2));
      console.log(`\nHopLink URL: ${response.link.url}`);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Error creating affiliate link:', error);
    throw error;
  }
}

/**
 * Exemple complet: Exécuter tous les exemples
 */
export async function runAllExamples() {
  console.log('=== ClickBank API Examples ===\n');
  
  try {
    // 1. Test de connexion
    await exampleTestConnection();
    console.log('\n');
    
    // 2. Récupérer les ventes
    await exampleGetOrders();
    console.log('\n');
    
    // 3. Récupérer les statistiques de clics
    await exampleGetClicksAnalytics();
    console.log('\n');
    
    // 4. Créer un lien d'affiliation
    await exampleCreateAffiliateLink();
    console.log('\n');
    
    console.log('=== All examples completed ===');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Pour utiliser dans la console du navigateur ou dans un composant React:
// import { runAllExamples } from './api/clickbank-example';
// runAllExamples();


