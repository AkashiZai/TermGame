import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CategoryCards() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:3001/api/categories'),
      axios.get('http://localhost:3001/api/products')
    ]).then(([catRes, prodRes]) => {
      setCategories(catRes.data.categories);
      setProducts(prodRes.data.products);
    }).catch(console.error);
  }, []);

  const getProductCount = (catId) => products.filter(p => p.category === catId && p.isActive).length;

  return (
    <section className="section" style={{ paddingTop: '1rem' }}>
      <div className="container">
        <h2 style={{ fontSize: '13px', color: 'var(--color-primary)', margin: '0 0 8px 0', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '2px' }}>Categories</h2>
        <h3 style={{ fontSize: '28px', fontWeight: '800', marginBottom: 'var(--space-2xl)', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>เลือกหมวดหมู่ที่ต้องการ</h3>

        <div className="category-banner-grid">
          {categories.map((cat) => (
            <div key={cat.id} className={`category-banner-card cat-theme-${cat.color || 'primary'}`}>
              
              <Link to={`/shop?category=${cat.id}`} className="category-banner-img-container">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} />
                ) : (
                  <div className="category-banner-fallback">
                    <span>{cat.emoji || '📦'}</span>
                  </div>
                )}
              </Link>

              <div className="category-banner-body">
                <div className="category-banner-info">
                  <Link to={`/shop?category=${cat.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3>{cat.name}</h3>
                  </Link>
                  <p>มีสินค้าทั้งหมด {getProductCount(cat.id)} ชิ้น</p>
                </div>

                <Link to={`/shop?category=${cat.id}`} className="btn-banner-action">
                   สินค้าทั้งหมด
                </Link>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
