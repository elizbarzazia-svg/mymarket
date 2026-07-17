export function isVipActive(product: { is_vip: boolean; vip_expires_at?: string | null }) {
  if (!product.is_vip) return false;
  if (!product.vip_expires_at) return true; // ძველი ნივთები ვადის გარეშე — ჩაითვალოს აქტიურად
  return new Date(product.vip_expires_at) > new Date();
}

export const VIP_TIERS = [
  { key: 'day', label: '1 დღე', price: 3, days: 1 },
  { key: 'week', label: '1 კვირა', price: 15, days: 7 },
  { key: 'month', label: '1 თვე', price: 40, days: 30 },
] as const;