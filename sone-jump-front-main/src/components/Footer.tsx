import { FaFacebook, FaLinkedin, FaYoutube, FaInstagram } from "react-icons/fa";
import { type IconType } from "react-icons";

interface SocialIcon {
  name: string;
  Icon: IconType;
  href: string;
}

export function Footer() {
  const socialIcons: SocialIcon[] = [
    { name: "Facebook", Icon: FaFacebook, href: "#" },
    { name: "Linkedin", Icon: FaLinkedin, href: "#" },
    { name: "Youtube", Icon: FaYoutube, href: "#" },
    { name: "Instagram", Icon: FaInstagram, href: "#" },
  ];

  const footerTopics = ["Página", "Página", "Página"];

  return (
    <footer className="w-full bg-white text-black mt-auto border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="flex flex-col justify-between gap-8">
          <div className="text-2xl font-black uppercase tracking-tighter">
            JUMP
          </div>

          <div className="flex items-center gap-5">
            {socialIcons.map(({ name, Icon, href }) => (
              <a
                key={name}
                href={href}
                className="text-zinc-400 hover:text-black transition-all hover:scale-110"
                aria-label={name}
              >
                <Icon size={24} />
              </a>
            ))}
          </div>
        </div>

        {[1, 2, 3].map((colIndex) => (
          <div key={colIndex} className="flex flex-col gap-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-zinc-900">
              Tópico
            </h4>
            <ul className="space-y-3">
              {footerTopics.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <a
                    href="#"
                    className="text-zinc-500 hover:text-black transition-colors text-sm font-medium"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8 text-xs text-zinc-400">
        © {new Date().getFullYear()} JUMP. Todos os direitos reservados.
      </div>
    </footer>
  );
}
