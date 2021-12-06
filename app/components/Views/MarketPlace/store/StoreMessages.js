import { sha256 } from '../../../../core/CryptoSignature';

export const StoreAnnounce = (from, hashes, info) => ({
  action: 'store_announce',
  from,
  hashes,
  info,
  checksum: sha256(JSON.stringify({ from, hashes })),
});

export const StoreLookUp = (from, hash, data) => ({
  action: 'store_lookup',
  from,
  hash,
  data,
  checksum: sha256(JSON.stringify({ from, hash, data })),
});

// used to query products from a vendor's store
export const StoreQuery = (from, hash, data) => ({
  action: 'store_query',
  from,
  hash,
  data,
  checksum: sha256(JSON.stringify({ from, hash, data })),
});

export const StoreMessage = (message, from, to) => ({
  action: 'store_message',
  message,
  from,
  to,
  checksum: sha256(JSON.stringify({ message, from, to })),
  createdAt: new Date().getTime()
});