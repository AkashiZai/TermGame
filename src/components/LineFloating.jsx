import { MessageCircle } from 'lucide-react';

export default function LineFloating() {
  return (
    <div className="line-floating">
      <div className="line-tooltip">💬 แชทกับเราทาง LINE</div>
      <a
        href="https://line.me/ti/p/~day_pisit"
        target="_blank"
        rel="noopener noreferrer"
        className="line-floating-btn"
        id="line-float-btn"
        title="ติดต่อเราทาง LINE"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
}
