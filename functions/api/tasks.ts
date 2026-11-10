// Cloudflare Pages Serverless Function Edge Endpoint
// Accessible at: /api/tasks

export async function onRequestGet(context: { env: Record<string, any>; request: Request }): Promise<Response> {
  const cachedTasks = await context.env.APPFORGE_KV?.get('PROJECT_TASKS');
  if (cachedTasks) {
    return new Response(cachedTasks, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
      },
    });
  }

  return new Response(
    JSON.stringify({
      status: 'operational',
      engine: 'Cloudflare Pages Functions Edge Worker',
      module: 'Task Management System',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export async function onRequestPost(context: { env: Record<string, any>; request: Request }): Promise<Response> {
  try {
    const payload = await context.request.json();
    return new Response(
      JSON.stringify({
        success: true,
        action: 'Task synced at Cloudflare Edge',
        task: payload,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid task payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
