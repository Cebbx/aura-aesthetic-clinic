import React from 'react';
import { DatePicker, Button, Tag, Alert, Tooltip } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleFilled,
  LeftOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useApp } from '../../context/AppContext';

const Step2SelectSchedule = ({
  selectedDate,
  onSelectDate,
  selectedTime,
  onSelectTime,
  selectedService,
  onBack,
  onNext
}) => {
  const { timeSlots, appointments } = useApp();

  // Dynamic collision guard: check which slots are already booked on selectedDate
  const selectedDateStr = selectedDate ? selectedDate.format('YYYY-MM-DD') : '';
  const bookedSlotsOnDate = (appointments || [])
    .filter(a => a.date === selectedDateStr && a.status !== 'Cancelled')
    .map(a => a.time);

  const isSlotBooked = (time) => bookedSlotsOnDate.includes(time);

  // Disable past dates
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  // Quick Date Selectors
  const quickDates = [
    { label: 'Today', date: dayjs() },
    { label: 'Tomorrow', date: dayjs().add(1, 'day') },
    { label: 'In 2 Days', date: dayjs().add(2, 'day') },
    { label: 'Weekend', date: dayjs().day(6) >= dayjs() ? dayjs().day(6) : dayjs().add(7, 'day').day(6) }
  ];

  const morningSlots = timeSlots.filter(s => s.period === 'Morning');
  const afternoonSlots = timeSlots.filter(s => s.period === 'Afternoon');
  const eveningSlots = timeSlots.filter(s => s.period === 'Evening');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Service Context Header Card */}
      <div className="bg-gradient-to-r from-aura-50 via-white to-aura-100/50 p-3.5 sm:p-4 rounded-2xl border border-aura-200 flex items-center justify-between gap-3 shadow-xs">
        <div className="truncate">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-aura-600 block">
            Selected Treatment
          </span>
          <h4 className="font-serif-luxury text-sm sm:text-base font-bold text-aura-dark truncate">
            {selectedService?.name || 'Aesthetic Treatment'}
          </h4>
          <p className="text-[11px] text-gray-500">
            {selectedService?.duration || '45 mins'} • Clinic Visit
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] text-gray-400 block">Price:</span>
          <div className="font-serif-luxury text-base sm:text-lg font-bold text-aura-700">
            ₱{selectedService?.price?.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Date Selection */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-aura-100 flex items-center justify-center text-aura-600 font-bold text-xs sm:text-sm">
              1
            </div>
            <div>
              <h4 className="font-bold text-aura-dark text-sm sm:text-base">Choose Date</h4>
              <p className="text-[11px] text-gray-500">Pick your preferred appointment day</p>
            </div>
          </div>

          {/* Quick Date Pills */}
          <div className="grid grid-cols-2 gap-2">
            {quickDates.map((item, idx) => {
              const isMatch = selectedDate && selectedDate.format('YYYY-MM-DD') === item.date.format('YYYY-MM-DD');
              return (
                <button
                  key={idx}
                  onClick={() => onSelectDate(item.date)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    isMatch
                      ? 'bg-aura-700 text-white border-aura-700 shadow-md shadow-aura-700/20'
                      : 'bg-white hover:bg-aura-50 border-aura-200 text-gray-700'
                  }`}
                >
                  <div className={`text-[10px] font-semibold ${isMatch ? 'text-aura-100' : 'text-aura-600'}`}>
                    {item.label}
                  </div>
                  <div className="text-xs font-bold mt-0.5">
                    {item.date.format('ddd, MMM D')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Ant Design DatePicker */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-aura-200 shadow-xs">
            <label className="block text-[11px] font-semibold text-gray-600 mb-1.5">
              Or pick specific calendar date:
            </label>
            <DatePicker
              value={selectedDate}
              onChange={(date) => onSelectDate(date)}
              disabledDate={disabledDate}
              format="MMMM DD, YYYY (dddd)"
              allowClear={false}
              className="w-full !rounded-xl !border-aura-300 !py-2.5 !text-sm"
            />
            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-gray-500">
              <SafetyCertificateOutlined className="text-aura-600" />
              <span>Clinic hours: Monday – Sunday: 9:00 AM – 7:30 PM</span>
            </div>
          </div>
        </div>

        {/* Right: Time Slots Selection */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-aura-100 flex items-center justify-center text-aura-600 font-bold text-xs sm:text-sm">
                2
              </div>
              <div>
                <h4 className="font-bold text-aura-dark text-sm sm:text-base">Choose Available Time</h4>
                <p className="text-[11px] text-gray-500">
                  {selectedDate ? selectedDate.format('MMMM DD, YYYY') : 'Pick a date'}
                </p>
              </div>
            </div>

            {/* Availability Legend */}
            <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>Open</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span>
                <span>Full</span>
              </span>
            </div>
          </div>

          {/* Time Slot Sections */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-aura-200 shadow-xs space-y-4">
            {/* Morning */}
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-aura-700 uppercase tracking-wider mb-2">
                <ClockCircleOutlined />
                <span>Morning (9:30 AM – 12:00 PM)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {morningSlots.map((slot) => renderSlotButton(slot, selectedTime, onSelectTime, isSlotBooked))}
              </div>
            </div>

            {/* Afternoon */}
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-aura-700 uppercase tracking-wider mb-2">
                <ClockCircleOutlined />
                <span>Afternoon (1:00 PM – 4:45 PM)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {afternoonSlots.map((slot) => renderSlotButton(slot, selectedTime, onSelectTime, isSlotBooked))}
              </div>
            </div>

            {/* Evening */}
            <div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-aura-700 uppercase tracking-wider mb-2">
                <ClockCircleOutlined />
                <span>Evening (5:00 PM – 7:00 PM)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {eveningSlots.map((slot) => renderSlotButton(slot, selectedTime, onSelectTime, isSlotBooked))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Slot Summary Callout */}
      {selectedDate && selectedTime && (
        <Alert
          message={
            <div className="flex items-center gap-2 text-xs">
              <CheckCircleFilled className="text-emerald-500 text-sm shrink-0" />
              <span>
                <strong>Reserved:</strong> {selectedDate.format('MMM D, YYYY')} at{' '}
                <span className="text-aura-700 font-bold">{selectedTime}</span>
              </span>
            </div>
          }
          type="info"
          className="!bg-aura-50/80 !border-aura-200 !rounded-xl !p-2.5 sm:!p-3"
        />
      )}

      {/* Navigation Buttons - Mobile thumb friendly */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-aura-200">
        <Button
          icon={<LeftOutlined />}
          onClick={onBack}
          className="!rounded-xl !border-aura-300 !text-aura-700 hover:!border-aura-600 !h-11 px-4 text-xs shrink-0"
        >
          <span className="hidden sm:inline">Back to Services</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <Button
          type="primary"
          size="large"
          disabled={!selectedDate || !selectedTime}
          onClick={onNext}
          className="!bg-aura-700 hover:!bg-aura-800 disabled:!bg-gray-200 !border-none !text-white !font-bold !rounded-xl !h-11 px-6 sm:px-8 shadow-md shadow-aura-700/20 text-xs sm:text-sm flex-1 sm:flex-none"
        >
          Proceed to Client Info →
        </Button>
      </div>
    </div>
  );
};

const renderSlotButton = (slot, selectedTime, onSelectTime, isSlotBooked) => {
  const isSelected = selectedTime === slot.time;
  const isBooked = !slot.available || (isSlotBooked && isSlotBooked(slot.time));

  if (isBooked) {
    return (
      <Tooltip key={slot.time} title="Fully booked on this day">
        <button
          disabled
          className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-xs flex flex-col items-center justify-center cursor-not-allowed opacity-60 w-full"
        >
          <span className="font-semibold line-through text-xs">{slot.time}</span>
          <span className="text-[8px] uppercase tracking-wide text-rose-500 font-medium mt-0.5">
            Booked
          </span>
        </button>
      </Tooltip>
    );
  }

  return (
    <button
      key={slot.time}
      onClick={() => onSelectTime(slot.time)}
      className={`p-2.5 rounded-xl border transition-all flex flex-col items-center justify-center w-full ${
        isSelected
          ? 'bg-aura-700 text-white border-aura-700 shadow-md shadow-aura-700/25 scale-[1.02]'
          : 'bg-white hover:bg-aura-50/60 border-aura-200 text-aura-dark hover:border-aura-400'
      }`}
    >
      <span className="font-bold text-xs">{slot.time}</span>
      <span className={`text-[9px] flex items-center gap-1 mt-0.5 ${isSelected ? 'text-aura-200' : 'text-emerald-600'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
        <span>Available</span>
      </span>
    </button>
  );
};

export default Step2SelectSchedule;
