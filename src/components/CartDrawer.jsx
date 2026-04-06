import { X, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`} id="cart-drawer">
        <div className="cart-drawer-header">
          <h2>
            <ShoppingCart size={22} />
            ตะกร้าสินค้า ({totalItems})
          </h2>
          <button className="cart-drawer-close" onClick={() => setIsOpen(false)} id="cart-close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>ตะกร้าว่างเปล่า</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                เลือกสินค้าที่คุณต้องการเพิ่มลงตะกร้า
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-image">{item.emoji}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">
                    {(item.price * item.quantity).toLocaleString()} ฿
                  </div>
                  <div className="cart-item-controls">
                    <button
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="cart-qty">{item.quantity}</span>
                    <button
                      className="cart-qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button
                  className="cart-item-remove"
                  onClick={() => removeItem(item.id)}
                  title="ลบสินค้า"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total">
              <span className="cart-total-label">ราคารวม</span>
              <span className="cart-total-amount">{totalPrice.toLocaleString()} ฿</span>
            </div>
            <Link
              to="/checkout"
              className="btn btn-primary btn-lg cart-checkout-btn"
              onClick={() => setIsOpen(false)}
              id="checkout-btn"
            >
              ดำเนินการสั่งซื้อ
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
