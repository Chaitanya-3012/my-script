import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // Verify cron secret (optional but recommended)
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const token = process.env.GITHUB_TOKEN!;
    const branch = 'counter-data';
    const filePath = 'data/counter.txt';

    // Get current file content
    const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    const fileResponse = await fetch(fileUrl, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.statusText}`);
    }

    const fileData = await fileResponse.json();
    // Edge runtime doesn't provide Node's Buffer. Use atob/btoa when available,
    // falling back to Buffer for Node runtime.
    const decodeBase64 = (b64: string) => {
      if (typeof atob === 'function') return atob(b64);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const buf = Buffer.from(b64, 'base64');
      return buf.toString('utf-8');
    };

    const currentContent = decodeBase64(fileData.content);
    const currentCount = parseInt(currentContent.trim()) || 0;
    const newCount = currentCount + 1;

    // Update file
    const updateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Update counter to ${newCount}`,
        content: (typeof btoa === 'function') ? btoa(newCount.toString()) : Buffer.from(newCount.toString()).toString('base64'),
        sha: fileData.sha,
        branch: branch,
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`Failed to update file: ${JSON.stringify(errorData)}`);
    }

    // Self-ping to keep app active
    const deploymentUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
    if (deploymentUrl) {
      try {
        await fetch(`https://${deploymentUrl}`, { method: 'HEAD' });
      } catch (pingError) {
        console.log('Self-ping failed (non-critical):', pingError);
      }
    }

    return NextResponse.json({
      success: true,
      previousCount: currentCount,
      newCount: newCount,
      timestamp: new Date().toISOString(),
      message: `Counter updated from ${currentCount} to ${newCount}`,
    });
  } catch (error: any) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Use Edge Runtime for faster cold starts
export const runtime = 'edge';
