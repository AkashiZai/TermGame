import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/api/products')
      .then(res => setProducts(res.data.products))
      .catch(console.error);
      
    axios.get('http://localhost:3001/api/categories')
      .then(res => setCategories(res.data.categories))
      .catch(console.error);
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (activeCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [activeCategory, searchQuery, sortBy, products]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="container">
      <div className="shop-header">
        <h1 className="section-title">สินค้าทั้งหมด</h1>
        <p className="section-subtitle">
          เลือกสินค้าที่คุณต้องการ | มีสินค้าทั้งหมด {products.length} รายการ
        </p>
      </div>

      {/* Search */}
      <div className="shop-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="input-field"
          placeholder="ค้นหาสินค้า..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="shop-search-input"
          style={{ paddingLeft: '2.75rem' }}
        />
      </div>

      {/* Filters */}
      <div className="shop-filters">
        <button
          className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('all')}
          id="filter-all"
        >
          ทั้งหมด
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(cat.id)}
            id={`filter-${cat.id}`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}

        <select
          className="input-field"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ width: 'auto', minWidth: '150px' }}
          id="sort-select"
        >
          <option value="default">เรียงตาม</option>
          <option value="price-low">ราคา: ต่ำ → สูง</option>
          <option value="price-high">ราคา: สูง → ต่ำ</option>
          <option value="name">ชื่อสินค้า</option>
        </select>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid-products" style={{ paddingBottom: 'var(--space-4xl)' }}>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 'var(--space-4xl) 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>🔍</div>
          <h3>ไม่พบสินค้าที่ค้นหา</h3>
          <p>ลองค้นหาด้วยคำอื่น หรือเปลี่ยนหมวดหมู่</p>
        </div>
      )}
    </div>
  );
}
