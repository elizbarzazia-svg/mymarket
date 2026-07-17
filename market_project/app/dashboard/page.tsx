'use client';
import { CATEGORIES } from '../../lib/categories';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { supabase } from '../../lib/supabaseClient';
import { isVipActive, VIP_TIERS } from '../../lib/vip';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  is_vip: boolean;
  image_url?: string | null;
  category?: string | null;
  phone?: string | null;
  created_at?: string;
  user_id?: string;
  vip_expires_at?: string | null;
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false); 
  const [vipTarget, setVipTarget] = useState<Product | null>(null);

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setProducts(data as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async () => {
  if (!deleteTarget) return;
  setDeleting(true);
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', deleteTarget.id)
    .select();
  setDeleting(false);

  if (error) {
    alert(t('dashboard.deleteErrorPrefix') + error.message);
    return;
  }

  if (!data || data.length === 0) {
    alert(t('dashboard.deletePermissionError'));
    return;
  }

  setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
  setDeleteTarget(null);
};

  const vipCount = products.filter((p) => p.is_vip).length;

  return (
    <div className="bg-brand-bg min-h-screen text-text-primary">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('dashboard.title')}</h1>
            <p className="text-text-muted">
              {loading
                ? t('dashboard.loading')
                : `${products.length} ${t('dashboard.listingsSuffix')}, ${t('dashboard.ofWhichVip')} ${vipCount} VIP`}
            </p>
          </div>
          <Link
            href="/seller"
            className="bg-vip-border text-black font-semibold rounded-lg px-5 py-3 hover:opacity-90 transition-opacity text-center"
          >
            {t('dashboard.addNewItem')}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card-bg border border-border-subtle rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-card-bg border border-border-subtle rounded-2xl">
            <p className="text-text-muted mb-6">{t('dashboard.noItemsYet')}</p>
            <Link
              href="/seller"
              className="inline-block bg-vip-border text-black font-semibold rounded-lg px-6 py-3 hover:opacity-90 transition-opacity"
            >
              {t('dashboard.addFirstItem')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-card-bg border border-border-subtle rounded-xl overflow-hidden">
  {product.image_url ? (
    <div className="aspect-video w-full bg-input-bg">
      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
    </div>
  ) : (
    <div className="aspect-video w-full bg-input-bg flex items-center justify-center text-text-muted text-xs">
      {t('buyer.noPhoto')}
    </div>
  )}

  <div className="p-5">
    <div className="flex items-start justify-between gap-2 mb-1">
      <h3 className="font-semibold truncate">{product.name}</h3>
      {isVipActive(product) && (
        <span className="shrink-0 text-[10px] font-semibold uppercase text-vip-text bg-vip-border/15 border border-vip-border/40 rounded-full px-2 py-0.5">
          VIP
        </span>
      )}
    </div>
    <p className="text-text-muted text-sm line-clamp-2 mb-4">{product.description}</p>

    <div className="flex items-center justify-between pt-4 border-t border-border-subtle mb-3">
      <span className="text-lg font-bold">{product.price} ₾</span>
      <div className="flex gap-2">
        <button
          onClick={() => setEditing(product)}
          className="text-xs font-medium text-vip-text border border-vip-border/40 hover:border-vip-border rounded-md px-3 py-1.5 transition-colors"
        >
          {t('dashboard.edit')}
        </button>
        <button
          onClick={() => setDeleteTarget(product)}
          className="text-xs font-medium text-red-400 border border-red-500/30 hover:border-red-500/70 rounded-md px-3 py-1.5 transition-colors"
        >
          {t('dashboard.delete')}
        </button>
      </div>
    </div>

    <button
      onClick={() => setVipTarget(product)}
      className={`w-full text-xs font-semibold rounded-md py-2 transition-colors ${
        isVipActive(product)
          ? 'bg-vip-border/10 text-vip-text border border-vip-border/40 hover:border-vip-border'
          : 'bg-vip-border text-black hover:opacity-90'
      }`}
    >
      {isVipActive(product) ? t('dashboard.vipActiveExtend') : t('dashboard.makeVip')}
    </button>
  </div>
</div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <EditProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            if (!updated) {
              setEditing(null);
              return;
            }
            setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setEditing(null);
          }}
        />
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-card-bg border border-border-subtle rounded-2xl p-6 text-center"
          >
            <h3 className="text-lg font-semibold mb-2">{t('dashboard.deleteConfirmTitle')}</h3>
            <p className="text-text-muted text-sm mb-6">
              {t('dashboard.deleteConfirmPrefix')}{deleteTarget.name}{t('dashboard.deleteConfirmSuffix')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 border border-border-subtle rounded-lg py-2.5 text-sm hover:border-vip-border/40 transition-colors disabled:opacity-50"
              >
                {t('dashboard.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500/90 hover:bg-red-500 text-white rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
              >
                {deleting ? t('dashboard.deleting') : t('dashboard.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
      {vipTarget && (
  <VipPurchaseModal
    product={vipTarget}
    onClose={() => setVipTarget(null)}
    onPurchased={(updated) => {
      if (!updated) {
        setVipTarget(null);
        return;
      }
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setVipTarget(null);
    }}
  />
)}
    </div>
  );
}


function EditProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: (p: Product) => void;
}) {
  const { t } = useLanguage();
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [description, setDescription] = useState(product.description);
  const [isVip, setIsVip] = useState(product.is_vip);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(product.image_url ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState(product.category ?? '');
  const [phone, setPhone] = useState(product.phone ?? '');

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

const handleSave = async () => {
  if (!name.trim() || !price.trim() || !description.trim() || !category || !phone.trim()) {
    setError(t('dashboard.allFieldsRequired'));
    return;
  }
    setSaving(true);
    setError('');

    try {
      let imageUrl = product.image_url ?? null;

      if (photoFile) {
        const ext = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, photoFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        imageUrl = publicUrlData.publicUrl;
      }

const { data, error: updateError } = await supabase
  .from('products')
  .update({ name, price: Number(price), description, is_vip: isVip, image_url: imageUrl, category, phone })
  .eq('id', product.id)
  .select()
  .single();
      if (updateError) throw updateError;
      if (!data) throw new Error('ვერ მოხერხდა განახლებული ინფორმაციის მიღება სერვერიდან');
      onSaved(data as Product);
    } catch (err: any) {
      setError(err.message ?? t('dashboard.unknownError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8" onClick={() => !saving && onClose()}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card-bg border border-border-subtle rounded-2xl p-8"
      >
        <h2 className="text-xl font-bold mb-6">{t('dashboard.editItemTitle')}</h2>

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-text-muted block mb-2">{t('seller.photo')}</label>
            <label className="relative flex items-center justify-center rounded-lg border-2 border-dashed border-border-subtle hover:border-vip-border/50 cursor-pointer overflow-hidden transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="w-full max-h-48 object-cover" />
              ) : (
                <span className="text-sm text-text-muted py-10">{t('dashboard.uploadPhoto')}</span>
              )}
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-text-muted block mb-2">{t('seller.name')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-input-bg border border-border-subtle focus:border-vip-border rounded-lg px-4 py-3 text-sm outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-text-muted block mb-2">{t('seller.price')}</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-input-bg border border-border-subtle focus:border-vip-border rounded-lg px-4 py-3 text-sm outline-none transition-colors"
            />
          </div>

          <div>
  <label className="text-sm font-medium text-text-muted block mb-2">{t('seller.description')}</label>
  <textarea
    rows={4}
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className="w-full bg-input-bg border border-border-subtle focus:border-vip-border rounded-lg px-4 py-3 text-sm outline-none transition-colors resize-none"
  />
</div>

<div>
  <label className="text-sm font-medium text-text-muted block mb-2">{t('seller.category')}</label>
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="w-full bg-input-bg border border-border-subtle focus:border-vip-border rounded-lg px-4 py-3 text-sm outline-none transition-colors appearance-none cursor-pointer"
  >
    <option value="">{t('seller.categoryPlaceholder')}</option>
    {CATEGORIES.map((cat) => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </select>
</div>

<div>
  <label className="text-sm font-medium text-text-muted block mb-2">{t('seller.phone')}</label>
  <input
    type="tel"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    className="w-full bg-input-bg border border-border-subtle focus:border-vip-border rounded-lg px-4 py-3 text-sm outline-none transition-colors"
  />
</div>

<label className="flex items-center gap-3 cursor-pointer select-none">
            <span className="relative inline-flex items-center">
              <input type="checkbox" checked={isVip} onChange={(e) => setIsVip(e.target.checked)} className="peer sr-only" />
              <span className="w-10 h-6 bg-input-bg border border-border-subtle rounded-full peer-checked:bg-vip-border/30 peer-checked:border-vip-border transition-colors" />
              <span className="absolute left-1 top-1 w-4 h-4 bg-text-muted peer-checked:bg-vip-text peer-checked:translate-x-4 rounded-full transition-transform" />
            </span>
            <span className="text-sm">
              {t('seller.vipItem')}
            </span>
          </label>

          {error && <p className="text-sm text-red-400 text-center">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 border border-border-subtle rounded-lg py-3 text-sm hover:border-vip-border/40 transition-colors disabled:opacity-50"
            >
              {t('dashboard.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-vip-border text-black font-semibold rounded-lg py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? t('settings.saving') : t('dashboard.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function VipPurchaseModal({
  product,
  onClose,
  onPurchased,
}: {
  product: Product;
  onClose: () => void;
  onPurchased: (p: Product) => void;
}) {
  const { t } = useLanguage();
  const [selectedTier, setSelectedTier] = useState<(typeof VIP_TIERS)[number]['key']>('day');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const tier = VIP_TIERS.find((t) => t.key === selectedTier)!;

  const tierLabelKey: Record<(typeof VIP_TIERS)[number]['key'], string> = {
    day: 'seller.tierDay',
    week: 'seller.tierWeek',
    month: 'seller.tierMonth',
  };

  const handleConfirm = async () => {
    setProcessing(true);
    setError('');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + tier.days);

    const { data, error: updateError } = await supabase
      .from('products')
      .update({ is_vip: true, vip_expires_at: expiresAt.toISOString() })
      .eq('id', product.id)
      .select()
      .single();

    setProcessing(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    if (!data) {
      setError('ვერ მოხერხდა განახლებული ინფორმაციის მიღება სერვერიდან');
      return;
    }

    onPurchased(data as Product);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => !processing && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-card-bg border border-border-subtle rounded-2xl p-8"
      >
        <h2 className="text-xl font-bold mb-1">{t('dashboard.vipPurchaseTitle')}</h2>
        <p className="text-text-muted text-sm mb-6">
          {t('dashboard.vipDurationPrefix')}{product.name}{t('dashboard.vipDurationSuffix')}
        </p>

        <div className="flex flex-col gap-3 mb-6">
          {VIP_TIERS.map((vt) => (
            <button
              key={vt.key}
              onClick={() => setSelectedTier(vt.key)}
              className={`flex items-center justify-between rounded-xl border px-5 py-4 text-left transition-colors ${
                selectedTier === vt.key
                  ? 'border-vip-border bg-vip-border/10'
                  : 'border-border-subtle hover:border-vip-border/40'
              }`}
            >
              <span className="font-medium">{t(tierLabelKey[vt.key])}</span>
              <span className="font-bold text-vip-text">{vt.price.toFixed(2)} ₾</span>
            </button>
          ))}
        </div>

        <div className="bg-input-bg border border-border-subtle rounded-lg px-4 py-3 text-xs text-text-muted mb-6">
          {t('dashboard.vipTestModeNotice')}
        </div>

        {error && <p className="text-sm text-red-400 text-center mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 border border-border-subtle rounded-lg py-3 text-sm hover:border-vip-border/40 transition-colors disabled:opacity-50"
          >
            {t('dashboard.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="flex-1 bg-vip-border text-black font-semibold rounded-lg py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {processing ? t('dashboard.processing') : `${t('dashboard.confirmPurchasePrefix')} ${tier.price.toFixed(2)} ₾`}
          </button>
        </div>
      </div>
    </div>
  );
}