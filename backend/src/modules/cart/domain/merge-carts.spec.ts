import { CartLine, calculateCartTotal, mergeCarts } from './merge-carts';

const line = (variantId: string, quantity: number, priceAtTime?: string): CartLine => ({
  variantId,
  quantity,
  priceAtTime,
});

describe('mergeCarts', () => {
  it('server rỗng + guest rỗng → []', () => {
    expect(mergeCarts([], [])).toEqual([]);
  });

  it('chỉ có server → giữ nguyên (clone)', () => {
    const server = [line('v1', 2), line('v2', 3)];
    const result = mergeCarts(server, []);
    expect(result).toEqual(server);
    expect(result).not.toBe(server);
    expect(result[0]).not.toBe(server[0]);
  });

  it('chỉ có guest → copy guest', () => {
    const guest = [line('v1', 1, '99.00')];
    expect(mergeCarts([], guest)).toEqual([
      { variantId: 'v1', quantity: 1, priceAtTime: '99.00' },
    ]);
  });

  it('overlap: server[v1=2] + guest[v1=3] → [v1=5]', () => {
    expect(mergeCarts([line('v1', 2)], [line('v1', 3)])).toEqual([
      { variantId: 'v1', quantity: 5, priceAtTime: undefined },
    ]);
  });

  it('overlap giữ priceAtTime của server, không bị guest đè', () => {
    const server = [line('v1', 1, '100.00')];
    const guest = [line('v1', 2, '99.00')];
    expect(mergeCarts(server, guest)).toEqual([
      { variantId: 'v1', quantity: 3, priceAtTime: '100.00' },
    ]);
  });

  it('mix: server[v1, v2] + guest[v2 cộng dồn, v3 mới]', () => {
    const server = [line('v1', 1, 'p1'), line('v2', 2, 'p2')];
    const guest = [line('v2', 3, 'pX'), line('v3', 4, 'p3')];
    expect(mergeCarts(server, guest)).toEqual([
      { variantId: 'v1', quantity: 1, priceAtTime: 'p1' },
      { variantId: 'v2', quantity: 5, priceAtTime: 'p2' },
      { variantId: 'v3', quantity: 4, priceAtTime: 'p3' },
    ]);
  });

  it('cap quantity ở maxQuantity (default 999)', () => {
    const server = [line('v1', 500)];
    const guest = [line('v1', 600)];
    expect(mergeCarts(server, guest)).toEqual([
      { variantId: 'v1', quantity: 999, priceAtTime: undefined },
    ]);
  });

  it('cap quantity với option custom', () => {
    expect(mergeCarts([line('v1', 5)], [line('v1', 10)], { maxQuantity: 8 })).toEqual([
      { variantId: 'v1', quantity: 8, priceAtTime: undefined },
    ]);
  });

  it('cap khi guest item mới quá maxQuantity', () => {
    expect(mergeCarts([], [line('v1', 5000)])).toEqual([
      { variantId: 'v1', quantity: 999, priceAtTime: undefined },
    ]);
  });

  it('skip guest item có quantity <= 0 (input bẩn từ localStorage)', () => {
    expect(mergeCarts([line('v1', 1)], [line('v1', 0), line('v2', -1)])).toEqual([
      { variantId: 'v1', quantity: 1, priceAtTime: undefined },
    ]);
  });

  it('không mutate input arrays', () => {
    const server = [line('v1', 1)];
    const guest = [line('v1', 2)];
    const serverFrozen = JSON.parse(JSON.stringify(server));
    const guestFrozen = JSON.parse(JSON.stringify(guest));
    mergeCarts(server, guest);
    expect(server).toEqual(serverFrozen);
    expect(guest).toEqual(guestFrozen);
  });

  it('thứ tự: server giữ nguyên, guest mới append cuối theo thứ tự xuất hiện', () => {
    const result = mergeCarts(
      [line('a', 1), line('b', 1)],
      [line('z', 1), line('a', 1), line('y', 1)],
    );
    expect(result.map((l) => l.variantId)).toEqual(['a', 'b', 'z', 'y']);
  });
});

describe('calculateCartTotal', () => {
  it('cart rỗng → 0', () => {
    expect(calculateCartTotal([], new Map())).toBe(0);
  });

  it('tính tổng = sum(price * quantity)', () => {
    const lines = [line('v1', 2), line('v2', 3)];
    const prices = new Map([
      ['v1', 100],
      ['v2', 50],
    ]);
    expect(calculateCartTotal(lines, prices)).toBe(350);
  });

  it('skip line không có giá (variant đã xoá khỏi catalog)', () => {
    const lines = [line('v1', 2), line('v_missing', 3)];
    const prices = new Map([['v1', 100]]);
    expect(calculateCartTotal(lines, prices)).toBe(200);
  });

  it('xử lý decimal qua price float', () => {
    const lines = [line('v1', 3)];
    const prices = new Map([['v1', 9.99]]);
    expect(calculateCartTotal(lines, prices)).toBeCloseTo(29.97, 2);
  });
});
