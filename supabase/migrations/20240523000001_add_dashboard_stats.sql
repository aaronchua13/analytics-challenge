CREATE OR REPLACE FUNCTION get_dashboard_summary(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_posts INTEGER;
  total_engagement INTEGER;
  total_reach INTEGER;
  avg_rate NUMERIC;
  top_post json;
  
  -- Trends
  current_engagement INTEGER;
  previous_engagement INTEGER;
  engagement_trend NUMERIC;
  
  current_reach INTEGER;
  previous_reach INTEGER;
  reach_trend NUMERIC;
  
  current_rate NUMERIC;
  previous_rate NUMERIC;
  rate_trend NUMERIC;
  
  result json;
BEGIN
  -- 1. Main Stats (All time)
  SELECT 
    count(*),
    COALESCE(sum(likes + comments + shares + saves), 0),
    COALESCE(sum(reach), 0),
    COALESCE(avg(engagement_rate), 0)
  INTO 
    total_posts,
    total_engagement,
    total_reach,
    avg_rate
  FROM posts
  WHERE user_id = p_user_id;

  -- 2. Top Post
  SELECT row_to_json(t)
  INTO top_post
  FROM (
    SELECT * 
    FROM posts 
    WHERE user_id = p_user_id 
    ORDER BY engagement_rate DESC 
    LIMIT 1
  ) t;

  -- 3. Trends (Last 30 days vs Previous 30 days)
  
  -- Engagement
  SELECT COALESCE(SUM(likes + comments + shares + saves), 0) INTO current_engagement
  FROM posts WHERE user_id = p_user_id AND posted_at >= NOW() - INTERVAL '30 days';
  
  SELECT COALESCE(SUM(likes + comments + shares + saves), 0) INTO previous_engagement
  FROM posts WHERE user_id = p_user_id AND posted_at >= NOW() - INTERVAL '60 days' AND posted_at < NOW() - INTERVAL '30 days';
  
  IF previous_engagement > 0 THEN
    engagement_trend := round(((current_engagement - previous_engagement)::numeric / previous_engagement) * 100, 1);
  ELSE
    engagement_trend := 0;
  END IF;

  -- Reach
  SELECT COALESCE(SUM(reach), 0) INTO current_reach
  FROM posts WHERE user_id = p_user_id AND posted_at >= NOW() - INTERVAL '30 days';
  
  SELECT COALESCE(SUM(reach), 0) INTO previous_reach
  FROM posts WHERE user_id = p_user_id AND posted_at >= NOW() - INTERVAL '60 days' AND posted_at < NOW() - INTERVAL '30 days';
  
  IF previous_reach > 0 THEN
    reach_trend := round(((current_reach - previous_reach)::numeric / previous_reach) * 100, 1);
  ELSE
    reach_trend := 0;
  END IF;

  -- Rate
  SELECT COALESCE(AVG(engagement_rate), 0) INTO current_rate
  FROM posts WHERE user_id = p_user_id AND posted_at >= NOW() - INTERVAL '30 days';
  
  SELECT COALESCE(AVG(engagement_rate), 0) INTO previous_rate
  FROM posts WHERE user_id = p_user_id AND posted_at >= NOW() - INTERVAL '60 days' AND posted_at < NOW() - INTERVAL '30 days';
  
  IF previous_rate > 0 THEN
    rate_trend := round(((current_rate - previous_rate)::numeric / previous_rate) * 100, 1);
  ELSE
    rate_trend := 0;
  END IF;

  -- Build Result
  result := json_build_object(
    'totalPosts', total_posts,
    'totalEngagement', total_engagement,
    'totalReach', total_reach,
    'avgEngagementRate', round(avg_rate, 2),
    'topPost', top_post,
    'trends', json_build_object(
      'engagement', engagement_trend,
      'reach', reach_trend,
      'rate', rate_trend
    )
  );

  RETURN result;
END;
$$;
