import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于" }
];

export function SiteHeader() {
  return (
    <div className="site-header-wrap">
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/" className="site-brand">
            <span className="site-brand__title">Xiaety Gallery</span>
          </Link>

          <nav className="site-nav" aria-label="主导航">
            <div className="site-nav__links">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="site-nav__link">
                  {item.label}
                </Link>
              ))}
            </div>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <p className="site-header__quote">高山仰止，景行行止</p>
    </div>
  );
}
