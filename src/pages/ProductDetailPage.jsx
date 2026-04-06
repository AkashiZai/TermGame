import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/products')
      .then(res => setProducts(res.data.products))
      .catch(console.error);
  }, []);

  const product = products.find((p) => p.id === parseInt(id));

  if (products.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-4xl) 0' }}>
        <h2>กำลังโหลดข้อมูล...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 'var(--space-4xl) 0' }}>
        <h2>ไม่พบสินค้า</h2>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: 'var(--space-xl)' }}>
          กลับไปหน้าสินค้า
        </Link>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const categoryNames = {
    robux: 'เติม Robux',
    gamepass: 'Game Pass',
    fruits: 'ผลไม้ Blox Fruits',
    accounts: 'บริการบัญชี',
  };

  const isOutOfStock = product.stock === 0;

  return (
    <div className="container">
      <div className="product-detail">
        {/* Breadcrumb */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <Link
            to="/shop"
            style={{
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: 'var(--fs-sm)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = 'var(--color-primary)')}
            onMouseLeave={(e) => (e.target.style.color = 'var(--text-muted)')}
          >
            <ArrowLeft size={16} />
            กลับไปหน้าสินค้า
          </Link>
        </div>

        <div className="product-detail-grid">
          {/* Product Image */}
          <div className="product-detail-image" style={{ position: 'relative', opacity: isOutOfStock ? 0.6 : 1 }}>
            <span style={{ fontSize: '120px' }}>{product.emoji}</span>
            {isOutOfStock && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', zIndex: 10 }}>
                สินค้าหมด
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-detail-info">
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <span className="badge badge-primary">
                {categoryNames[product.category] || product.category}
              </span>
              {product.stock > 0 && <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>คงเหลือ: {product.stock} ชิ้น</span>}
              {isOutOfStock && <span className="badge badge-danger" style={{ background: 'var(--color-danger)' }}>สินค้าหมด</span>}
            </div>

            <h1>{product.name}</h1>

            <div className="price">
              {product.price.toLocaleString()}
              <span style={{ fontSize: 'var(--fs-xl)', color: 'var(--text-muted)', marginLeft: '4px' }}>
                ฿
              </span>
            </div>

            <p className="description">{product.description}</p>

            {/* Features */}
            {product.features && (
              <ul className="product-features" style={{ marginBottom: 'var(--space-xl)' }}>
                {product.features.map((feature, i) => (
                  <li key={i}>
                    <Check size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            {/* Actions */}
            <div className="product-detail-actions">
              <button
                className={`btn btn-primary btn-lg ${isOutOfStock ? 'disabled' : ''}`}
                onClick={() => { if(!isOutOfStock) addItem(product); }}
                id="detail-add-cart"
                disabled={isOutOfStock}
                style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer', background: isOutOfStock ? '#ccc' : '', borderColor: isOutOfStock ? '#ccc' : '' }}
              >
                <ShoppingCart size={20} />
                {isOutOfStock ? 'ไม่สามารถสั่งซื้อได้' : 'เพิ่มลงตะกร้า'}
              </button>
              <Link
                to={isOutOfStock ? "#" : "/checkout"}
                className={`btn btn-accent btn-lg ${isOutOfStock ? 'disabled' : ''}`}
                onClick={(e) => { 
                  if(isOutOfStock) { e.preventDefault(); }
                  else { addItem(product); }
                }}
                id="detail-buy-now"
                style={{ cursor: isOutOfStock ? 'not-allowed' : 'pointer', background: isOutOfStock ? '#ccc' : '', pointerEvents: isOutOfStock ? 'none' : 'auto' }}
              >
                <Zap size={20} />
                ซื้อเลย
              </Link>
            </div>

            {/* Info badges */}
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <div className="badge badge-success">✓ ได้รับทันที</div>
              <div className="badge badge-primary">🔒 ปลอดภัย 100%</div>
              <div className="badge badge-accent">⚡ บริการ 24/7</div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <h2 className="section-title">สินค้าที่เกี่ยวข้อง</h2>
          <div className="grid-products">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
