'use client';

import { useRef, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import { useLanguage } from '../../lib/LanguageContext';
import { CATEGORIES } from '../../lib/categories';
import { GEORGIAN_CITIES } from '../../lib/cities';
import { VIP_TIERS } from '../../lib/vip';

type Errors = {
  name?: boolean;
  price?: boolean;
  description?: boolean;
  photo?: boolean;
  phone?: boolean;
  category?: boolean;
  city?: boolean;
};

type PhotoItem = {
  file: File;
  preview: string;
};

export default function SellerPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [vipTier, setVipTier] = useState<(typeof VIP_TIERS)[number]['key']>('day');

  // Multiple photos now — first one is the cover image (products.image_url),
  // the rest are saved as extra angles in product_images.
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const photosRef = useRef<PhotoItem[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const tierLabel = (key: (typeof VIP_TIERS)[number]['key']) => {
    if (key === 'day') return t('seller.tierDay');
    if (key === 'week') return t('seller.tierWeek');
    return t('seller.tierMonth');
  };

  const MAX_PHOTOS = 6;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const all = Array.from(fileList);
    if (all.length === 0) return;

    // Use ref for synchronous current count — avoids side-effects inside updater
    const currentCount = photosRef.current.length;
    const room = MAX_PHOTOS - currentCount;
    const limited = all.slice(0, Math.max(0, room));
    if (limited.length === 0) return;

    const startIdx = currentCount;

    // Add photos immediately with blob URL previews
    const toAdd: PhotoItem[] = limited.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    const next = [...photosRef.current, ...toAdd];
    photosRef.current = next;
    setPhotos(next);
    setErrors((prev) => ({ ...prev, photo: false }));

    // Start FileReader for every file NOW (synchronously, before any await/timer)
    // so Android doesn't revoke access to gallery File objects.
    limited.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPhotos((p) => {
          const updated = [...p];
          const target = startIdx + idx;
          if (updated[target]?.file === file) {
            updated[target] = { ...updated[target], preview: dataUrl };
            photosRef.current = updated;
          }
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const next = photosRef.current.filter((_, i) => i !== index);
    photosRef.current = next;
    setPhotos(next);
  };

  const movePhotoToCover = (index: number) => {
    if (index === 0) return;
    const next = [...photosRef.current];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    photosRef.current = next;
    setPhotos(next);
  };

  const validate = (): Errors => ({
    name: name.trim() === '',
    price: price.trim() === '',
    description: description.trim() === '',
    photo: photos.length === 0,
    phone: phone.trim() === '',
    category: category.trim() === '',
    city: city.trim() === '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    setStatus('idle');

    try {
      // Resize + convert to JPEG before upload (handles large camera photos on Android)
      const resizeForUpload = (file: File): Promise<File> =>
        new Promise((resolve) => {
          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            URL.revokeObjectURL(url);
            const MAX = 1600;
            let w = img.naturalWidth, h = img.naturalHeight;
            if (w > MAX || h > MAX) {
              if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
              else { w = Math.round(w * MAX / h); h = MAX; }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) { resolve(file); return; }
            ctx.drawImage(img, 0, 0, w, h);
            canvas.toBlob((blob) => {
              if (!blob) { resolve(file); return; }
              resolve(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
            }, 'image/jpeg', 0.85);
          };
          img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
          img.src = url;
        });

      const uploadedUrls: string[] = [];
      for (const photo of photos) {
        const file = await resizeForUpload(photo.file);
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        uploadedUrls.push(publicUrlData.publicUrl);
      }

      const coverUrl = uploadedUrls[0] ?? null;
      const extraUrls = uploadedUrls.slice(1);

      const vipExpiresAt = isVip
        ? (() => {
            const tier = VIP_TIERS.find((tr) => tr.key === vipTier)!;
            const d = new Date();
            d.setDate(d.getDate() + tier.days);
            return d.toISOString();
          })()
        : null;

      const { data: inserted, error } = await supabase
        .from('products')
        .insert([
          {
            name,
            price: Number(price),
            description,
            is_vip: isVip,
            vip_expires_at: vipExpiresAt,
            image_url: coverUrl,
            user_id: user?.id,
            phone,
            category,
            city,
          },
        ])
        .select('id')
        .single();

      if (error) throw error;

      // Save any additional angles.
      if (extraUrls.length > 0 && inserted) {
        const rows = extraUrls.map((url, i) => ({
          product_id: inserted.id,
          image_url: url,
          sort_order: i,
        }));
        const { error: imagesError } = await supabase.from('product_images').insert(rows);
        // Non-fatal: the listing itself already succeeded with its cover photo.
        if (imagesError) console.error('Extra photos failed to save:', imagesError);
      }

      setStatus('success');
      setName('');
      setPrice('');
      setDescription('');
      setPhone('');
      setCategory('');
      setCity('');
      setIsVip(false);
      setVipTier('day');
      setPhotos([]);
      setErrors({});
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Unknown error');
      setStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (hasError?: boolean) =>
    `bg-input-bg border rounded-lg px-4 py-3 text-sm outline-none transition-colors placeholder:text-text-muted/60 ${
      hasError
        ? 'border-red-500/70 focus:border-red-500'
        : 'border-border-subtle focus:border-vip-border'
    }`;

  return (
    <div className="bg-brand-bg min-h-screen text-text-primary">
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-24">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('seller.title')}</h1>
          <p className="text-text-muted">{t('seller.subtitle')}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-card-bg border border-border-subtle rounded-2xl p-8 flex flex-col gap-6"
        >
          {/* Photo upload — now supports multiple photos */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-text-muted">
              {t('seller.photo')} <span className="text-vip-border font-bold">*</span>
              <span className="text-text-muted font-normal"> — მაქს. {MAX_PHOTOS}, პირველი იქნება მთავარი</span>
            </label>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {photos.map((photo, i) => (
                  <div
                    key={photo.preview}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                      i === 0 ? 'border-vip-border' : 'border-border-subtle'
                    }`}
                  >
                    <img
                      src={photo.preview}
                      alt={`ფოტო ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 bg-vip-border text-black text-[10px] font-semibold rounded-full px-2 py-0.5">
                        მთავარი
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white text-xs rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                    >
                      ✕
                    </button>
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => movePhotoToCover(i)}
                        className="absolute bottom-1 left-1 right-1 bg-black/70 hover:bg-black text-white text-[10px] rounded-md py-1 transition-colors"
                      >
                        მთავარად დაყენება
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {photos.length < MAX_PHOTOS && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  handleFiles(e.dataTransfer.files);
                }}
                className={`relative rounded-lg border-2 border-dashed transition-colors overflow-hidden ${
                  errors.photo
                    ? 'border-red-500/70'
                    : dragActive
                    ? 'border-vip-border bg-vip-border/5'
                    : 'border-border-subtle'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />

                <div className="flex flex-col items-center justify-center gap-4 p-10">
                  <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h16M4 4h16v16H4V4z"
                    />
                  </svg>
                  <p className="text-sm text-text-muted text-center">{t('seller.dragDropText')}</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center gap-2 bg-vip-border/10 border border-vip-border/40 hover:border-vip-border text-vip-text text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                    >
                      {t('seller.takePhoto')}
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 bg-input-bg border border-border-subtle hover:border-vip-border/50 text-text-primary text-sm font-medium rounded-lg px-4 py-2 transition-colors"
                    >
                      {t('seller.chooseFromGallery')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {errors.photo && <p className="text-xs text-red-400">{t('seller.photoRequired')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-muted">
              {t('seller.name')} <span className="text-vip-border font-bold">*</span>
            </label>
            <input
              type="text"
              placeholder={t('seller.namePlaceholder')}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) setErrors((p) => ({ ...p, name: false }));
              }}
              className={fieldClass(errors.name)}
            />
            {errors.name && <p className="text-xs text-red-400">{t('seller.nameRequired')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-muted">
              {t('seller.price')} <span className="text-vip-border font-bold">*</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="0.00"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (e.target.value.trim()) setErrors((p) => ({ ...p, price: false }));
              }}
              className={fieldClass(errors.price)}
            />
            {errors.price && <p className="text-xs text-red-400">{t('seller.priceRequired')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-muted">
              {t('seller.description')} <span className="text-vip-border font-bold">*</span>
            </label>
            <textarea
              rows={4}
              placeholder={t('seller.descriptionPlaceholder')}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (e.target.value.trim()) setErrors((p) => ({ ...p, description: false }));
              }}
              className={`${fieldClass(errors.description)} resize-none`}
            />
            {errors.description && <p className="text-xs text-red-400">{t('seller.descriptionRequired')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-muted">
              {t('seller.phone')} <span className="text-vip-border font-bold">*</span>
            </label>
            <input
              type="tel"
              placeholder={t('seller.phonePlaceholder')}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (e.target.value.trim()) setErrors((p) => ({ ...p, phone: false }));
              }}
              className={fieldClass(errors.phone)}
            />
            {errors.phone && <p className="text-xs text-red-400">{t('seller.phoneRequired')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-muted">
              {t('seller.category')} <span className="text-vip-border font-bold">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (e.target.value) setErrors((p) => ({ ...p, category: false }));
              }}
              className={`${fieldClass(errors.category)} appearance-none cursor-pointer`}
            >
              <option value="">{t('seller.categoryPlaceholder')}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-400">{t('seller.categoryRequired')}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-muted">
              {t('seller.city')} <span className="text-vip-border font-bold">*</span>
            </label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (e.target.value) setErrors((p) => ({ ...p, city: false }));
              }}
              className={`${fieldClass(errors.city)} appearance-none cursor-pointer`}
            >
              <option value="">{t('seller.cityPlaceholder')}</option>
              {GEORGIAN_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.city && <p className="text-xs text-red-400">{t('seller.cityRequired')}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <span className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="w-10 h-6 bg-input-bg border border-border-subtle rounded-full peer-checked:bg-vip-border/30 peer-checked:border-vip-border transition-colors" />
                <span className="absolute left-1 top-1 w-4 h-4 bg-text-muted peer-checked:bg-vip-text peer-checked:translate-x-4 rounded-full transition-transform" />
              </span>
              <span className="text-sm text-text-primary">
                {t('seller.markAsVip')} <span className="text-vip-text font-medium">{t('seller.vipItem')}</span>
              </span>
            </label>

            {isVip && (
              <div className="flex flex-col gap-2 pl-1">
                {VIP_TIERS.map((tr) => (
                  <button
                    key={tr.key}
                    type="button"
                    onClick={() => setVipTier(tr.key)}
                    className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm text-left transition-colors ${
                      vipTier === tr.key
                        ? 'border-vip-border bg-vip-border/10'
                        : 'border-border-subtle hover:border-vip-border/40'
                    }`}
                  >
                    <span>{tierLabel(tr.key)}</span>
                    <span className="font-semibold text-vip-text">{tr.price.toFixed(2)} ₾</span>
                  </button>
                ))}
                <p className="text-xs text-text-muted bg-input-bg border border-border-subtle rounded-lg px-3 py-2">
                  {t('seller.testModeNotice')}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-vip-border text-black font-semibold rounded-lg py-3 hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {submitting ? t('seller.submitting') : t('seller.submit')}
          </button>

          {status === 'success' && (
            <p className="text-sm text-center text-emerald-400">{t('seller.successMessage')}</p>
          )}
          {status === 'error' && (
            <p className="text-sm text-center text-red-400">
              {t('seller.errorPrefix')}: {errorMsg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}