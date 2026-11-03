import React, { useState } from 'react';
import { Modal, Button, Tabs, Tag, Card, Divider } from 'antd';
import {
  InfoCircleOutlined,
  ShopOutlined,
  MedicineBoxOutlined,
  CustomerServiceOutlined,
  FacebookFilled,
  InstagramOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  StarFilled,
  CheckCircleFilled,
  RightOutlined,
  CalendarOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useApp } from '../../context/AppContext';

const AboutSupportModal = ({ open, onClose, onSelectServiceForBooking }) => {
  const { clinicProfile, services } = useApp();
  const [activeTab, setActiveTab] = useState('about');
  const [birModalOpen, setBirModalOpen] = useState(false);
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState(null);

  const activeServices = services.filter(s => s.active !== false);

  const fbUrl = clinicProfile?.facebookUrl || 'https://www.facebook.com/p/Aura-Aesthetic-Cagayan-61593462225267/';
  const igHandle = clinicProfile?.instagramHandle || '@auraclinicph';
  const cleanPhone = clinicProfile?.phone ? clinicProfile.phone.replace(/\D/g, '') : '';
  const cleanMobile = clinicProfile?.mobile ? clinicProfile.mobile.replace(/\D/g, '') : '';

  const handleBookService = (service) => {
    onClose();
    if (onSelectServiceForBooking) {
      onSelectServiceForBooking(service);
    }
  };

  const tabItems = [
    {
      key: 'about',
      label: (
        <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
          <ShopOutlined className="text-aura-700" />
          <span>About Clinic</span>
        </span>
      ),
      children: (
        <div className="space-y-4 pt-2">
          {/* Clinic Mission & Doctor */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-aura-50/80 via-white to-aura-50/40 border border-aura-200/90 text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-aura-700 to-aura-400 flex items-center justify-center text-white font-serif-luxury font-bold text-2xl shadow-sm overflow-hidden">
              {clinicProfile?.logoUrl ? (
                <img src={clinicProfile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                clinicProfile?.clinicName ? clinicProfile.clinicName.trim().charAt(0).toUpperCase() : 'A'
              )}
            </div>
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-aura-dark tracking-tight">
              {clinicProfile?.clinicName || 'Aura Aesthetic Clinic'}
            </h3>
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-aura-100 text-aura-800 text-[11px] font-semibold">
              <span>Medical Director:</span>
              <strong>{clinicProfile?.directorName || 'Dr. Aura Diaz Cano, MD, FPDS'}</strong>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-lg mx-auto pt-1">
              {clinicProfile?.aboutStory ||
                'Aura Aesthetic Clinic is a premier medical sanctuary dedicated to enhancing your natural radiance. Guided by board-certified dermatologists and licensed aesthetic nurses, we deliver science-backed skin, slimming, and wellness treatments with physician-level precision.'}
            </p>
          </div>

          {/* Core Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-aura-200/80 space-y-1">
              <SafetyCertificateOutlined className="text-emerald-600 text-lg" />
              <div className="font-bold text-xs text-aura-dark">Board-Certified Precision</div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Physician-guided treatments tailored precisely to your unique skin profile.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-aura-200/80 space-y-1">
              <CheckCircleFilled className="text-aura-600 text-lg" />
              <div className="font-bold text-xs text-aura-dark">Hospital-Grade Sterilization</div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Single-use sterile consumable kits and autoclaved clinical instruments for every patient.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-aura-200/80 space-y-1">
              <StarFilled className="text-amber-500 text-lg" />
              <div className="font-bold text-xs text-aura-dark">Zero Prepayment Policy</div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Book with total confidence online. Pay safely at the clinic reception upon arrival.
              </p>
            </div>
          </div>

          {/* Official BIR Registration Trust Seal */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white border border-emerald-200/90 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div 
                className="w-16 h-12 rounded-xl border border-emerald-300 overflow-hidden shrink-0 shadow-xs cursor-pointer hover:opacity-90 transition-opacity bg-white"
                onClick={() => setBirModalOpen(true)}
              >
                <img
                  src="/clinic-photos/bir-registration-seal.jpg"
                  alt="BIR Registration Seal Badge"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-gray-900">Bureau of Internal Revenue Registered</span>
                  <Tag color="green" className="!mr-0 text-[10px] font-bold">Seal Badge 26</Tag>
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                  Verified legitimate Philippine taxpayer with official BIR Registration Seal and scannable QR verification.
                </p>
              </div>
            </div>
            <Button
              size="small"
              icon={<SafetyCertificateOutlined className="text-emerald-600" />}
              onClick={() => setBirModalOpen(true)}
              className="!border-emerald-300 !text-emerald-800 hover:!border-emerald-500 !bg-white !rounded-xl text-xs font-semibold shrink-0"
            >
              View Official Seal
            </Button>
          </div>

          {/* Real Clinic Treatment & Facility Gallery */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-serif-luxury font-bold text-xs sm:text-sm text-aura-dark">
                Clinic Atmosphere & Treatment Stations
              </span>
              <span className="text-[10px] text-aura-600 font-medium">Actual Clinic Photos</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div
                className="rounded-xl overflow-hidden border border-aura-200/90 shadow-xs group relative aspect-square bg-gray-100 cursor-pointer"
                onClick={() => setSelectedGalleryPhoto({
                  src: '/clinic-photos/clinic-nail-lounge-interior.jpg',
                  title: 'Aesthetic Treatment Station & Nail Lounge'
                })}
              >
                <img
                  src="/clinic-photos/clinic-nail-lounge-interior.jpg"
                  alt="Aesthetic Nail Care Station"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-1.5 text-[10px] text-white font-medium text-center">
                  Treatment Station
                </div>
              </div>

              <div
                className="rounded-xl overflow-hidden border border-aura-200/90 shadow-xs group relative aspect-square bg-gray-100 cursor-pointer"
                onClick={() => setSelectedGalleryPhoto({
                  src: '/clinic-photos/nail-care-manicure.png',
                  title: 'Precision Manicure & Gentle Care'
                })}
              >
                <img
                  src="/clinic-photos/nail-care-manicure.png"
                  alt="Precision Manicure Care"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-1.5 text-[10px] text-white font-medium text-center">
                  Precision Care
                </div>
              </div>

              <div
                className="rounded-xl overflow-hidden border border-aura-200/90 shadow-xs group relative aspect-square bg-gray-100 cursor-pointer"
                onClick={() => setSelectedGalleryPhoto({
                  src: '/clinic-photos/specialist-nail-treatment.png',
                  title: 'Specialist Clinical Practice with Sterile Lamp'
                })}
              >
                <img
                  src="/clinic-photos/specialist-nail-treatment.png"
                  alt="Specialist at Work"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-1.5 text-[10px] text-white font-medium text-center">
                  Specialist Hands
                </div>
              </div>

              <div
                className="rounded-xl overflow-hidden border border-aura-200/90 shadow-xs group relative aspect-square bg-gray-100 cursor-pointer"
                onClick={() => setSelectedGalleryPhoto({
                  src: '/clinic-photos/foot-spa-lounge.png',
                  title: 'Relaxing Foot Spa & Pink Velvet Lounge'
                })}
              >
                <img
                  src="/clinic-photos/foot-spa-lounge.png"
                  alt="Foot Spa & Velvet Lounge"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-1.5 text-[10px] text-white font-medium text-center">
                  Foot Spa Lounge
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'services',
      label: (
        <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
          <MedicineBoxOutlined className="text-aura-700" />
          <span>Services Menu ({activeServices.length})</span>
        </span>
      ),
      children: (
        <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto pr-1">
          <p className="text-xs text-gray-500">
            Browse our full medical-grade treatment catalogue. Tap <strong>"Book This Treatment"</strong> to pick a slot.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeServices.map(srv => (
              <div
                key={srv.id}
                className="p-3 rounded-2xl bg-white border border-aura-200/90 shadow-xs flex flex-col justify-between hover:border-aura-400 transition-all space-y-2.5"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={srv.image}
                    alt={srv.name}
                    className="w-16 h-16 rounded-xl object-cover border border-aura-200 shrink-0"
                  />
                  <div>
                    <div className="font-bold text-xs text-aura-dark leading-tight">{srv.name}</div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Tag color="purple" className="!text-[10px] !mr-0 !rounded-md">
                        {srv.category}
                      </Tag>
                      <span className="text-[10px] text-gray-400">• {srv.duration || '45 mins'}</span>
                    </div>
                    <div className="font-bold text-xs text-aura-700 mt-1">
                      ₱{srv.price?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <Button
                  block
                  size="small"
                  type="primary"
                  icon={<CalendarOutlined />}
                  onClick={() => handleBookService(srv)}
                  className="!bg-aura-700 hover:!bg-aura-800 !rounded-xl text-xs font-semibold !h-8"
                >
                  Book This Treatment
                </Button>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      key: 'support',
      label: (
        <span className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
          <CustomerServiceOutlined className="text-aura-700" />
          <span>Contact & Socials</span>
        </span>
      ),
      children: (
        <div className="space-y-4 pt-2">
          <p className="text-xs text-gray-500">
            Connect directly with our Concierge desk, social media pages, or doctor consultation hotline:
          </p>

          {/* Social Media & Instant Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Facebook */}
            <a
              href={fbUrl.startsWith('http') ? fbUrl : `https://${fbUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-between text-blue-900 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-xs">
                  <FacebookFilled />
                </div>
                <div>
                  <span className="font-bold text-xs block">Official Facebook Page</span>
                  <span className="text-[11px] text-blue-700 font-medium truncate block max-w-[190px]">
                    {fbUrl.includes('Aura-Aesthetic-Cagayan') ? 'Aura Aesthetic - Cagayan' : fbUrl.replace('https://', '').replace('http://', '')}
                  </span>
                </div>
              </div>
              <RightOutlined className="text-blue-500 text-xs group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Instagram */}
            <a
              href={
                igHandle.startsWith('http')
                  ? igHandle
                  : `https://instagram.com/${igHandle.replace('@', '')}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-200 hover:border-pink-400 hover:bg-pink-50 flex items-center justify-between text-pink-950 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center text-xl shadow-xs">
                  <InstagramOutlined />
                </div>
                <div>
                  <span className="font-bold text-xs block">Official Instagram</span>
                  <span className="text-[11px] text-pink-700 font-medium block">
                    {igHandle}
                  </span>
                </div>
              </div>
              <RightOutlined className="text-pink-500 text-xs group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Concierge Email */}
            <a
              href={`mailto:${clinicProfile?.email || 'concierge@auraclinic.ph'}?subject=Inquiry%20regarding%20Aura%20Clinic%20Services`}
              className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-400 hover:bg-gray-100 flex items-center justify-between text-gray-800 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center text-xl shadow-xs">
                  <MailOutlined />
                </div>
                <div>
                  <span className="font-bold text-xs block">Concierge Email Support</span>
                  <span className="text-[11px] text-gray-600 block">
                    {clinicProfile?.email || 'concierge@auraclinic.ph'}
                  </span>
                </div>
              </div>
              <RightOutlined className="text-gray-400 text-xs group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Mobile / Viber */}
            <a
              href={cleanMobile ? `tel:${cleanMobile}` : `tel:09178829912`}
              className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 flex items-center justify-between text-emerald-950 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-xs">
                  <PhoneOutlined />
                </div>
                <div>
                  <span className="font-bold text-xs block">Direct Mobile & Viber</span>
                  <span className="text-[11px] text-emerald-700 font-mono font-semibold block">
                    {clinicProfile?.mobile || '0917-882-9912'}
                  </span>
                </div>
              </div>
              <RightOutlined className="text-emerald-500 text-xs group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Location & Operating Schedule */}
          <div className="p-4 rounded-2xl bg-aura-50/70 border border-aura-200 space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <EnvironmentOutlined className="text-aura-700 text-base mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-aura-dark block">Clinic Branch Address</span>
                <p className="text-gray-600 mt-0.5 leading-relaxed">
                  {clinicProfile?.address || '3F Promenade Wing, Bonifacio High Street, BGC Taguig City'}
                </p>
              </div>
            </div>

            <Divider className="!my-2" />

            <div className="flex items-center gap-2.5">
              <ClockCircleOutlined className="text-aura-700 text-base shrink-0" />
              <div>
                <span className="font-bold text-aura-dark block">Operating Schedule</span>
                <span className="text-gray-600">
                  {clinicProfile?.hours || 'Monday – Sunday: 9:00 AM – 7:30 PM'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      <Modal
        open={open}
      onCancel={onClose}
      footer={[
        <Button
          key="close"
          type="primary"
          onClick={onClose}
          className="!bg-aura-700 hover:!bg-aura-800 !rounded-xl text-xs font-semibold !h-9 px-5"
        >
          Close
        </Button>
      ]}
      title={
        <div className="flex items-center gap-2 font-serif-luxury text-base sm:text-xl text-aura-dark">
          <InfoCircleOutlined className="text-aura-600" />
          <span>About Us & Concierge Support</span>
        </div>
      }
      centered
      width={680}
      className="aura-about-modal"
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="aura-about-tabs mt-2"
      />
    </Modal>

    {/* BIR Registration Seal Modal */}
    <Modal
      open={birModalOpen}
      onCancel={() => setBirModalOpen(false)}
      footer={[
        <Button
          key="close"
          type="primary"
          onClick={() => setBirModalOpen(false)}
          className="!bg-aura-700 hover:!bg-aura-800 !rounded-xl text-xs font-semibold !h-9 px-5"
        >
          Close
        </Button>
      ]}
      title={
        <div className="flex items-center gap-2 font-serif-luxury text-base sm:text-lg text-aura-dark">
          <SafetyCertificateOutlined className="text-emerald-600" />
          <span>Official BIR Registration Seal Badge</span>
        </div>
      }
      centered
      width={560}
    >
      <div className="p-1 space-y-3 text-center">
        <div className="rounded-2xl overflow-hidden border border-emerald-300 shadow-md bg-white">
          <img
            src="/clinic-photos/bir-registration-seal.jpg"
            alt="Official BIR Registration Seal Badge"
            className="w-full h-auto object-contain"
          />
        </div>
        <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-xs text-emerald-950 text-left space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-emerald-900">
            <SafetyCertificateOutlined className="text-emerald-700" />
            <span>Bureau of Internal Revenue (BIR) Verified Online Taxpayer</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            In compliance with Philippine BIR regulations, this official Seal Badge certifies that our aesthetic clinic operations are officially registered and in good standing. Clients can scan the QR code to verify registration status on the official BIR website (www.bir.gov.ph).
          </p>
        </div>
      </div>
    </Modal>
    {/* Full Screen Gallery Photo Viewer Modal */}
    <Modal
      open={!!selectedGalleryPhoto}
      onCancel={() => setSelectedGalleryPhoto(null)}
      footer={[
        <Button
          key="close"
          onClick={() => setSelectedGalleryPhoto(null)}
          className="!rounded-xl text-xs font-semibold !h-9 px-5"
        >
          Close
        </Button>
      ]}
      title={
        <div className="font-serif-luxury text-base text-aura-dark">
          {selectedGalleryPhoto?.title || 'Clinic Facility Photo'}
        </div>
      }
      centered
      width={640}
    >
      <div className="p-1 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
        <img
          src={selectedGalleryPhoto?.src}
          alt={selectedGalleryPhoto?.title}
          className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
        />
      </div>
    </Modal>
    </>
  );
};

export default AboutSupportModal;
