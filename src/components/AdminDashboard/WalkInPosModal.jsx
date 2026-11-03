import React, { useState, useMemo } from 'react';
import { Modal, Input, Select, Button, Tag, Divider, message } from 'antd';
import {
  ThunderboltOutlined,
  UserOutlined,
  PhoneOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  PrinterOutlined,
  CheckCircleFilled,
  CreditCardOutlined,
  WalletOutlined,
  MedicineBoxOutlined,
  ShoppingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';

const HOMECARE_PRODUCTS = [
  {
    id: 'prod-spf50',
    name: 'Aura Medical Sunblock Gel-Cream SPF 50+ PA++++',
    category: 'Homecare Skincare',
    duration: 'Retail 50g',
    price: 450
  },
  {
    id: 'prod-balm',
    name: 'Peptide Barrier Relief & Post-Laser Soothing Balm',
    category: 'Homecare Skincare',
    duration: 'Retail 30g',
    price: 550
  },
  {
    id: 'prod-niacinamide',
    name: 'Glass Skin Niacinamide 10% + Zinc Glow Drop',
    category: 'Homecare Skincare',
    duration: 'Retail 30ml',
    price: 599
  },
  {
    id: 'prod-keratin-serum',
    name: 'Argan & Keratin Silk Hair Sealing Serum',
    category: 'Hair Care Retail',
    duration: 'Retail 100ml',
    price: 650
  },
  {
    id: 'prod-hair-tonic',
    name: 'Botanical Anti-Hairfall Copper-Peptide Tonic',
    category: 'Hair Care Retail',
    duration: 'Retail 120ml',
    price: 750
  },
  {
    id: 'prod-nail-oil',
    name: 'Antiseptic Tea Tree Nail & Cuticle Recovery Oil',
    category: 'Podiatry Retail',
    duration: 'Retail 15ml',
    price: 350
  }
];

const PAYMENT_METHODS = [
  { key: 'Cash', label: '💵 Cash', color: 'emerald' },
  { key: 'GCash', label: '📱 GCash', color: 'blue' },
  { key: 'Maya / QR Ph', label: '💳 Maya / QR Ph', color: 'cyan' },
  { key: 'Credit / Debit Card', label: '💳 Card Terminal', color: 'purple' }
];

const DISCOUNT_PRESETS = [
  { key: 'none', label: 'No Discount', rate: 0 },
  { key: 'vip10', label: '10% VIP Privilege', rate: 0.1 },
  { key: 'senior20', label: '20% Senior / PWD', rate: 0.2 }
];

const WalkInPosModal = ({ open, onClose, onCheckoutComplete }) => {
  const { services, clients, addAppointment, currentStaffUser, ownerProfile } = useApp();

  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [discountPreset, setDiscountPreset] = useState('none');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashTendered, setCashTendered] = useState('');

  // Auto-fill from existing patient record
  const handleSelectExistingClient = (clientId) => {
    const found = clients.find(c => c.id === clientId);
    if (found) {
      setClientName(found.name);
      setPhone(found.phone);
      setEmail(found.email !== 'N/A' ? found.email : '');
      if (found.tier?.includes('VIP')) {
        setDiscountPreset('vip10');
      }
      message.info(`Loaded patient profile: ${found.name}`);
    }
  };

  const handleQuickGuest = () => {
    setClientName('Walk-in Clinic Guest');
    setPhone('09170000000');
    setEmail('');
  };

  const handleAddTreatment = (srvId) => {
    const srv = services.find(s => s.id === srvId);
    if (!srv) return;
    setCartItems(prev => [
      ...prev,
      {
        cartItemId: `item-${Date.now()}-${Math.random()}`,
        id: srv.id,
        name: srv.name,
        category: srv.category,
        duration: srv.duration || 'Session',
        price: Number(srv.price) || 0,
        type: 'Treatment'
      }
    ]);
    setSelectedServiceId(null);
  };

  const handleAddProduct = (prodId) => {
    const prod = HOMECARE_PRODUCTS.find(p => p.id === prodId);
    if (!prod) return;
    setCartItems(prev => [
      ...prev,
      {
        cartItemId: `item-${Date.now()}-${Math.random()}`,
        id: prod.id,
        name: prod.name,
        category: prod.category,
        duration: prod.duration,
        price: Number(prod.price) || 0,
        type: 'Retail'
      }
    ]);
    setSelectedProductId(null);
  };

  const handleRemoveItem = (cartItemId) => {
    setCartItems(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  // Totals calculation
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0),
    [cartItems]
  );

  const activeDiscountObj = DISCOUNT_PRESETS.find(d => d.key === discountPreset) || DISCOUNT_PRESETS[0];
  const discountAmount = Math.round(subtotal * activeDiscountObj.rate);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const numericCash = Number(cashTendered) || 0;
  const changeDue = paymentMethod === 'Cash' && numericCash > finalTotal ? numericCash - finalTotal : 0;

  const handleCompleteCheckout = () => {
    if (!clientName.trim()) {
      message.warning('Please enter patient name or click "Quick Guest".');
      return;
    }
    if (!phone.trim()) {
      message.warning('Please enter contact number or click "Quick Guest".');
      return;
    }
    if (cartItems.length === 0) {
      message.warning('Please add at least one treatment or skincare item to the POS cart.');
      return;
    }

    const summaryName =
      cartItems.length === 1
        ? cartItems[0].name
        : `${cartItems[0].name} (+${cartItems.length - 1} more)`;

    const attendingName = currentStaffUser?.name || ownerProfile?.name || 'Dr. Aura Diaz Cano';

    const newApt = addAppointment({
      clientName: clientName.trim(),
      phone: phone.trim(),
      email: email.trim() || 'N/A',
      serviceId: cartItems[0].id,
      serviceName: summaryName,
      serviceCategory: cartItems[0].category,
      services: cartItems,
      date: dayjs().format('YYYY-MM-DD'),
      time: dayjs().format('hh:mm A'),
      totalPrice: subtotal,
      discountApplied: discountAmount,
      finalAmount: finalTotal,
      voucherUsed: discountAmount > 0 ? activeDiscountObj.label.toUpperCase() : null,
      paymentMethod,
      cashTendered: paymentMethod === 'Cash' && numericCash >= finalTotal ? numericCash : finalTotal,
      changeDue,
      attendingSpecialist: attendingName,
      isWalkInPos: true,
      notes: `Walk-in POS Checkout (${paymentMethod}) • Attended by ${attendingName}`,
      status: 'Completed'
    });

    if (newApt && !newApt.error) {
      message.success(`POS Checkout Completed! Official Receipt #${newApt.id} generated.`);
      // Reset state
      setClientName('');
      setPhone('');
      setEmail('');
      setCartItems([]);
      setDiscountPreset('none');
      setCashTendered('');
      onClose();
      if (onCheckoutComplete) {
        onCheckoutComplete(newApt);
      }
    } else if (newApt?.message) {
      message.error(newApt.message);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width="96%"
      style={{ maxWidth: 680 }}
      title={
        <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
          <div className="flex items-center gap-2 font-serif-luxury text-base sm:text-xl font-bold text-aura-dark">
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center text-sm shadow-xs shrink-0">
              <ThunderboltOutlined />
            </span>
            <span>Walk-in Fast POS & Official Receipt Checkout</span>
          </div>
          <Tag color="gold" className="!rounded-full font-bold text-[10px] !m-0 hidden sm:inline shrink-0">
            Instant Counter Terminal
          </Tag>
        </div>
      }
    >
      <div className="space-y-4 pt-2 max-h-[78vh] overflow-y-auto pr-1">
        {/* SECTION 1: PATIENT SELECTION */}
        <div className="p-3.5 rounded-2xl bg-aura-50/70 border border-aura-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-aura-900 uppercase tracking-wider">
              1. Patient / Walk-in Customer Details
            </span>
            <div className="flex items-center gap-2">
              <Select
                placeholder="🔍 Load Existing Patient..."
                onChange={handleSelectExistingClient}
                className="w-48 !rounded-xl text-xs"
                size="small"
                showSearch
                optionFilterProp="children"
              >
                {clients.map(c => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </Select.Option>
                ))}
              </Select>
              <Button
                size="small"
                onClick={handleQuickGuest}
                className="!rounded-lg text-[11px] font-semibold !border-aura-300 !text-aura-800"
              >
                + Quick Guest
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Patient Full Name *"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="!rounded-xl text-xs !py-2"
            />
            <Input
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="Mobile Number (e.g. 09171234567) *"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 12))}
              className="!rounded-xl text-xs !py-2 font-mono"
            />
          </div>
        </div>

        {/* SECTION 2: ADD TREATMENTS OR HOMECARE PRODUCTS */}
        <div className="p-3.5 rounded-2xl bg-white border border-aura-200 space-y-3">
          <span className="text-xs font-bold text-aura-900 uppercase tracking-wider block">
            2. Add Clinic Procedures or Derma Homecare Products
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-gray-600 mb-1 block">
                <MedicineBoxOutlined className="text-aura-700 mr-1" />
                Add Aesthetic Treatment:
              </label>
              <Select
                showSearch
                value={selectedServiceId}
                onChange={handleAddTreatment}
                placeholder="+ Select procedure to add..."
                optionFilterProp="children"
                className="w-full !rounded-xl text-xs"
              >
                {services.map(s => (
                  <Select.Option key={s.id} value={s.id}>
                    {s.name} — ₱{s.price.toLocaleString()}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-gray-600 mb-1 block">
                <ShoppingOutlined className="text-emerald-700 mr-1" />
                Add Retail Homecare Product:
              </label>
              <Select
                showSearch
                value={selectedProductId}
                onChange={handleAddProduct}
                placeholder="+ Select skincare/haircare item..."
                optionFilterProp="children"
                className="w-full !rounded-xl text-xs"
              >
                {HOMECARE_PRODUCTS.map(p => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.name} — ₱{p.price.toLocaleString()}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          {/* Quick Retail Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-gray-400 font-semibold mr-1">Fast Add:</span>
            {HOMECARE_PRODUCTS.slice(0, 4).map(prod => (
              <button
                key={prod.id}
                type="button"
                onClick={() => handleAddProduct(prod.id)}
                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-aura-100 text-gray-700 hover:text-aura-900 text-[11px] font-medium transition-colors cursor-pointer"
              >
                + {prod.name.split(' ')[1]} (₱{prod.price})
              </button>
            ))}
          </div>

          {/* Cart Items List */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mt-2">
            <div className="bg-gray-50 px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase flex justify-between">
              <span>Order Items ({cartItems.length})</span>
              <span>Amount</span>
            </div>
            {cartItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400 italic">
                No items in cart yet. Select a treatment or homecare product above.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-40 overflow-y-auto">
                {cartItems.map(item => (
                  <div
                    key={item.cartItemId}
                    className="px-3 py-2 flex items-center justify-between text-xs hover:bg-aura-50/30"
                  >
                    <div className="flex items-center gap-2">
                      <Tag
                        color={item.type === 'Retail' ? 'cyan' : 'purple'}
                        className="!m-0 !text-[10px] font-bold !rounded-md"
                      >
                        {item.type}
                      </Tag>
                      <div>
                        <div className="font-semibold text-gray-800">{item.name}</div>
                        <div className="text-[10px] text-gray-400">{item.category} • {item.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">₱{item.price.toLocaleString()}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.cartItemId)}
                        className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: PRIVILEGE DISCOUNT & PAYMENT METHOD */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Discount Selector */}
            <div>
              <span className="text-[11px] font-bold text-gray-700 block mb-1.5">
                Privilege Discount:
              </span>
              <div className="flex gap-1.5">
                {DISCOUNT_PRESETS.map(d => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDiscountPreset(d.key)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                      discountPreset === d.key
                        ? 'bg-aura-800 text-white border-aura-800 shadow-2xs'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-aura-300'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <span className="text-[11px] font-bold text-gray-700 block mb-1.5">
                Payment Method:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {PAYMENT_METHODS.map(pm => (
                  <button
                    key={pm.key}
                    type="button"
                    onClick={() => setPaymentMethod(pm.key)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      paymentMethod === pm.key
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Cash Tendered Calculator */}
          {paymentMethod === 'Cash' && finalTotal > 0 && (
            <div className="pt-2 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-600">Cash Tendered (₱):</span>
                <Input
                  placeholder={`e.g. ${Math.ceil(finalTotal / 500) * 500}`}
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value.replace(/\D/g, ''))}
                  className="w-32 !rounded-lg font-mono text-xs"
                  size="small"
                />
                {[1000, 2000, 5000].map(bill => (
                  <button
                    key={bill}
                    type="button"
                    onClick={() => setCashTendered(String(bill))}
                    className="px-2 py-0.5 rounded bg-white border border-gray-300 text-[10px] font-mono hover:bg-gray-100 cursor-pointer"
                  >
                    ₱{bill}
                  </button>
                ))}
              </div>
              {numericCash >= finalTotal && (
                <div className="text-emerald-700 font-bold">
                  Change Due: <span className="font-mono text-sm">₱{changeDue.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 4: TOTAL SUMMARY & CHECKOUT BUTTON */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-aura-900 via-aura-800 to-aura-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-[11px] text-aura-200">
              Subtotal: ₱{subtotal.toLocaleString()}{' '}
              {discountAmount > 0 && `• Discount: -₱${discountAmount.toLocaleString()}`}
            </div>
            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
              <span className="text-xs uppercase tracking-wider text-amber-300 font-bold">
                Total Net Payable:
              </span>
              <span className="font-serif-luxury text-2xl sm:text-3xl font-bold text-white">
                ₱{finalTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<PrinterOutlined />}
            onClick={handleCompleteCheckout}
            className="!bg-amber-400 hover:!bg-amber-500 !text-amber-950 !border-none !rounded-xl !font-bold text-xs sm:text-sm !h-11 px-6 shadow-md w-full sm:w-auto"
          >
            Complete Checkout & Print Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default WalkInPosModal;
