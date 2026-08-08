-- Findo — same chicken-and-egg RLS issue as the families insert, this time
-- on storage.objects: uploading returns the new row (RETURNING), which is
-- checked against the SELECT policy — and there wasn't one. Since the
-- avatars bucket is already public, just allow SELECT on it broadly.
create policy "avatar_read_public" on storage.objects for select
  using (bucket_id = 'avatars');
