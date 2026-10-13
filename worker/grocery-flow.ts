export interface GroceryItem {
  name: string;
  packSize: string;
  quantity: number;
  pricePaise: number;
  productVariantId: string;
  storeProductId: string;
  historicalMatch: boolean;
}
export interface GroceryPreview {
  historyCheck: { source: "zepto"; checkedAt: string; productVariantIds: string[] };
  confirmationId?: string;
  alternatives?: string;
  items: GroceryItem[];
  totalPaise: number;
  deliveryFeePaise: number;
  addressId: string;
  addressLabel: string;
  expiresAt: string;
  addressType: "HOME";
  paymentMethod: "WALLET" | "PAYMENT_LINK";
}
export function groceryCommand(text: string): { action: 'confirm' | 'cancel'; id: string } | null {
  const match = text.trim().match(/^(ORDER|CANCEL)\s+([a-f0-9-]{36})$/i);
  return match ? { action: match[1].toUpperCase() === 'ORDER' ? 'confirm' : 'cancel', id: match[2].toLowerCase() } : null;
}
export function resolveDeliveryFee(totalPaise: number, itemTotalPaise: number | undefined, explicitFee: number | null | undefined): number | null {
  if(explicitFee !== null && explicitFee !== undefined) return explicitFee;
  return Number.isSafeInteger(totalPaise) && totalPaise >= 0 && Number.isSafeInteger(itemTotalPaise) && totalPaise === itemTotalPaise ? 0 : null;
}
export function validatePreview(value: GroceryPreview): void {
  if (!value || value.addressType !== 'HOME' || !['WALLET', 'PAYMENT_LINK'].includes(value.paymentMethod) || !Array.isArray(value.items) || !value.items.length || !value.addressId || !value.addressLabel) throw new Error('Items and delivery address required');
  if (!Number.isSafeInteger(value.totalPaise) || value.totalPaise <= 0) throw new Error('Invalid total');
  if (!Number.isFinite(Date.parse(value.expiresAt)) || Date.parse(value.expiresAt) <= Date.now() || Date.parse(value.expiresAt) > Date.now() + 30 * 60_000) throw new Error('Preview expiry must be within 30 minutes');
  let subtotal = 0;
  for (const item of value.items) {
    if (!item.name || !item.packSize || !item.productVariantId || !item.storeProductId || typeof item.historicalMatch !== 'boolean' || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || !Number.isSafeInteger(item.pricePaise) || item.pricePaise < 0) throw new Error('Invalid grocery item');
    subtotal += item.quantity * item.pricePaise;
  }
  value.deliveryFeePaise = resolveDeliveryFee(value.totalPaise,subtotal,value.deliveryFeePaise) as number;
  if (!Number.isSafeInteger(value.deliveryFeePaise) || value.deliveryFeePaise < 0 || value.deliveryFeePaise > value.totalPaise) throw new Error('Verified delivery fee required');
  if (value.totalPaise < subtotal + value.deliveryFeePaise) throw new Error('Total cannot be below item subtotal');
  const history = value.historyCheck;
  if (!history || history.source !== 'zepto' || !Number.isFinite(Date.parse(history.checkedAt)) || Date.parse(history.checkedAt) > Date.now() || Date.parse(history.checkedAt) < Date.now() - 30 * 60_000 || !Array.isArray(history.productVariantIds)) throw new Error('Fresh Zepto history check required for every basket');
  for (const item of value.items) {
    if (item.historicalMatch !== history.productVariantIds.includes(item.productVariantId)) throw new Error('Historical match must agree with checked Zepto history');
  }
}
export function previewMessage(_id: string, preview: GroceryPreview): string {
  return `Your basket:\n${preview.items.map(item => `• ${item.name} (${item.packSize}) × ${item.quantity} — ₹${(item.pricePaise * item.quantity / 100).toFixed(2)}`).join('\n')}\nDelivery fee: ₹${(preview.deliveryFeePaise / 100).toFixed(2)}\nTotal: ₹${(preview.totalPaise / 100).toFixed(2)}\nDeliver to: ${preview.addressLabel}\nShall I order?`;
}

// Only actionable states require executor work. Human waits never poll the merchant.
export function executorDisposition(status: string): 'execute' | 'reconcile' | 'wait' | 'stop' {
  if (['requested', 'approved'].includes(status)) return 'execute';
  if (['processing', 'payment_pending', 'reset_payment_pending'].includes(status)) return 'reconcile';
  if (['awaiting_choice', 'preview_ready'].includes(status)) return 'wait';
  return 'stop';
}
export function parseGroceryReply(text: string) {
  const normalized = text.trim().replace(/^["“”'‘’]+|["“”'‘’.!।]+$/gu, '').trim();
  const amount = normalized.match(/^(?:rs\.?|inr|₹)?\s*(\d+)(?:\s*(?:vala|wala|wale))?\s+(?:basket|cart|order)\s+(?:confirm|confirmed|approved)(?:\s+(?:hai|kar do))?$/iu);
  const confirm = !!amount || /^(?:(?:yes|yeah|yep|han|haan|ha|hanji|haanji|हाँ|हां)[,\s]+)?(?:order(?:\s+(?:it|pls|please|kar\s*do))?|place\s+(?:the\s+)?order|confirm\s+(?:the\s+)?order|kar\s*do|kardo|ऑर्डर\s+कर\s+दो)(?:\s+(?:pls|please))?$/iu.test(normalized);
  return { confirm, totalPaise: amount ? Number(amount[1]) * 100 : undefined };
}
export function checkoutTerms(preview: GroceryPreview): string {
  return JSON.stringify([preview.items.map(i => [i.productVariantId,i.storeProductId,i.quantity,i.pricePaise,i.packSize]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))),preview.totalPaise,preview.deliveryFeePaise,preview.addressId,preview.addressType,preview.paymentMethod]);
}
