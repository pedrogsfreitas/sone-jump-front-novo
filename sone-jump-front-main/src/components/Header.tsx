import { useNavigate } from "react-router-dom";
import { Button } from "./Button";

export function Header() {
  const navLinks = ["Home", "Página Inicial", "Sobre Nós"];
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-extrabold uppercase tracking-widest text-white">
          JUMP
        </div>

        <div className="flex items-center gap-8">
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link}
                href="#"
                className="text-white text-sm font-medium transition-colors hover:text-zinc-300"
              >
                {link}
              </a>
            ))}
          </nav>

          <Button variant="small" onClick={() => navigate('/login')}>Entrar</Button>
        </div>
      </div>
    </header>
  );
}
