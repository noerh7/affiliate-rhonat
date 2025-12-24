import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ClickBankAnalytics from './ClickBank';
import ClickBankVente from './ClickBankVente';
import { useTranslation } from 'react-i18next';

export default function ClickBankParent() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'analytics' | 'ventes'>('analytics');

    return (
        <div className="app-background flex gap-6">
            <Sidebar />
            <div className="w-full space-y-4">
                <Navbar />
                <main className="page-surface p-6 w-full flex flex-col gap-4">
                    {/* En-tête */}
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Connecteur partenaires</p>
                            <h1 className="text-2xl font-bold">ClickBank</h1>
                        </div>
                        <span className="badge-soft">{t('common.new')}</span>
                    </div>

                    {/* Onglets */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'analytics'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                `}
                            >
                                📊 Analytics & Clics
                            </button>
                            <button
                                onClick={() => setActiveTab('ventes')}
                                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'ventes'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                `}
                            >
                                💰 {t('clickbank.sales')}
                            </button>
                        </nav>
                    </div>

                    {/* Contenu des onglets */}
                    <div className="mt-4">
                        {activeTab === 'analytics' && <ClickBankAnalytics />}
                        {activeTab === 'ventes' && <ClickBankVente />}
                    </div>
                </main>
            </div>
        </div>
    );
}
