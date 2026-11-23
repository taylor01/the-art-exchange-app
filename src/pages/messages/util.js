// "Moth Parade — Red Rocks", or the poster's own name.
export function posterTitle(poster) {
  if (!poster) return 'A poster';
  return [poster.band?.name || poster.name, poster.venue?.name].filter(Boolean).join(' — ');
}

// "4:12 PM" today, "Mon" this week, "Oct 28" before that.
export function shortTime(iso, now = new Date()) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const days = (now - d) / 86400000;
  if (days >= 0 && days < 6) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Why a closed conversation closed, for the line under the thread.
export function closedLine(c) {
  const who = c.counterpartHandle ? `@${c.counterpartHandle}` : 'The other collector';
  switch (c.closedReason) {
    case 'copy_sold': return c.role === 'buyer' ? 'This copy sold to someone else.' : 'You sold this copy to someone else.';
    case 'copy_removed': return c.role === 'buyer' ? `${who} took this copy off their wall.` : 'You took this copy off your wall.';
    case 'account_deleted': return "The other collector's account was deleted.";
    case 'closed_by_buyer': return c.role === 'buyer' ? 'You closed this conversation.' : `${who} closed this conversation.`;
    case 'closed_by_seller': return c.role === 'seller' ? 'You closed this conversation.' : `${who} closed this conversation.`;
    default: return 'This conversation is closed.';
  }
}
