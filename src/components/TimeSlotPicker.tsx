import React from 'react';
import clsx from 'clsx';
import { format, parse, isBefore } from 'date-fns';

interface TimeSlotPickerProps {
  selectedSlot: string | null;
  onSlotSelect: (slot: string) => void;
  selectedDate: Date;
}

interface TimeSlot {
  time: string;
  rush: 'high' | 'medium' | 'low';
}

export function TimeSlotPicker({ selectedSlot, onSlotSelect, selectedDate }: TimeSlotPickerProps) {
  // Generate time slots with 10-minute intervals
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const hours = [9, 10, 11, 12, 14, 15, 16, 17]; // 9 AM to 5 PM with lunch break
    
    hours.forEach(hour => {
      [0, 10, 20, 30, 40, 50].forEach(minute => {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, '0')} ${ampm}`;
        
        // Simulate rush status based on time
        let rush: 'high' | 'medium' | 'low';
        if (hour >= 9 && hour <= 11) {
          rush = 'high'; // Morning rush
        } else if ((hour >= 14 && hour <= 15) || hour === 12) {
          rush = 'medium'; // Lunch and afternoon rush
        } else {
          rush = 'low';
        }
        
        slots.push({ time: displayTime, rush });
      });
    });
    
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const now = new Date();
  const isToday = selectedDate.toDateString() === now.toDateString();

  const isSlotDisabled = (slot: string): boolean => {
    if (!isToday) return false;
    
    const slotTime = parse(slot, 'h:mm aa', new Date());
    slotTime.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
    return isBefore(slotTime, now);
  };

  const getRushColorClasses = (rush: 'high' | 'medium' | 'low', isDisabled: boolean) => {
    if (isDisabled) {
      return 'bg-gray-200 text-gray-400 cursor-not-allowed';
    }
    
    const baseClasses = 'transition-colors';
    switch (rush) {
      case 'high':
        return `${baseClasses} bg-red-100 hover:bg-red-200 text-red-800`;
      case 'medium':
        return `${baseClasses} bg-orange-100 hover:bg-orange-200 text-orange-800`;
      case 'low':
        return `${baseClasses} bg-green-100 hover:bg-green-200 text-green-800`;
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {timeSlots.map((slot) => {
          const isDisabled = isSlotDisabled(slot.time);
          return (
            <button
              key={slot.time}
              onClick={() => !isDisabled && onSlotSelect(slot.time)}
              disabled={isDisabled}
              className={clsx(
                'p-2 rounded-lg text-sm font-medium',
                selectedSlot === slot.time
                  ? 'ring-2 ring-blue-500 ring-offset-2'
                  : getRushColorClasses(slot.rush, isDisabled)
              )}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-100"></div>
          <span>High Rush</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-100"></div>
          <span>Medium Rush</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-100"></div>
          <span>Low Rush</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-200"></div>
          <span>Past Time</span>
        </div>
      </div>
    </div>
  );
}