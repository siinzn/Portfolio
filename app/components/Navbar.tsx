import Link from "next/link";

const Navbar = () => {
  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 text-stone-300 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:text-[#91aa91]"
        >
          Home
        </Link>
        <Link
          href="/blog"
          className="font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:text-[#91aa91]"
        >
          Blogs
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
