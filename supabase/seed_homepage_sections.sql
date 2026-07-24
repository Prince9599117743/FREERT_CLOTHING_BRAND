-- Seed and update default homepage sections to ensure all requested blocks exist
INSERT INTO public.homepage_sections (id, title, subtitle, banner_image, cta_text, cta_link, visible, "order")
VALUES 
  ('new-drop', 'NEW DROP', 'Seasonal Highlight', '/assets/trench_coat.jpg', 'Explore Collection', '/shop/new-arrivals', true, 0),
  ('men', 'Men''s Silhouette', 'Tailored for Him', '/assets/trench_coat.jpg', 'Shop Men', '/shop/men', true, 1),
  ('women', 'Women''s Silhouette', 'Tailored for Her', '/assets/slip_dress.jpg', 'Shop Women', '/shop/women', true, 2),
  ('explore', 'Explore Raw Linen', 'Sustainably Crafted', '/assets/kimono_shirt.jpg', 'Discover Flow', '/shop', true, 3),
  ('accessories', 'Accessories Edit', 'Finishing Details', '/assets/cap_1784646670746.png', 'Shop Accessories', '/shop/accessories', true, 4),
  ('fine-leather-craft', 'Fine Leather Craft', 'Handmade Goods', '/assets/sneakers_1784646656235.png', 'Shop Leather', '/shop/accessories', true, 5),
  ('perfumes', 'Luxury Scent', 'Aromatic Notes', '/assets/sneakers_1784646656235.png', 'Shop Perfumes', '/shop/perfumes', true, 6),
  ('scent', 'Scent & Co.', 'Signature Blends', '/assets/sneakers_1784646656235.png', 'Discover Scents', '/shop/perfumes', true, 7),
  ('brand-story', 'Our DNA', 'Structure & Form', '', '', '', true, 8),
  ('editorial-journal', 'Editorial Journal', 'Lookbook Gallery', '', '', '', true, 9),
  ('newsletter', 'Stay Connected', 'The FREERT Dispatch', '', '', '', true, 10)
ON CONFLICT (id) DO UPDATE 
SET title = COALESCE(homepage_sections.title, EXCLUDED.title);
