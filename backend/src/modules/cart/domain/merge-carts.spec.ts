import { mergeCarts } from './merge-carts';

describe('mergeCarts', () => {
  const opts = { maxQuantity: 999 };

  it('server cart trống → trả guest cart', () => {
    const result = mergeCarts(
      [],
      [
        { variantId: 'a', quantity: 2 },
        { variantId: 'b', quantity: 5 },
      ],
      opts,
    );
    expect(result).toEqual([
      { variantId: 'a', quantity: 2 },
      { variantId: 'b', quantity: 5 },
    ]);
  });

  it('guest cart trống → trả server cart nguyên vẹn (kèm priceAtTime)', () => {
    const result = mergeCarts(
      [{ variantId: 'a', quantity: 3, priceAtTime: 100 }],
      [],
      opts,
    );
    expect(result).toEqual([{ variantId: 'a', quantity: 3, priceAtTime: 100 }]);
  });

  it('overlap variant → cộng dồn quantity, giữ priceAtTime của server', () => {
    const result = mergeCarts(
      [{ variantId: 'a', quantity: 2, priceAtTime: 100 }],
      [{ variantId: 'a', quantity: 3 }],
      opts,
    );
    expect(result).toEqual([{ variantId: 'a', quantity: 5, priceAtTime: 100 }]);
  });

  it('cap qty ≤ maxQuantity khi cộng vượt', () => {
    const result = mergeCarts(
      [{ variantId: 'a', quantity: 800 }],
      [{ variantId: 'a', quantity: 500 }],
      { maxQuantity: 999 },
    );
    expect(result).toEqual([{ variantId: 'a', quantity: 999 }]);
  });

  it('cap qty guest-only line vượt maxQuantity', () => {
    const result = mergeCarts(
      [],
      [{ variantId: 'a', quantity: 5000 }],
      { maxQuantity: 999 },
    );
    expect(result).toEqual([{ variantId: 'a', quantity: 999 }]);
  });

  it('bỏ guest line có quantity <= 0', () => {
    const result = mergeCarts(
      [{ variantId: 'a', quantity: 2 }],
      [
        { variantId: 'b', quantity: 0 },
        { variantId: 'c', quantity: -5 },
      ],
      opts,
    );
    expect(result).toEqual([{ variantId: 'a', quantity: 2 }]);
  });

  it('giữ server-only line khi guest không có', () => {
    const result = mergeCarts(
      [
        { variantId: 'a', quantity: 2, priceAtTime: 100 },
        { variantId: 'b', quantity: 3, priceAtTime: 200 },
      ],
      [{ variantId: 'a', quantity: 1 }],
      opts,
    );
    expect(result).toEqual([
      { variantId: 'a', quantity: 3, priceAtTime: 100 },
      { variantId: 'b', quantity: 3, priceAtTime: 200 },
    ]);
  });
});
