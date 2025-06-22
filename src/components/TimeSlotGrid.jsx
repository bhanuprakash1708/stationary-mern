import React, { useState } from 'react';
import { format } from 'date-fns';
import clsx from 'clsx';

export function TimeSlotGrid({ selectedDate, rushStatuses, onRushStatusChange }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('low');

  // Generate time slots from 9:00 AM to 5:00 PM in 10-minute intervals
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 6) + 9;
    const minute = (i % 6) * 10;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
  });

  const getRushStatus = (slot) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const key = `${dateStr}_${slot}`;

    if (rushStatuses[key]) {
      return rushStatuses[key];
    }

    // Default rush status logic (same as customer interface)
    const time = slot.replace(/\s(AM|PM)/, '');
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr);
    const isPM = slot.includes('PM');
    const hour24 = isPM && hour !== 12 ? hour + 12 : (!isPM && hour === 12 ? 0 : hour);

    if (hour24 >= 9 && hour24 <= 11) {
      return 'high'; // Morning rush
    } else if ((hour24 >= 14 && hour24 <= 15) || hour24 === 12) {
      return 'medium'; // Lunch and afternoon rush
    } else {
      return 'low';
    }
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
  };

  const handleStatusChange = (status) => {
    if (selectedSlot) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      onRushStatusChange(dateStr, selectedSlot, status);
      setSelectedSlot(null); // Deselect after setting status
    }
  };

  const getRushColorClasses = (slot) => {
    const status = getRushStatus(slot);
    const isSelected = selectedSlot === slot;

    const baseClasses = 'p-2 text-xs rounded-lg transition-colors cursor-pointer border-2';

    if (isSelected) {
      return `${baseClasses} border-blue-500 bg-blue-50`;
    }

    switch (status) {
      case 'high':
        return `${baseClasses} border-red-200 bg-red-100 hover:bg-red-200 text-red-800`;
      case 'medium':
        return `${baseClasses} border-orange-200 bg-orange-100 hover:bg-orange-200 text-orange-800`;
      case 'low':
        return `${baseClasses} border-green-200 bg-green-100 hover:bg-green-200 text-green-800`;
      default:
        return `${baseClasses} border-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-800`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">How to set rush status:</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Click on a time slot to select it</li>
          <li>2. Choose the rush level using the buttons below</li>
          <li>3. The time slot color will update automatically</li>
        </ol>
      </div>

      {/* Rush Status Controls */}
      {selectedSlot && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">
            Set rush status for {selectedSlot} on {format(selectedDate, 'MMMM d, yyyy')}:
          </h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('low')}
              className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium transition-colors"
            >
              Low Rush
            </button>
            <button
              onClick={() => handleStatusChange('medium')}
              className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg font-medium transition-colors"
            >
              Medium Rush
            </button>
            <button
              onClick={() => handleStatusChange('high')}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg font-medium transition-colors"
            >
              High Rush
            </button>
            <button
              onClick={() => setSelectedSlot(null)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Time Slot Grid */}
      <div className="grid grid-cols-6 gap-2">
        {timeSlots.map((slot) => (
          <button
            key={slot}
            onClick={() => handleSlotClick(slot)}
            className={getRushColorClasses(slot)}
            title={`${slot} - ${getRushStatus(slot)} rush`}
          >
            <div className="text-center">
              <div className="font-medium">{slot}</div>
              <div className="text-xs opacity-75 capitalize">{getRushStatus(slot)}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-100 border border-green-200"></div>
          <span>Low Rush</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-100 border border-orange-200"></div>
          <span>Medium Rush</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-100 border border-red-200"></div>
          <span>High Rush</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-50 border border-blue-500"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}
