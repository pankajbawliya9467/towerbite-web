export type Location = { id: string; slug: string; name: string; area: string; city: string; cafeCount: number };
export type LocationDetail = Omit<Location, 'cafeCount'> & { towers: { id: string; name: string }[] };

export type Cafe = {
  id: string;
  locationId: string;
  slug: string;
  name: string;
  cuisines: string;
  place: string;
  emoji: string;
  coverColor: string;
  imageUrl: string | null;
  phone: string;
  rating: number;
  ratingCount: number;
  etaMin: number;
  etaMax: number;
  isOpen: boolean;
  acceptingOrders: boolean;
  tags: string[];
  sort: number;
};

export type MenuItem = {
  id: string;
  cafeId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  emoji: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isPopular: boolean;
  sort: number;
};

export type CafeWithMenu = Cafe & { categories: { id: string; name: string; sort: number }[]; items: MenuItem[] };
export type PopularItem = MenuItem & { cafe: { id: string; slug: string; name: string } };

export type Address = { tower: string; floor: string; company: string; desk: string };

export type Profile = Address & {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  locationId: string | null;
  location: { id: string; slug: string; name: string; area: string } | null;
};

export type OrderStatus = 'placed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'rejected' | 'cancelled';

export type Order = {
  id: string;
  orderNo: number;
  status: OrderStatus;
  itemsTotal: number;
  deliveryFee: number;
  total: number;
  customerPhone: string;
  address: Address;
  riderName: string | null;
  rejectReason: string | null;
  createdAt: string;
  acceptedAt: string | null;
  outAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  rejectedAt: string | null;
  cafe: { id: string; slug: string; name: string; emoji: string; coverColor: string; place: string; phone: string; etaMin: number; etaMax: number };
  location: { id: string; slug: string; name: string };
  items: { id: string; menuItemId: string; name: string; emoji: string; price: number; qty: number }[];
};

export type LunchCafe = { id: string; name: string; place: string; coverColor: string; emoji: string };
export type Lunch = {
  id: string; cafeId: string; day: string; name: string; items: string; price: number; isVeg: boolean;
  plates: number; booked: number; left: number; closesAt: string; cancelUntil: string; slots: string[];
  bookable: boolean; cafe: LunchCafe;
};
export type LunchBooking = {
  id: string; bookingNo: number; lunchId: string; day: string; slot: string; qty: number; price: number; total: number;
  status: 'booked' | 'out' | 'delivered' | 'cancelled'; address: Address; note: string | null; createdAt: string;
  canCancel: boolean; cancelUntil: string; lunch: { name: string; items: string; isVeg: boolean }; cafe: LunchCafe;
};
export type TeamItem = { menuItemId: string; name: string; emoji: string; price: number; qty: number; isAvailable: boolean };
export type TeamPerson = {
  userId: string; name: string; note: string | null; isHost: boolean; isMe: boolean; items: TeamItem[];
  amount: number; owes: number; paid: boolean; claimed: boolean;
};
export type Team = {
  id: string; code: string; name: string; deliverTo: string; deliverAt: string | null; closesAt: string;
  payMode: 'split' | 'host'; upiId: string | null; status: 'open' | 'closed' | 'placed' | 'cancelled';
  isHost: boolean; hostName: string; cafe: LunchCafe; people: TeamPerson[]; peopleWithItems: number;
  itemCount: number; total: number; toCollect: number; collected: number; me: TeamPerson | null;
  order: { id: string; orderNo: number; status: OrderStatus; total: number } | null; createdAt: string;
};
