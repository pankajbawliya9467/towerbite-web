'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { AccountMenu } from './AccountMenu';
import { Icon } from './Icon';
import { LocationMenu } from './LocationMenu';
import { LogoMark, Wordmark } from './Logo';
import { SearchBox } from './SearchBox';

type Props = {
  location?: { slug: string; name: string };
  /** show the search box (home) */
  search?: boolean;
  /** show the Cart link */
  cart?: boolean;
  /** simple page title instead of the navigation (checkout) */
  title?: string;
};

export function TopBar({ location, search, cart: showCart, title }: Props) {
  const { cart, count } = useCart();
  return (
    <header className="top">
      <Link href={location ? `/${location.slug}` : '/'} className="logo" aria-label="TowerBites home">
        <LogoMark size={34} />
        <span className="logo-word"><Wordmark /></span>
      </Link>
      {title ? (
        <span style={{ color: 'var(--sub)', fontSize: 15 }}>{title}</span>
      ) : (
        <>
          {location && <LocationMenu slug={location.slug} name={location.name} />}
          {search && location && <SearchBox slug={location.slug} />}
          <nav className="top-right">
            <Link href="/lunch" className="hide-sm">Lunch</Link>
            <Link href="/orders" className="hide-sm">Orders</Link>
            {showCart && (
              <Link href={cart ? `/${cart.cafe.locationSlug}/${cart.cafe.slug}` : '/checkout'} className="cart-btn" aria-label={`Cart, ${count} items`}>
                <Icon name="bag" style={{ fontSize: 18 }} />
                <span><span className="lbl">Cart</span>{count > 0 ? <span className="lbl"> · </span> : null}{count > 0 ? count : null}</span>
              </Link>
            )}
            <AccountMenu />
          </nav>
        </>
      )}
    </header>
  );
}
