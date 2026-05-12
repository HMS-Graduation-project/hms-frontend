import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SUPPORTED = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'tr', label: 'Turkish', native: 'Türkçe' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
] as const;

type Lng = (typeof SUPPORTED)[number]['code'];

function detect(language: string | undefined): Lng {
  const base = (language ?? 'en').split('-')[0];
  if (base === 'ar') return 'ar';
  if (base === 'tr') return 'tr';
  return 'en';
}

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = detect(i18n.language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          aria-label="Switch language"
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">{current.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => i18n.changeLanguage(l.code)}
            className={
              current === l.code ? 'bg-accent text-accent-foreground' : ''
            }
          >
            <span className="font-medium">{l.native}</span>
            <span className="ms-auto text-xs uppercase text-muted-foreground">
              {l.code}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
