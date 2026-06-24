import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { Product } from '@app/types';
import { ProductCard } from '../src/components/ProductCard';

const product: Product = {
  id: '1',
  name: 'Test Mug',
  slug: 'test-mug',
  description: 'A nice mug',
  price: 12.5,
  images: [],
  category: 'home',
  stock: 5,
  ratingAvg: 0,
  ratingCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('ProductCard', () => {
  it('renders the product name and price, and links to its detail page', () => {
    // MemoryRouter is needed because ProductCard uses <Link>.
    render(
      <MemoryRouter>
        <ProductCard product={product} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Test Mug')).toBeInTheDocument();
    expect(screen.getByText('$12.50')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/products/test-mug');
  });
});
