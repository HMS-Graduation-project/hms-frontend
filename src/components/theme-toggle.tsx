import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import { Button } from '@/components/ui/button';

const CYCLE: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];

const META: Record<string, { icon: typeof Sun; label: string }> = {
  light: { icon: Sun, label: 'Light mode (click to switch to dark)' },
  dark: { icon: Moon, label: 'Dark mode (click to switch to system)' },
  system: { icon: Monitor, label: 'System mode (click to switch to light)' },
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const next = CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length];
  const { icon: Icon, label } = META[theme];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      title={label}
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}
