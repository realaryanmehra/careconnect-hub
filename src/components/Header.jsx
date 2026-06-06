import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Activity, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const { isAuthenticated, user, logout, isAdmin } = useAuth();
    const { theme, toggleTheme } = useTheme();
    
    // Different nav items for admin vs regular users
    const navItems = isAdmin
        ? [
            { label: "Home", path: "/" },
            { label: "Admin Dashboard", path: "/admin" },
          ]
        : [
            { label: "Home", path: "/" },
            { label: "Dashboard", path: "/dashboard" },
            { label: "Tokens", path: "/tokens" },
            { label: "Book Appointment", path: "/appointments" },
            { label: "Departments", path: "/departments" },
          ];
    return (<header className="sticky top-0 z-50 glass">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Activity className="h-5 w-5 text-primary-foreground"/>
          </div>
          <span className="text-xl font-heading font-bold text-foreground">
            Medi<span className="text-primary">Care</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (<Link key={item.path} to={item.path} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              {item.label}
            </Link>))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-foreground">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {!isAuthenticated && (<>
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>)}
          {isAuthenticated && (<>
              <span className="text-sm text-muted-foreground">Hi, {user?.name?.split(" ")[0] || "User"}</span>
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            </>)}
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-foreground">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <button className="p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-border bg-card">
            <nav className="container py-4 flex flex-col gap-1">
              {navItems.map((item) => (<Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)} className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"}`}>
                  {item.label}
                </Link>))}
              <div className="flex gap-2 mt-3 px-4">
                {!isAuthenticated && (<>
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
                    </Button>
                    <Button size="sm" className="flex-1" asChild>
                      <Link to="/register" onClick={() => setMobileOpen(false)}>Register</Link>
                    </Button>
                  </>)}
                {isAuthenticated && <Button size="sm" variant="outline" className="flex-1" onClick={() => { logout(); setMobileOpen(false); }}>
                    Logout
                  </Button>}
              </div>
            </nav>
          </motion.div>)}
      </AnimatePresence>
    </header>);
};
export default Header;
