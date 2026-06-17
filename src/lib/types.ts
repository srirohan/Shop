export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  created_at: string;
};

export type Contact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  message: string;
  created_at: string;
};

export type Item = {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  image_url: string;
  image_urls: string[];
  created_at: string;
  categories?: Category;
};
