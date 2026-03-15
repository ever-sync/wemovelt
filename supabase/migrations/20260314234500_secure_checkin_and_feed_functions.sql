-- Secure and optimize core product flows:
-- 1. force check-ins through a server-side function
-- 2. provide a single-query feed for posts
-- 3. provide aggregated goals progress

DROP POLICY IF EXISTS "Users can insert own check-ins" ON public.check_ins;

CREATE OR REPLACE FUNCTION public.calculate_distance_meters(
  p_lat1 double precision,
  p_lng1 double precision,
  p_lat2 double precision,
  p_lng2 double precision
)
RETURNS double precision
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  earth_radius CONSTANT double precision := 6371000;
  d_lat double precision;
  d_lng double precision;
  a double precision;
  c double precision;
BEGIN
  d_lat := radians(p_lat2 - p_lat1);
  d_lng := radians(p_lng2 - p_lng1);

  a :=
    sin(d_lat / 2) * sin(d_lat / 2) +
    cos(radians(p_lat1)) *
    cos(radians(p_lat2)) *
    sin(d_lng / 2) *
    sin(d_lng / 2);

  c := 2 * atan2(sqrt(a), sqrt(1 - a));

  RETURN earth_radius * c;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_check_in_secure(
  p_method text,
  p_lat double precision DEFAULT NULL,
  p_lng double precision DEFAULT NULL,
  p_gym_id uuid DEFAULT NULL,
  p_qr_code text DEFAULT NULL
)
RETURNS public.check_ins
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_gym public.gyms%ROWTYPE;
  v_equipment public.equipment%ROWTYPE;
  v_distance double precision;
  v_existing public.check_ins%ROWTYPE;
  v_inserted public.check_ins%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  IF p_method NOT IN ('geo', 'qr') THEN
    RAISE EXCEPTION 'INVALID_CHECKIN_METHOD';
  END IF;

  SELECT *
  INTO v_existing
  FROM public.check_ins
  WHERE user_id = v_user_id
    AND created_at::date = timezone('America/Sao_Paulo', now())::date
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing.id IS NOT NULL THEN
    RAISE EXCEPTION 'CHECKIN_ALREADY_REGISTERED_TODAY';
  END IF;

  IF p_method = 'geo' THEN
    IF p_gym_id IS NULL OR p_lat IS NULL OR p_lng IS NULL THEN
      RAISE EXCEPTION 'MISSING_GEO_CHECKIN_DATA';
    END IF;

    SELECT *
    INTO v_gym
    FROM public.gyms
    WHERE id = p_gym_id;

    IF v_gym.id IS NULL THEN
      RAISE EXCEPTION 'GYM_NOT_FOUND';
    END IF;

    IF v_gym.lat IS NULL OR v_gym.lng IS NULL THEN
      RAISE EXCEPTION 'GYM_WITHOUT_COORDINATES';
    END IF;

    v_distance := public.calculate_distance_meters(
      p_lat,
      p_lng,
      v_gym.lat::double precision,
      v_gym.lng::double precision
    );

    IF v_distance > COALESCE(v_gym.radius, 50) THEN
      RAISE EXCEPTION 'CHECKIN_OUTSIDE_ALLOWED_RADIUS';
    END IF;

    INSERT INTO public.check_ins (user_id, gym_id, method, lat, lng)
    VALUES (v_user_id, v_gym.id, 'geo', p_lat, p_lng)
    RETURNING * INTO v_inserted;

    RETURN v_inserted;
  END IF;

  IF p_qr_code IS NULL OR btrim(p_qr_code) = '' THEN
    RAISE EXCEPTION 'MISSING_QR_CODE';
  END IF;

  SELECT *
  INTO v_equipment
  FROM public.equipment
  WHERE qr_code = btrim(p_qr_code)
  LIMIT 1;

  IF v_equipment.id IS NULL THEN
    RAISE EXCEPTION 'INVALID_QR_CODE';
  END IF;

  IF v_equipment.gym_id IS NULL THEN
    RAISE EXCEPTION 'QR_CODE_WITHOUT_GYM';
  END IF;

  INSERT INTO public.check_ins (user_id, gym_id, equipment_id, method)
  VALUES (v_user_id, v_equipment.gym_id, v_equipment.id, 'qr')
  RETURNING * INTO v_inserted;

  RETURN v_inserted;
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_check_in_secure(text, double precision, double precision, uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_posts_feed(
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  content text,
  image_url text,
  likes_count integer,
  comments_count integer,
  created_at timestamptz,
  updated_at timestamptz,
  profile_id uuid,
  profile_name text,
  profile_username text,
  profile_avatar_url text,
  user_has_liked boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.user_id,
    p.content,
    p.image_url,
    COALESCE(p.likes_count, 0) AS likes_count,
    COALESCE(p.comments_count, 0) AS comments_count,
    p.created_at,
    p.updated_at,
    pp.id AS profile_id,
    pp.name AS profile_name,
    pp.username AS profile_username,
    pp.avatar_url AS profile_avatar_url,
    EXISTS (
      SELECT 1
      FROM public.post_likes pl
      WHERE pl.post_id = p.id
        AND pl.user_id = auth.uid()
    ) AS user_has_liked
  FROM public.posts p
  LEFT JOIN public.profiles_public pp
    ON pp.id = p.user_id
  ORDER BY p.created_at DESC
  LIMIT GREATEST(COALESCE(p_limit, 10), 1)
  OFFSET GREATEST(COALESCE(p_offset, 0), 0);
$$;

GRANT EXECUTE ON FUNCTION public.get_posts_feed(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_posts_feed(integer, integer) TO anon;

CREATE OR REPLACE FUNCTION public.get_active_goals_with_progress()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  type text,
  target integer,
  unit text,
  title text,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  current integer,
  percentage integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_week_start date := date_trunc('week', timezone('America/Sao_Paulo', now()))::date;
  v_week_end date := (date_trunc('week', timezone('America/Sao_Paulo', now()))::date + 6);
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  RETURN QUERY
  WITH active_goals AS (
    SELECT *
    FROM public.user_goals
    WHERE user_id = v_user_id
      AND is_active = true
  ),
  workout_progress AS (
    SELECT
      count(*)::integer AS workout_count
    FROM public.check_ins
    WHERE user_id = v_user_id
      AND created_at::date BETWEEN v_week_start AND v_week_end
  ),
  habit_progress AS (
    SELECT
      habit_type,
      count(*)::integer AS habit_count
    FROM public.habit_logs
    WHERE user_id = v_user_id
      AND completed = true
      AND date BETWEEN v_week_start AND v_week_end
    GROUP BY habit_type
  )
  SELECT
    g.id,
    g.user_id,
    g.type,
    g.target,
    g.unit,
    g.title,
    g.is_active,
    g.created_at,
    g.updated_at,
    CASE
      WHEN g.type = 'workout' THEN COALESCE((SELECT workout_count FROM workout_progress), 0)
      ELSE COALESCE((SELECT habit_count FROM habit_progress hp WHERE hp.habit_type = g.type), 0)
    END AS current,
    LEAST(
      ROUND(
        (
          CASE
            WHEN g.type = 'workout' THEN COALESCE((SELECT workout_count FROM workout_progress), 0)
            ELSE COALESCE((SELECT habit_count FROM habit_progress hp WHERE hp.habit_type = g.type), 0)
          END::numeric / NULLIF(g.target, 0)::numeric
        ) * 100
      )::integer,
      100
    ) AS percentage
  FROM active_goals g
  ORDER BY g.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_active_goals_with_progress() TO authenticated;

CREATE OR REPLACE FUNCTION public.create_workout_with_exercises(
  p_name text,
  p_description text DEFAULT NULL,
  p_objective text DEFAULT NULL,
  p_frequency integer DEFAULT NULL,
  p_difficulty text DEFAULT NULL,
  p_exercises jsonb DEFAULT '[]'::jsonb
)
RETURNS public.workouts
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_workout public.workouts%ROWTYPE;
  v_exercise jsonb;
  v_index integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'WORKOUT_NAME_REQUIRED';
  END IF;

  INSERT INTO public.workouts (
    user_id,
    name,
    description,
    objective,
    frequency,
    difficulty
  )
  VALUES (
    v_user_id,
    btrim(p_name),
    NULLIF(btrim(COALESCE(p_description, '')), ''),
    NULLIF(btrim(COALESCE(p_objective, '')), ''),
    p_frequency,
    NULLIF(btrim(COALESCE(p_difficulty, '')), '')
  )
  RETURNING * INTO v_workout;

  FOR v_exercise IN
    SELECT value
    FROM jsonb_array_elements(COALESCE(p_exercises, '[]'::jsonb))
  LOOP
    INSERT INTO public.workout_exercises (
      workout_id,
      equipment_id,
      name,
      sets,
      reps,
      rest_seconds,
      notes,
      order_index
    )
    VALUES (
      v_workout.id,
      NULLIF(v_exercise->>'equipment_id', '')::uuid,
      COALESCE(NULLIF(v_exercise->>'name', ''), 'Exercicio'),
      NULLIF(v_exercise->>'sets', '')::integer,
      NULLIF(v_exercise->>'reps', ''),
      NULLIF(v_exercise->>'rest_seconds', '')::integer,
      NULLIF(v_exercise->>'notes', ''),
      COALESCE(NULLIF(v_exercise->>'order_index', '')::integer, v_index)
    );

    v_index := v_index + 1;
  END LOOP;

  RETURN v_workout;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_workout_with_exercises(text, text, text, integer, text, jsonb) TO authenticated;
