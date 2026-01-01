import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";
import { getBlogData } from "@/lib/blog";


const Blogs = async ({params} : {params : Promise<{ slug : string }>}) => {
    const { slug } = await params;
    const blogData = await getBlogData(slug);
  return (
    <section>
        <div>
            <Link href={"/"}>
                <ArrowLeftIcon width={20}/>
                <p>Back To Home</p>
            </Link>
            <p>{blogData.date.toString()}</p>
        </div>
        <article dangerouslySetInnerHTML={{__html: blogData.contentHTML}}/>
    </section>
  )
}

export default Blogs