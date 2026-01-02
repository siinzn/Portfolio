import fs from "fs";
import path from "path";
import matter from "gray-matter";
import moment from "moment";
import { remark } from "remark";
import html from "remark-html";
import type { blogType } from "@/types";

const blogDir = path.join(process.cwd(), "content", "blog");

export const getSortBlogs = (): blogType[] => {
  const fileNames = fs.readdirSync(blogDir);

  const allBlogData = fileNames.map((fileName) => {
    const id = fileName.replace(/\.md$/, "");
    const fullPath = path.join(blogDir, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf-8");
    const matterResult = matter(fileContents);

    return {
      id,
      title: matterResult.data.title,
      date: matterResult.data.date,
      description: matterResult.data.description,
    } as blogType;
  });

  return allBlogData.sort((a, b) => {
    const format = "DD-MM-YYYY";

    const dateOne = moment(a.date, format);
    const dateTwo = moment(b.date, format);

    if (dateOne.isBefore(dateTwo)) {
      return 1;
    } else if (dateOne.isAfter(dateTwo)) {
      return -1;
    } else {
      return 0;
    }
  });
};

export const getBlogData = async (id: string) => {
  const fullPath = path.join(blogDir, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf-8");
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);

  const contentHTML = processedContent.toString();
  return {
    id,
    contentHTML,
    title: matterResult.data.title,
    date: moment(matterResult.data.date, "DD-MM-YYYY").format("DD/MMMM/YYYY"),
  };
};
