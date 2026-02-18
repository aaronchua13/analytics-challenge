CREATE OR REPLACE FUNCTION get_daily_engagement_metrics(p_user_id uuid)
RETURNS TABLE (
  date date,
  engagement bigint,
  reach bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '29 days',
      CURRENT_DATE,
      '1 day'::interval
    )::date AS day
  ),
  daily_stats AS (
    SELECT 
      p.posted_at::date AS post_date,
      SUM(p.likes + p.comments + p.shares + p.saves) AS total_engagement,
      SUM(p.reach) AS total_reach
    FROM posts p
    WHERE p.user_id = p_user_id
      AND p.posted_at >= CURRENT_DATE - INTERVAL '29 days'
    GROUP BY p.posted_at::date
  )
  SELECT 
    ds.day AS date,
    COALESCE(s.total_engagement, 0) AS engagement,
    COALESCE(s.total_reach, 0) AS reach
  FROM date_series ds
  LEFT JOIN daily_stats s ON ds.day = s.post_date
  ORDER BY ds.day ASC;
END;
$$;
