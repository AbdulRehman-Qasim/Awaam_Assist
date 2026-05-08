import { GraduationCap, Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  favoritesCount: number;
  onShowFavorites: () => void;
}

export const Header = ({ favoritesCount, onShowFavorites }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Campus<span className="text-secondary">Finder</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#home"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </a>
          <a
            href="#universities"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Universities
          </a>
          <a
            href="#compare"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Compare
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="glass"
            size="sm"
            className="relative"
            onClick={onShowFavorites}
          >
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Favorites</span>
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                {favoritesCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-t border-border/40",
          mobileMenuOpen ? "max-h-64" : "max-h-0"
        )}
      >
        <nav className="container py-4 flex flex-col gap-3">
          <a
            href="#home"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </a>
          <a
            href="#universities"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Universities
          </a>
          <a
            href="#compare"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Compare
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </a>
        </nav>
      </div>
    </header>
  );
};
