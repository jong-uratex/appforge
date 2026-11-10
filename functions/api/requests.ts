// Cloudflare Pages Serverless Function Edge Endpoint
// Accessible at: /api/requests

export async function onRequestGet(context: { env: Record<string, any>; request: Request }): Promise<Response> {
  const cached = await context.env.APPFORGE_KV?.get('ALL_REQUESTS');
  if (cached) {
    return new Response(cached, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }

  return new Response(
    JSON.stringify({
      status: 'operational',
      environment: context.env.ENVIRONMENT || 'production',
      organization: 'Uratex Philippines (Multiflex RNC Philippines, Inc.)',
      system: 'MIS AppForge',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

export async function onRequestPost(context: { env: Record<string, any>; request: Request }): Promise<Response> {
  try {
    const payload = await context.request.json();
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Request payload received at Cloudflare Edge',
        received: payload,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid JSON payload',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
