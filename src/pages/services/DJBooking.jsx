// src/pages/services/DJBooking.jsx
import ServiceCatalog from './ServiceCatalog';
export default function DJBooking() {
  return (
    <ServiceCatalog
      category="dj"
      title="DJ Booking"
      subtitle="Filter by genre, browse audio/video portfolios and book top DJs for your event"
      emoji="🎧"
      heroGradient="linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"
    />
  );
}
