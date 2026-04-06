import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:3001/api/banners')
      .then(res => {
        const textBanners = res.data.banners.filter(b => b.type === 'announcement').map(b => b.content);
        if (textBanners.length > 0) {
          setAnnouncements(textBanners);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (announcements.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements]);

  if (announcements.length === 0) return null;

  return (
    <div className="announcement-bar">
      <div className="container">
        {announcements[current]}
      </div>
    </div>
  );
}
