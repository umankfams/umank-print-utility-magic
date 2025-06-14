
import { Printer } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
          <Printer size={30} />
          <h1 className="text-2xl font-bold">Print Utility Magic</h1>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-accent transition-colors">Beranda</Link>
          <Link to="/history" className="hover:text-accent transition-colors">Riwayat</Link>
          <Link to="/settings" className="hover:text-accent transition-colors">Pengaturan</Link>
        </nav>
        <div className="md:hidden">
          <Button variant="ghost" size="icon">
            <Printer size={24} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
