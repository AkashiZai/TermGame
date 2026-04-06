import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const badgeClass = {
    'ยอดนิยม': 'badge-primary',
    'คุ้มค่า': 'badge-accent',
    'แนะนำ': 'badge-primary',
    'สุดคุ้ม': 'badge-accent',
    'ขายดี': 'badge-primary',
    'หายาก': 'badge-secondary',
    'พรีเมียม': 'badge-secondary',
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className={`card product-card ${isOutOfStock ? 'out-of-stock' : ''}`} id={`product-card-${product.id}`} style={{ opacity: isOutOfStock ? 0.6 : 1, position: 'relative' }}>
      <Link to={`/product/${product.id}`} className="product-card-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <span className="product-emoji">{product.emoji}</span>
        )}
        {product.badge && (
          <div className="product-card-badge">
            <span className={`badge ${badgeClass[product.badge] || 'badge-primary'}`}>
              {product.badge}
            </span>
          </div>
        )}
        {isOutOfStock && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', zIndex: 10 }}>
            สินค้าหมด
          </div>
        )}
      </Link>
      <div className="product-card-body">
        <div className="product-card-category" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>
            {product.category === 'robux' && 'เติม ROBUX'}
            {product.category === 'gamepass' && 'GAME PASS'}
            {product.category === 'fruits' && 'BLOX FRUITS'}
            {product.category === 'accounts' && 'บริการบัญชี'}
          </span>
          {product.stock > 0 && <span style={{ fontSize: '11px', color: 'var(--color-primary)' }}>คงเหลือ: {product.stock}</span>}
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="product-card-title">{product.name}</h3>
        </Link>
        <p className="product-card-desc">{product.description}</p>
        <div className="product-card-footer">
          <div className="product-price">
            {product.price.toLocaleString()}
            <span className="currency">฿</span>
          </div>
          <button
            className={`add-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              if(!isOutOfStock) addItem(product);
            }}
            title={isOutOfStock ? "สินค้าหมดแล้ว" : "เพิ่มลงตะกร้า"}
            id={`add-cart-${product.id}`}
            disabled={isOutOfStock}
            style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer', background: isOutOfStock ? '#ccc' : '', color: isOutOfStock ? '#fff' : '' }}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
