import { Link } from "react-router-dom";
import { Activity, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-heading font-bold text-foreground">
                Medi<span className="text-primary">Care</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Modern hospital management system for seamless patient care and efficient operations.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/tokens" className="hover:text-primary transition-colors">Token Management</Link></li>
              <li><Link to="/appointments" className="hover:text-primary transition-colors">Book Appointment</Link></li>
              <li><Link to="/departments" className="hover:text-primary transition-colors">Departments</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Departments</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Cardiology</li>
              <li>Neurology</li>
              <li>Orthopedics</li>
              <li>Pediatrics</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +1 (555) 123-4567</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> info@medicare.com</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> 123 Health Ave, Medical City</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2026 MediCare Hospital. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
