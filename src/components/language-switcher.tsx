import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLang = i18n.language?.startsWith('tr') ? 'tr' : 'en';

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'tr' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
      aria-label={`Switch language to ${currentLang === 'en' ? 'Türkçe' : 'English'}`}
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">{currentLang.toUpperCase()}</span>
    </Button>
  );
}
