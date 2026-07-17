import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 });
  }

  // Verify the token against a real, currently-valid session. We never
  // trust a user id sent directly in the request body — the id used below
  // always comes from Supabase's own verification of the access token.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseAsUser = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userError } = await supabaseAsUser.auth.getUser();

  if (userError || !userData?.user) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  const userId = userData.user.id;

  try {
    // 1. Find this user's product images so we can clean up Storage too.
    const { data: userProducts } = await supabaseAdmin
      .from('products')
      .select('image_url')
      .eq('user_id', userId);

    const filePaths = (userProducts ?? [])
      .map((p: { image_url: string | null }) => p.image_url)
      .filter((url): url is string => Boolean(url))
      .map((url) => {
        const marker = '/product-images/';
        const idx = url.indexOf(marker);
        return idx === -1 ? null : url.slice(idx + marker.length);
      })
      .filter((path): path is string => Boolean(path));

    // 2. Delete owned rows explicitly (children before parents), regardless
    // of what ON DELETE behaviour each foreign key happens to have — this
    // way the cleanup is correct even if a cascade isn't configured.
    await supabaseAdmin.from('messages').delete().eq('sender_id', userId);
    await supabaseAdmin
      .from('conversations')
      .delete()
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
    await supabaseAdmin.from('cart_items').delete().eq('user_id', userId);
    await supabaseAdmin.from('favorites').delete().eq('user_id', userId);
    await supabaseAdmin.from('products').delete().eq('user_id', userId);

    // 3. Best-effort storage cleanup — a failure here shouldn't block the
    // actual account deletion.
    if (filePaths.length > 0) {
      try {
        await supabaseAdmin.storage.from('product-images').remove(filePaths);
      } catch {
        // non-fatal
      }
    }

    // 4. Finally, delete the auth user itself.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}