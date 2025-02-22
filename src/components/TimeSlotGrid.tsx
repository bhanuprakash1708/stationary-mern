import React from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface TimeSlotGridProps {
  selectedDate: Date;
  onTimeSlotSelect: (slot: string) => void;
  selectedTimeSlot: string;
  rushStatus: string;
}

export function TimeSlotGrid({ selectedDate, onTimeSlotSelect, selectedTimeSlot, rushStatus }: TimeSlotGridProps) {
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 6) + 9;
    const minute = (i % 6) * 10;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  });

  const isTimeSlotDisabled = (slot: string) => {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    if (!today) return false;

    const [time, period] = slot.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let slotHour = hours;
    
    if (period === 'PM' && hours !== 12) slotHour += 12;
    if (period === 'AM' && hours === 12) slotHour = 0;

    const slotTime = new Date(selectedDate);
    slotTime.setHours(slotHour, minutes, 0, 0);
    
    return slotTime < now;
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {timeSlots.map((slot) => {
        const isDisabled = isTimeSlotDisabled(slot);
        return (
          <button
            key={slot}
            onClick={() => !isDisabled && onTimeSlotSelect(slot)}
            disabled={isDisabled}
            className={clsx(
              'p-2 text-xs rounded-lg transition-colors',
              {
                'bg-gray-200 text-gray-500 cursor-not-allowed': isDisabled,
                'ring-2 ring-blue-500': selectedTimeSlot === slot,
                'bg-red-100 hover:bg-red-200 text-red-800': !isDisabled && rushStatus === 'high',
                'bg-orange-100 hover:bg-orange-200 text-orange-800': !isDisabled && rushStatus === 'medium',
                'bg-green-100 hover:bg-green-200 text-green-800': !isDisabled && rushStatus === 'low',
              }
            )}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}