import React, { useState, useRef } from 'react';
import { Modal, Button, Tag } from 'antd';
import {
  SwapOutlined,
  CheckCircleFilled,
  StarFilled,
  CalendarOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';

const TRANSFORMATION_CASES = [
  {
    id: 'case-glass-skin',
    serviceId: 'srv-1',
    category: 'Facial & Skin Rejuvenation',
    title: 'Signature Glass Skin & Pore Refinement',
    subtitle: '3 Sessions • Korean BB Glow + Diamond Peel & Oxygen Dome',
    patientInfo: 'Female, 27 • Combination / Acne-Prone Skin',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85',
    beforeLabel: 'BEFORE • Session 0 (Congested Pores & Dull Tone)',
    afterLabel: 'AFTER • Session 3 (Luminous Poreless Glass Skin)',
    beforeFilter: 'sepia(38%) contrast(92%) brightness(84%) saturate(72%) blur(0.6px)',
    afterFilter: 'contrast(106%) brightness(108%) saturate(112%)',
    beforeOverlayBadge: 'Enlarged Pores & Redness',
    afterOverlayBadge: 'Refined & Radiant Complexion',
    metrics: [
      { label: 'Pore Tightening', value: '+94%' },
      { label: 'Skin Luminosity', value: '+89%' },
      { label: 'Post-Acne Redness', value: '-92%' }
    ],
    clinicianNote:
      'Combined ultrasonic comedone extraction with cryo-calming oxygen therapy and stem-cell ampoule infusion to restore skin barrier translucency.'
  },
  {
    id: 'case-cryo-hair',
    serviceId: 'srv-bnb-2',
    category: 'Hair Care & Scalp',
    title: 'Nano Steam & Cryo-Iron Silk Restoration',
    subtitle: '1 Session • Sub-Zero (-16°C) Cuticle Seal + Keratin Bond Glaze',
    patientInfo: 'Female, 31 • Bleached & Heat-Damaged Frizzy Hair',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85',
    beforeLabel: 'BEFORE • Dry, Porous & Frizzy Strands',
    afterLabel: 'AFTER • Mirror-Shine Sealed Cuticles',
    beforeFilter: 'grayscale(45%) sepia(25%) contrast(88%) brightness(82%) blur(0.5px)',
    afterFilter: 'contrast(108%) brightness(106%) saturate(118%)',
    beforeOverlayBadge: 'High Frizz & Open Cuticles',
    afterOverlayBadge: '3x Mirror Gloss & Silk Bounce',
    metrics: [
      { label: 'Frizz Elimination', value: '96%' },
      { label: 'Strand Elasticity', value: '+84%' },
      { label: 'Surface Gloss Index', value: '3.2x' }
    ],
    clinicianNote:
      'Sub-micron nano mist opened the hair cortex gently while the -16°C cryogenic plate locked amino proteins inside without thermal scorching.'
  },
  {
    id: 'case-scalp-regrowth',
    serviceId: 'srv-hair-2',
    category: 'Hair Care & Scalp',
    title: 'Laser Hair Regrowth & Follicle Detox',
    subtitle: '4 Sessions • 650nm Bio-Stimulation LLLT + Copper-Peptide Serum',
    patientInfo: 'Female, 35 • Post-Partum Crown Thinning & Sebum Buildup',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=900&q=85',
    beforeLabel: 'BEFORE • Week 0 (Dormant Follicles & Thinning)',
    afterLabel: 'AFTER • Week 8 (Reactivated Crown Density)',
    beforeFilter: 'sepia(35%) contrast(85%) brightness(80%) saturate(65%)',
    afterFilter: 'contrast(106%) brightness(105%) saturate(110%)',
    beforeOverlayBadge: 'Sebum Plugs & Hairfall',
    afterOverlayBadge: 'Healthy Follicle Growth',
    metrics: [
      { label: 'Follicle Density', value: '+68%' },
      { label: 'Daily Hairfall', value: '-85%' },
      { label: 'Scalp Clarity', value: '99%' }
    ],
    clinicianNote:
      'High-definition 200x trichoscopy confirmed complete clearance of follicular sebum plugs and robust terminal hair sprouting along the crown.'
  },
  {
    id: 'case-ingrown-detox',
    serviceId: 'srv-5',
    category: 'Podiatry & Precision Nail Care',
    title: 'Painless Medical Ingrown & Nail Detox',
    subtitle: '1 Session • Aseptic Micro-Blade Elevation + Ozone Sterilization',
    patientInfo: 'Male, 29 • Chronic Lateral Nail Fold Inflammation',
    image: '/clinic-photos/specialist-nail-treatment.png',
    beforeLabel: 'BEFORE • Impacted Nail Border & Discomfort',
    afterLabel: 'AFTER • Cleared Nail Fold & Sterile Dressing',
    beforeFilter: 'sepia(42%) saturate(140%) brightness(82%) contrast(92%)',
    afterFilter: 'contrast(105%) brightness(105%) saturate(105%)',
    beforeOverlayBadge: 'Impacted Nail & Swelling',
    afterOverlayBadge: '100% Pain-Free & Restored',
    metrics: [
      { label: 'Pain & Pressure Relief', value: '100%' },
      { label: 'Sterile Guarantee', value: 'Medical Grade' },
      { label: 'Recovery Downtime', value: '0 Days' }
    ],
    clinicianNote:
      'Precision elevation removed the embedded lateral spicule painlessly under topical antiseptic soak, followed by anti-fungal ozone jet therapy.'
  }
];

const BeforeAfterModal = ({ open, onClose }) => {
  const { services } = useApp();
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const activeCase = TRANSFORMATION_CASES[selectedCaseIdx] || TRANSFORMATION_CASES[0];

  const updateSliderFromClientX = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(4, Math.min(96, (offsetX / rect.width) * 100));
    setSliderPos(Math.round(percentage));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateSliderFromClientX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    updateSliderFromClientX(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      updateSliderFromClientX(e.touches[0].clientX);
    }
  };

  const handleBookCaseService = () => {
    const matchedService =
      services.find(s => s.id === activeCase.serviceId) ||
      services.find(s => s.category.toLowerCase().includes(activeCase.category.split(' ')[0].toLowerCase())) ||
      services[0];

    if (matchedService) {
      window.dispatchEvent(new CustomEvent('aura:select-service', { detail: matchedService }));
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width="96%"
      style={{ maxWidth: 760 }}
      className="aura-before-after-modal"
    >
      <div className="p-2 sm:p-4 space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5 border-b border-aura-100 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aura-100 text-aura-800 text-[11px] font-bold">
            <SwapOutlined />
            <span>INTERACTIVE CLINICAL RESULTS GALLERY</span>
          </div>
          <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-aura-dark">
            Before & After Transformations
          </h3>
          <p className="text-xs text-gray-500 max-w-lg mx-auto">
            Drag the center slider left or right to inspect real clinical improvements achieved at Aura Diaz Cano Aesthetic Center.
          </p>
        </div>

        {/* Case Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {TRANSFORMATION_CASES.map((item, idx) => {
            const isSelected = idx === selectedCaseIdx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedCaseIdx(idx);
                  setSliderPos(50);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-aura-800 text-white border-aura-800 shadow-sm'
                    : 'bg-aura-50/70 text-gray-600 border-aura-200 hover:border-aura-400'
                }`}
              >
                {idx + 1}. {item.title}
              </button>
            );
          })}
        </div>

        {/* Interactive Split Comparison Viewport */}
        <div className="space-y-2.5">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden select-none cursor-ew-resize border-2 border-aura-200 shadow-inner bg-gray-900"
          >
            {/* FULL LAYER: AFTER IMAGE (Right side / Underlying base) */}
            <img
              src={activeCase.image}
              alt="After Treatment"
              draggable={false}
              style={{ filter: activeCase.afterFilter }}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />

            {/* After Glow Highlight Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-transparent to-amber-200/15 pointer-events-none" />

            {/* AFTER TOP-RIGHT BADGE */}
            <div className="absolute top-3 right-3 z-10 pointer-events-none flex flex-col items-end gap-1">
              <span className="px-2.5 py-1 rounded-full bg-emerald-600/95 text-white text-[10px] sm:text-xs font-bold shadow-md backdrop-blur-xs flex items-center gap-1">
                <CheckCircleFilled />
                <span>{activeCase.afterLabel}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/90 text-emerald-900 text-[10px] font-semibold shadow-xs">
                ✨ {activeCase.afterOverlayBadge}
              </span>
            </div>

            {/* CLIPPED LAYER: BEFORE IMAGE (Left side up to sliderPos%) */}
            <div
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <img
                src={activeCase.image}
                alt="Before Treatment"
                draggable={false}
                style={{ filter: activeCase.beforeFilter }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Simulated Untreated Diagnostic Texture / Vignette */}
              <div className="absolute inset-0 bg-amber-950/25 mix-blend-multiply" />

              {/* BEFORE TOP-LEFT BADGE */}
              <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1">
                <span className="px-2.5 py-1 rounded-full bg-gray-900/90 text-gray-100 text-[10px] sm:text-xs font-bold shadow-md backdrop-blur-xs">
                  {activeCase.beforeLabel}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-black/70 text-amber-200 text-[10px] font-medium">
                  ⚠️ {activeCase.beforeOverlayBadge}
                </span>
              </div>
            </div>

            {/* VERTICAL DIVIDER LINE & DRAG HANDLE */}
            <div
              style={{ left: `${sliderPos}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(0,0,0,0.8)] z-20 pointer-events-none"
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-aura-900 border-2 border-aura-600 shadow-lg flex items-center justify-center font-bold text-sm">
                <SwapOutlined />
              </div>
            </div>

            {/* Bottom Instruction Pill */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/65 text-white text-[10px] font-semibold backdrop-blur-xs pointer-events-none">
              ◀ Drag Slider ({sliderPos}% Before / {100 - sliderPos}% After) ▶
            </div>
          </div>

          {/* Quick Position Toggle Buttons */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSliderPos(92)}
              className="flex-1 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-[11px] transition-colors cursor-pointer"
            >
              Inspect Before (Untreated)
            </button>
            <button
              type="button"
              onClick={() => setSliderPos(50)}
              className="flex-1 py-1.5 rounded-xl bg-aura-50 hover:bg-aura-100 text-aura-800 border border-aura-200 font-bold text-[11px] transition-colors cursor-pointer"
            >
              50 / 50 Split View
            </button>
            <button
              type="button"
              onClick={() => setSliderPos(8)}
              className="flex-1 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] transition-colors cursor-pointer"
            >
              Inspect After (Result)
            </button>
          </div>
        </div>

        {/* Clinical Case Summary & Metrics */}
        <div className="p-4 rounded-2xl bg-aura-50/70 border border-aura-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Tag color="gold" className="!m-0 font-bold text-[10px]">
                  {activeCase.category}
                </Tag>
                <span className="text-[11px] text-gray-500 font-medium">
                  {activeCase.patientInfo}
                </span>
              </div>
              <h4 className="font-serif-luxury text-base sm:text-lg font-bold text-aura-dark mt-1">
                {activeCase.title}
              </h4>
              <div className="text-xs text-aura-700 font-semibold">
                {activeCase.subtitle}
              </div>
            </div>

            {/* 3 Clinical Metrics */}
            <div className="flex items-center gap-2">
              {activeCase.metrics.map((m, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-white border border-aura-200 text-center shadow-2xs"
                >
                  <div className="font-serif-luxury font-bold text-sm sm:text-base text-emerald-700">
                    {m.value}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-aura-100 text-xs text-gray-600 flex items-start gap-2">
            <SafetyCertificateOutlined className="text-aura-700 text-sm shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-800">Specialist Clinical Note: </strong>
              <span>{activeCase.clinicianNote}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-gray-500 flex items-center gap-1">
              <StarFilled className="text-amber-500" />
              <span>Documented at Aura Diaz Cano Aesthetic Center • Verified Patient Consent</span>
            </span>

            <Button
              type="primary"
              icon={<CalendarOutlined />}
              onClick={handleBookCaseService}
              className="!bg-aura-800 hover:!bg-aura-900 !border-none !rounded-xl font-bold text-xs !h-10 px-5 shadow-sm w-full sm:w-auto"
            >
              Book This Treatment Now →
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BeforeAfterModal;
