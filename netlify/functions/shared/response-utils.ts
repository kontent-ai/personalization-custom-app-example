export const jsonResponse = <T>(data: T, status = 200): Response =>
  new Response(JSON.stringify({ data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const errorResponse = (message: string, status = 500): Response =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
