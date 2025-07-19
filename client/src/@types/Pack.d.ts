declare type Pack = {
  id: number;
  /** 暱稱 */
  nick: string;
  created_at: Date;
  displayTime: string;
  transactionId: string;
  cardIds: string;
  cards: (Card | null)[];
  pack: string;
  totalStar: number;
  names: string;
  images: string[];
  status: string | null;
  teamId: number;
  injectTime: string;
  isPartner: boolean;
  pack_id: string;
  language: string;
  friend_id: string;
  countOfWishlist?: number;
  inject_times: number;
  is_high_level: boolean;
};
