export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
};

export type Item = {
  id: string;
  category_id: string;
  name: string;
  image_url: string;
  image_urls: string[];
  created_at: string;
  categories?: Category;
};
