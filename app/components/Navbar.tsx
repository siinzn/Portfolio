import Link from "next/link";

const Navbar = () => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-neutral-400/50"
      style={{ fontFamily: "var(--font-poppins), serif", fontWeight: 500 }}
    >
      <nav className="max-w-4xl mx-auto flex items-center justify-between px-8 py-5 text-neutral-900">
        <Link
          href="/"
          className="text-xl hover:text-neutral-600 transition-colors"
        >
          Sinan
        </Link>
        <Link
          href="/blog"
          className="text-xl hover:text-neutral-600 transition-colors"
        >
          Blog
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
