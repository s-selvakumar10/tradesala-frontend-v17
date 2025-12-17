export class Category {
  name: string;
  slug: string;
  description?: string;
  summary?: string;
  seo?: { title: string; description: string; keywords: string };
  photo?: string;
  children?: Array<Category>;
}
