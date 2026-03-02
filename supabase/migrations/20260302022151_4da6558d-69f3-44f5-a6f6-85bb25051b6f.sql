-- Restrict posts SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone authenticated can view posts" ON public.posts;
CREATE POLICY "Authenticated users can view posts"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Also restrict post_comments and post_likes SELECT to authenticated role
DROP POLICY IF EXISTS "Anyone authenticated can view comments" ON public.post_comments;
CREATE POLICY "Authenticated users can view comments"
  ON public.post_comments
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Anyone authenticated can view likes" ON public.post_likes;
CREATE POLICY "Authenticated users can view likes"
  ON public.post_likes
  FOR SELECT
  TO authenticated
  USING (true);