import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Language } from '@/lib/i18n/translations';
import { Globe } from 'lucide-react';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="flex items-center">
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger 
          className="w-[85px] h-9 flex items-center justify-between border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          aria-label={t('language')}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <SelectValue>{language === 'en' ? 'EN' : 'PT'}</SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="pt-BR">Português</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;