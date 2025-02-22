import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import clsx from 'clsx';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  rushStatus: Record<string, 'high' | 'medium' | 'low'>;
}

export function Calendar({ selectedDate, onDateChange, rushStatus }: CalendarProps) {
  const renderDayContents = (day: number, date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const status = rushStatus[dateKey] || 'low';
    
    return (
      <div
        className={clsx(
          'w-full h-full flex items-center justify-center rounded-full',
          {
            'bg-red-100 text-red-800': status === 'high',
            'bg-orange-100 text-orange-800': status === 'medium',
            'bg-green-100 text-green-800': status === 'low',
          }
        )}
      >
        {day}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md">
      <DatePicker
        selected={selectedDate}
        onChange={(date: Date) => onDateChange(date)}
        inline
        renderDayContents={renderDayContents}
        minDate={new Date()}
      />
      <div className="mt-4 flex gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-100"></div>
          <span className="text-sm">High Rush</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-100"></div>
          <span className="text-sm">Medium Rush</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-100"></div>
          <span className="text-sm">Low Rush</span>
        </div>
      </div>
    </div>
  );
}