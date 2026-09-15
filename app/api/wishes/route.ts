import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface Wish {
  id?: string;
  name: string;
  text: string;
  createdAt?: string;
  hidden?: boolean;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'wishes.json');
const ADMIN_SECRET = '2006';

function getTargetFilePath(): string {
  // In Vercel serverless environments, process.cwd() is read-only.
  // /tmp is the guaranteed writable scratch directory.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpFile = path.join('/tmp', 'wishes.json');
    if (!fs.existsSync(tmpFile)) {
      try {
        const seed = fs.existsSync(DATA_FILE) ? fs.readFileSync(DATA_FILE, 'utf-8') : '[]';
        fs.writeFileSync(tmpFile, seed, 'utf-8');
      } catch {}
    }
    return tmpFile;
  }
  return DATA_FILE;
}

function getLocalWishes(): Wish[] {
  try {
    const filePath = getTargetFilePath();
    if (!fs.existsSync(filePath)) {
      try {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, '[]', 'utf-8');
      } catch {}
      return [];
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const cleaned = raw.replace(/^\uFEFF/, '').trim();
    const parsed: Wish[] = cleaned ? JSON.parse(cleaned) : [];
    // Ensure every wish has an id and hidden property
    let changed = false;
    parsed.forEach((w, i) => {
      if (!w.id) {
        w.id = `wish_${w.createdAt ? new Date(w.createdAt).getTime() : Date.now()}_${i}`;
        changed = true;
      }
      if (typeof w.hidden !== 'boolean') {
        w.hidden = false;
        changed = true;
      }
    });
    if (changed) {
      saveLocalWishes(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Error reading local wishes:', err);
    return [];
  }
}

function saveLocalWishes(wishes: Wish[]) {
  try {
    const filePath = getTargetFilePath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(wishes, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local wishes:', err);
  }
}

function checkIsAdmin(req: Request): boolean {
  const headerKey = req.headers.get('x-admin-key');
  if (headerKey === ADMIN_SECRET) return true;
  try {
    const url = new URL(req.url);
    if (url.searchParams.get('adminKey') === ADMIN_SECRET) return true;
  } catch {}
  return false;
}

export async function GET(req: Request) {
  const isAdmin = checkIsAdmin(req);
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let wishes = getLocalWishes();

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/wishes?select=*&order=created_at.asc`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 2 }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          wishes = data;
        }
      }
    } catch (err) {
      console.error('Supabase fetch failed, using local wishes:', err);
    }
  }

  // If not admin, hide wishes marked as hidden
  if (!isAdmin) {
    wishes = wishes.filter(w => !w.hidden);
  }

  return NextResponse.json(wishes);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = (body.name || '').trim();
    const text = (body.text || '').trim();

    if (!name || !text) {
      return NextResponse.json({ error: 'Name and wish text are required' }, { status: 400 });
    }

    if (name.length > 60 || text.length > 500) {
      return NextResponse.json({ error: 'Name or wish text exceeds character limit' }, { status: 400 });
    }

    const newWish: Wish = {
      id: `wish_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      text,
      createdAt: new Date().toISOString(),
      hidden: false,
    };

    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/wishes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(newWish)
        });
      } catch (err) {
        console.error('Supabase insert error:', err);
      }
    }

    const current = getLocalWishes();
    current.push(newWish);
    saveLocalWishes(current);

    const isAdmin = checkIsAdmin(req);
    const returnList = isAdmin ? current : current.filter(w => !w.hidden);

    return NextResponse.json({ success: true, wish: newWish, allWishes: returnList }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

// PATCH — Toggle Hide / Unhide (Admin only with code 2006)
export async function PATCH(req: Request) {
  try {
    if (!checkIsAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized. Admin passcode 2006 required.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, createdAt, text, hidden } = body;

    const current = getLocalWishes();
    const wishIndex = current.findIndex(w => 
      (id && w.id === id) || 
      (createdAt && w.createdAt === createdAt) || 
      (text && w.text === text)
    );

    if (wishIndex === -1) {
      return NextResponse.json({ error: 'Wish not found' }, { status: 404 });
    }

    current[wishIndex].hidden = Boolean(hidden);
    saveLocalWishes(current);

    // Update in Supabase if enabled
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey && (id || createdAt)) {
      try {
        const query = id ? `id=eq.${id}` : `created_at=eq.${createdAt}`;
        await fetch(`${supabaseUrl}/rest/v1/wishes?${query}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ hidden: Boolean(hidden) })
        });
      } catch (err) {
        console.error('Supabase patch error:', err);
      }
    }

    return NextResponse.json({ success: true, updatedWish: current[wishIndex], allWishes: current });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

// DELETE — Permanently Delete Wish (Admin only with code 2006)
export async function DELETE(req: Request) {
  try {
    if (!checkIsAdmin(req)) {
      return NextResponse.json({ error: 'Unauthorized. Admin passcode 2006 required.' }, { status: 403 });
    }

    const body = await req.json();
    const { id, createdAt, text } = body;

    const current = getLocalWishes();
    const filtered = current.filter(w => {
      if (id && w.id === id) return false;
      if (createdAt && w.createdAt === createdAt) return false;
      if (text && w.text === text) return false;
      return true;
    });

    saveLocalWishes(filtered);

    // Delete in Supabase if enabled
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey && (id || createdAt)) {
      try {
        const query = id ? `id=eq.${id}` : `created_at=eq.${createdAt}`;
        await fetch(`${supabaseUrl}/rest/v1/wishes?${query}`, {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        });
      } catch (err) {
        console.error('Supabase delete error:', err);
      }
    }

    return NextResponse.json({ success: true, allWishes: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
