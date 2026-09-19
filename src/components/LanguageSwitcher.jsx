import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, switchLanguage } = useLanguage();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-600" />
          <div className="flex gap-1">
            <button
              onClick={() => switchLanguage('en')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                language === 'en'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => switchLanguage('id')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                language === 'id'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
