import { GraduationCap, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer id="about" className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">
                Campus<span className="text-secondary">Finder</span>
              </span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Pakistan's leading platform to discover, compare, and shortlist
              universities based on your academic profile and preferences.
            </p>
            <div className="flex items-center gap-3">
              <SocialLink icon={Facebook} href="#" />
              <SocialLink icon={Twitter} href="#" />
              <SocialLink icon={Instagram} href="#" />
              <SocialLink icon={Linkedin} href="#" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2">
              <FooterLink href="#home">Home</FooterLink>
              <FooterLink href="#universities">Universities</FooterLink>
              <FooterLink href="#compare">Compare</FooterLink>
              <FooterLink href="#">Programs</FooterLink>
              <FooterLink href="#">Rankings</FooterLink>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Resources</h4>
            <ul className="space-y-2">
              <FooterLink href="#">Admission Guide</FooterLink>
              <FooterLink href="#">Scholarship Info</FooterLink>
              <FooterLink href="#">Merit Calculator</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">FAQs</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                info@UniversityFinder.pk
              </li>
              <li className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                +92 (51) 123-4567
              </li>
              <li className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>Blue Area, Islamabad, Pakistan</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/60">
              © 2024 CampusFinder. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({
  icon: Icon,
  href,
}: {
  icon: React.ElementType;
  href: string;
}) => (
  <a
    href={href}
    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
  >
    <Icon className="h-4 w-4" />
  </a>
);

const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <li>
    <a
      href={href}
      className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
    >
      {children}
    </a>
  </li>
);
