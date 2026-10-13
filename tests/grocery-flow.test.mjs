import test from 'node:test';
import assert from 'node:assert/strict';
import { groceryCommand, validatePreview, previewMessage } from '../worker/grocery-flow.ts';
const id = 'c50ac90e-6abb-4bc9-9aa0-34feacb95e24';
const basket = () => ({ historyCheck: {source:'zepto',checkedAt:new Date().toISOString(),productVariantIds:[id]}, items: [{ name: 'Dahi', packSize: '390 g', quantity: 1, pricePaise: 3500, productVariantId: id, storeProductId: id, historicalMatch: true }], deliveryFeePaise: 0, totalPaise: 6500, addressId: id, addressLabel: 'Home', addressType: 'HOME', paymentMethod: 'WALLET', expiresAt: new Date(Date.now() + 600_000).toISOString() });
test('meal approval cannot be interpreted as a grocery purchase', () => {
  for (const reply of ['yes', 'OK', 'ठीक है', 'order', `do not ORDER ${id}`]) assert.equal(groceryCommand(reply), null);
  assert.deepEqual(groceryCommand(`ORDER ${id}`), { action: 'confirm', id });
  assert.deepEqual(groceryCommand(`CANCEL ${id}`), { action: 'cancel', id });
});
test('rejects expired, incomplete and inconsistent checkout previews', () => {
  validatePreview(basket());
  for (const changes of [{ expiresAt: 'invalid' }, { expiresAt: new Date(0).toISOString() }, { totalPaise: 10 }, { addressType: 'WORK' }, { paymentMethod: 'COD' }, { items: [] }]) assert.throws(() => validatePreview({ ...basket(), ...changes }));
  assert.throws(() => validatePreview({ ...basket(), items: [{ ...basket().items[0], quantity: 0 }] }));
});
test('preview includes address, fees-inclusive total, history, quantities and selected payment', () => {
  const message = previewMessage(id, basket());
  for (const text of ['Home', '₹65.00', '390 g', 'Shall I order?']) assert.ok(message.includes(text));
});
test('executor pauses for humans and stops on terminal states',async()=>{
  const {executorDisposition,parseGroceryReply}=await import('../worker/grocery-flow.ts');
  for(const state of ['awaiting_choice','preview_ready']) assert.equal(executorDisposition(state),'wait');
  for(const state of ['paid','failed','cancelled','superseded']) assert.equal(executorDisposition(state),'stop');
  assert.equal(executorDisposition('payment_pending'),'reconcile');
  for(const text of ['han order pls','kardo','haan order please','ऑर्डर कर दो']) assert.equal(parseGroceryReply(text).confirm,true);
  for(const text of ['nahi sirf yahi','do not order','OK']) assert.equal(parseGroceryReply(text).confirm,false);
});

test('delivery fee is explicit and required; a fee change alters checkout terms',async()=>{
 const {checkoutTerms}=await import('../worker/grocery-flow.ts');
 const withFee={...basket(),deliveryFeePaise:3000};assert.match(previewMessage(id,withFee),/Delivery fee: ₹30.00/);
 assert.throws(()=>validatePreview({...basket(),deliveryFeePaise:undefined}));assert.notEqual(checkoutTerms(basket()),checkoutTerms(withFee));
});

test('matching item sum and total resolve an unknown fee to zero without guessing a positive fee',async()=>{
 const {resolveDeliveryFee}=await import('../worker/grocery-flow.ts');
 assert.equal(resolveDeliveryFee(7500,7500,null),0);assert.equal(resolveDeliveryFee(10500,7500,null),null);assert.equal(resolveDeliveryFee(7500,7500,3000),3000);
 const value={...basket(),totalPaise:3500,deliveryFeePaise:undefined};validatePreview(value);assert.equal(value.deliveryFeePaise,0);assert.match(previewMessage(id,value),/Delivery fee: ₹0.00/);
});
