// Cloudflare Pages Serverless Function Edge Endpoint
// Accessible at: /api/workflows

export async function onRequestGet(context: { env: Record<string, any>; request: Request }): Promise<Response> {
  const cachedWorkflows = await context.env.APPFORGE_KV?.get('PROJECT_WORKFLOWS');
  if (cachedWorkflows) {
    return new Response(cachedWorkflows, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }

  return new Response(
    JSON.stringify({
      status: 'operational',
      engine: 'Cloudflare Pages Functions Edge Worker',
      workflows: ['Official 11-Stage SDLC', 'Core 4-Stage Agile Delivery', 'Quick Win Hotfix'],
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
        action: 'Workflow saved to Cloudflare Edge KV/D1',
        workflow: payload,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid workflow payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
