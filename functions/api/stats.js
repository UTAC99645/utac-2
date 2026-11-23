// ============================================================
// Pages Function: GET /api/stats
// 职责：服务端代理 Cloudflare GraphQL Analytics，给统计页喂真实数据
// 安全：API Token 只存于 Pages 环境变量（CF_STATS_TOKEN），
//       永不出现在前端代码 / 构建产物 / 响应体中
// 权限：Token 仅需 Zone -> Analytics -> Read（只读、限本 zone）
// 缓存：响应缓存 10 分钟，省 API 配额
// 降级：无 Token / API 失败时返回 ok:false，前端优雅回退
// ============================================================

/** 默认 zone（utac.top）；可用环境变量 CF_ZONE_ID 覆盖 */
const DEFAULT_ZONE_ID = "cdd8c1a88d35db9a5a062d1bcd731e8f";
/** GraphQL API 端点 */
const GRAPHQL_ENDPOINT = "https://api.cloudflare.com/client/v4/graphql";
/** 响应缓存时长（秒） */
const CACHE_TTL = 600;
/** 统计回看天数 */
const DAYS = 30;

/** YYYY-MM-DD（UTC） */
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

/** JSON 响应小工具 */
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": `public, max-age=${CACHE_TTL}`
    }
  });
}

/**
 * 拉取每日请求序列（近 30 天）
 * 数据集：zones -> httpRequests1dGroups（按天聚合）
 */
async function fetchDaily(token, zoneTag, since, until) {
  const query = `
    query($zone: String!, $since: Date!, $until: Date!) {
      viewer {
        zones(filter: { zoneTag: $zone }) {
          httpRequests1dGroups(
            limit: 31,
            filter: { date_geq: $since, date_leq: $until },
            orderBy: [date_ASC]
          ) {
            dimensions { date }
            sum { requests pageViews }
            uniq { uniques }
          }
        }
      }
    }`;
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${token}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query,
      variables: { zone: zoneTag, since, until }
    })
  });
  if (!res.ok) throw new Error(`GraphQL HTTP ${res.status}`);
  const body = await res.json();
  if (body.errors?.length) throw new Error(body.errors[0].message);
  const groups =
    body.data?.viewer?.zones?.[0]?.httpRequests1dGroups || [];
  return groups.map((g) => ({
    date: g.dimensions.date,
    requests: g.sum?.requests ?? 0,
    pageViews: g.sum?.pageViews ?? 0,
    uniques: g.uniq?.uniques ?? 0
  }));
}

/**
 * 拉取热门路径 TOP N（按 visits 访问数）
 * 说明：该数据集 sum 里没有 requests/pageViews 字段，用 visits 度量；
 *       GraphQL 只支持按路径排序，取回后客户端按访问量排序，过滤 0 访问
 */
async function fetchTopPaths(token, zoneTag, since, until) {
  try {
    const query = `
      query($zone: String!, $since: Date!, $until: Date!) {
        viewer {
          zones(filter: { zoneTag: $zone }) {
            httpRequestsAdaptiveGroups(
              limit: 60,
              filter: { date_geq: $since, date_leq: $until },
              orderBy: [clientRequestPath_ASC]
            ) {
              dimensions { clientRequestPath }
              sum { visits }
            }
          }
        }
      }`;
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "authorization": `Bearer ${token}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        query,
        variables: { zone: zoneTag, since, until }
      })
    });
    if (!res.ok) return [];
    const body = await res.json();
    if (body.errors?.length) return [];
    const groups =
      body.data?.viewer?.zones?.[0]?.httpRequestsAdaptiveGroups || [];
    return groups
      .map((g) => ({
        path: g.dimensions.clientRequestPath || "/",
        visits: g.sum?.visits ?? 0
      }))
      .filter((r) => r.visits > 0)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);
  } catch {
    return [];
  }
}

/** Pages Functions 入口（仅 GET） */
export const onRequestGet = async ({ env }) => {
  const token = env?.CF_STATS_TOKEN;
  if (!token) {
    return json(
      { ok: false, error: "stats token not configured" },
      503
    );
  }
  const zoneTag = env?.CF_ZONE_ID || DEFAULT_ZONE_ID;

  const until = isoDate(new Date());
  const since = isoDate(new Date(Date.now() - (DAYS - 1) * 86400000));

  try {
    const days = await fetchDaily(token, zoneTag, since, until);
    const routes = await fetchTopPaths(token, zoneTag, since, until);
    const totals = days.reduce(
      (acc, d) => ({
        requests: acc.requests + d.requests,
        pageViews: acc.pageViews + d.pageViews,
        uniques: acc.uniques + d.uniques
      }),
      { requests: 0, pageViews: 0, uniques: 0 }
    );
    return json({
      ok: true,
      range: { since, until, days: DAYS },
      totals,
      days,
      routes
    });
  } catch (err) {
    return json({ ok: false, error: String(err).slice(0, 200) }, 502);
  }
};
