import Link from "next/link"


const Navbar = () => {
  return (
    <header>
        <nav className="flex items-center justify-between p-4 text-neutral-900 m-5">

        <Link href="/" className="text-xl font-bold">
            Sinan
        </Link>
        <Link href="/blog" className="text-xl font-bold">
            Blogs
        </Link>
        
        </nav>
    </header>
  )
}

export default Navbar