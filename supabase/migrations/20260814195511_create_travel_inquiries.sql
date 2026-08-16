/*
# Create travel inquiry inbox

1. New Tables
- `travel_inquiries` stores public booking requests and contact messages.
- `id` uniquely identifies each inquiry.
- `kind` distinguishes booking requests from general contact messages.
- `package_name`, `name`, `email`, `phone`, `arrival_date`, `travelers`, `message` store guest-provided details.
- `status` tracks inbox workflow with `new`, `contacted`, or `closed`.
- `created_at` records submission time.

2. Security
- Row level security is enabled.
- Anonymous visitors may submit inquiries but cannot read, update, or delete them.
- Authenticated staff accounts may read and update inquiries for the admin inbox.

3. Important Notes
- The browser only sends guest-editable fields.
- The admin dashboard uses the authenticated Supabase session for inbox access.
*/

CREATE TABLE IF NOT EXISTS public.travel_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'booking' CHECK (kind IN ('booking', 'contact')),
  package_name text,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  arrival_date date,
  travelers integer CHECK (travelers IS NULL OR (travelers >= 1 AND travelers <= 50)),
  message text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.travel_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit travel inquiries" ON public.travel_inquiries;
CREATE POLICY "Public can submit travel inquiries"
ON public.travel_inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (
  kind IN ('booking', 'contact')
  AND length(trim(name)) BETWEEN 2 AND 120
  AND length(trim(email)) BETWEEN 5 AND 240
  AND (travelers IS NULL OR travelers BETWEEN 1 AND 50)
  AND status = 'new'
);

DROP POLICY IF EXISTS "Staff can view travel inquiries" ON public.travel_inquiries;
CREATE POLICY "Staff can view travel inquiries"
ON public.travel_inquiries FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Staff can update inquiry status" ON public.travel_inquiries;
CREATE POLICY "Staff can update inquiry status"
ON public.travel_inquiries FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (status IN ('new', 'contacted', 'closed'));

DROP POLICY IF EXISTS "Staff can delete travel inquiries" ON public.travel_inquiries;
CREATE POLICY "Staff can delete travel inquiries"
ON public.travel_inquiries FOR DELETE
TO authenticated
USING (true);

CREATE INDEX IF NOT EXISTS travel_inquiries_created_at_idx ON public.travel_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS travel_inquiries_status_idx ON public.travel_inquiries (status);
