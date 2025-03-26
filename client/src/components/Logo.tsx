
import { useTheme } from '../hooks/useTheme';

export default function Logo() {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="flex items-center gap-2">
      <img 
        src={isDarkMode ? "/logo-dark.png" : "/logo-light.png"} 
        alt="Eluvie Logo" 
        className="h-8 w-auto"
      />
    </div>
  );
}
