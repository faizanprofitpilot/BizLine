-- Grant Pro plan to a user (bypasses Stripe).
-- Run in Supabase Dashboard → SQL Editor.
--
-- 1. Replace the UUID below with the user's id from Authentication → Users.
-- 2. Execute the whole script.

DO $$
DECLARE
  target_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- ← change me
  user_email text;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = target_user_id;

  IF user_email IS NULL THEN
    RAISE EXCEPTION 'No auth.users row for id %. Check the UUID.', target_user_id;
  END IF;

  -- subscriptions.user_id references public.users(id)
  INSERT INTO public.users (id, email)
  VALUES (target_user_id, user_email)
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;

  INSERT INTO public.subscriptions (
    user_id,
    status,
    plan,
    stripe_customer_id,
    stripe_subscription_id
  )
  VALUES (
    target_user_id,
    'active',  -- required by middleware + /api/twilio/provision
    'pro',
    NULL,      -- manual grant — no Stripe customer
    NULL
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    status = 'active',
    plan = 'pro';
END $$;

-- Verify:
-- SELECT u.id, u.email, s.status, s.plan
-- FROM public.users u
-- LEFT JOIN public.subscriptions s ON s.user_id = u.id
-- WHERE u.id = '00000000-0000-0000-0000-000000000000';
