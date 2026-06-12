import Link from "next/link";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-neutral-800">
      <nav className="max-w-4xl mx-auto flex items-center justify-between px-8 py-5 text-white">
        <Link href="/" className="text-lg font-medium hover:text-neutral-400 transition-colors">
          Home
        </Link>
        <Link href="/blog" className="text-lg font-medium hover:text-neutral-400 transition-colors">
          Blogs
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
