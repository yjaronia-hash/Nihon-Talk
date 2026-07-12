import React, { useState } from 'react';
import { ScheduleItem } from '../types';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface TimetableProps {
  month: string;
  schedule: ScheduleItem[];
  timeSlots?: string[];
}

const DAYS = ['월', '화', '수', '목', '금'];

const DEFAULT_TIME_SLOTS = [
  "10:00-10:30",
  "10:30-11:00",
  "11:00-11:30",
  "11:30-12:00",
  "12:00-12:30",
  "12:30-13:00",
  "13:00-13:30",
  "13:30-14:00",
  "14:00-14:30",
  "14:30-15:00",
  "15:00-15:30",
  "15:30-16:00",
  "16:00-16:30",
  "16:30-17:00",
  "17:00-17:30",
  "17:30-18:00",
  "18:00-18:30",
  "18:30-19:00",
  "19:00-19:30",
  "19:30-20:00",
  "20:00-20:30",
  "20:30-21:00"
];

const parseTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const parseSlot = (slotStr: string): [number, number] | null => {
  if (!slotStr || !slotStr.includes('-')) return null;
  const parts = slotStr.split('-');
  if (parts.length !== 2) return null;
  const start = parseTimeToMinutes(parts[0].trim());
  const end = parseTimeToMinutes(parts[1].trim());
  if (isNaN(start) || isNaN(end)) return null;
  return [start, end];
};

const isItemInSlot = (item: { timeSlot: string }, slot: string): boolean => {
  if (item.timeSlot === slot) return true;
  const itemTimes = parseSlot(item.timeSlot);
  const slotTimes = parseSlot(slot);
  if (!itemTimes || !slotTimes) return false;
  const [itemStart, itemEnd] = itemTimes;
  const [slotStart, slotEnd] = slotTimes;
  return itemStart < slotEnd && itemEnd > slotStart;
};

export default function Timetable({ month, schedule = [], timeSlots: timeSlotsProp }: TimetableProps) {
  const [activeDay, setActiveDay] = useState('월');
  
  const safeSchedule = Array.isArray(schedule) ? schedule : [];
  const timeSlots = timeSlotsProp && timeSlotsProp.length > 0 ? timeSlotsProp : DEFAULT_TIME_SLOTS;

  const isItemStartingAtSlot = (item: { timeSlot: string }, sIdx: number): boolean => {
    const intersectsCurrent = isItemInSlot(item, timeSlots[sIdx]);
    if (!intersectsCurrent) return false;
    if (sIdx === 0) return true;
    const intersectsPrevious = isItemInSlot(item, timeSlots[sIdx - 1]);
    return !intersectsPrevious;
  };

  const getRowSpan = (item: { timeSlot: string }, startIdx: number): number => {
    let span = 1;
    for (let i = startIdx + 1; i < timeSlots.length; i++) {
      if (isItemInSlot(item, timeSlots[i])) {
        span++;
      } else {
        break;
      }
    }
    return span;
  };

  const isCellCovered = (day: string, sIdx: number, schedule: any[]): boolean => {
    for (let prevIdx = 0; prevIdx < sIdx; prevIdx++) {
      const prevItems = schedule.filter(item => item.day === day && isItemStartingAtSlot(item, prevIdx));
      if (prevItems.length > 0) {
        const span = Math.max(...prevItems.map(item => getRowSpan(item, prevIdx)));
        if (prevIdx + span > sIdx) {
          return true;
        }
      }
    }
    return false;
  };

  // For Mobile: filter and sort items of the active day to avoid duplicating across multiple slots
  const dayItems = safeSchedule
    .filter(item => item.day === activeDay)
    .sort((a, b) => {
      const aTimes = parseSlot(a.timeSlot);
      const bTimes = parseSlot(b.timeSlot);
      if (!aTimes || !bTimes) return 0;
      return aTimes[0] - bTimes[0];
    });

  if (safeSchedule.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        등록된 시간표 정보가 없습니다. 관리자 페이지에서 시간표를 추가해 주세요.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile Tab View */}
      <div className="block md:hidden">
        <div className="flex justify-between gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={cn(
                "flex-1 py-3 text-sm font-bold rounded-lg transition-all",
                activeDay === day 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {dayItems.map(item => (
                <div key={item.id} className="flex gap-4 items-start bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div className="w-24 shrink-0 pt-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time</span>
                    <p className="text-sm font-bold text-gray-700">{item.timeSlot}</p>
                  </div>
                  <div className="flex-1">
                    <div
                      className="p-3 rounded-xl text-sm font-bold shadow-sm border border-black/5 flex flex-col gap-1"
                      style={{ 
                        backgroundColor: item.color || '#FFFFFF',
                        color: '#1F2937'
                      }}
                    >
                      <span>{item.className}</span>
                      {item.isGroup && (
                        <span className="text-[10px] opacity-60 font-normal">그룹수업</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {dayItems.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-sm italic">
                  해당 요일에는 예정된 수업이 없습니다.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto pb-4">
        <div className="min-w-[800px] border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <table className="w-full border-collapse text-left table-fixed">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-200">
                <th className="p-4 text-center font-bold text-gray-400 text-sm w-28">시간</th>
                {DAYS.map(day => (
                  <th key={day} className="p-4 text-center font-bold text-gray-900 border-l border-gray-100 w-1/5">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {timeSlots.map((slot, sIdx) => (
                <tr key={slot} className="hover:bg-gray-50/20 transition-colors h-20">
                  <td className="p-4 text-center text-xs font-semibold text-gray-500 bg-gray-50/30 w-28 align-middle h-20">
                    {slot}
                  </td>
                  {DAYS.map(day => {
                    // Check if this cell is covered by a spanning class starting earlier
                    if (isCellCovered(day, sIdx, safeSchedule)) {
                      return null; // Skip rendering this cell since it's spanned by a rowSpan
                    }

                    const startingItems = safeSchedule.filter(item => item.day === day && isItemStartingAtSlot(item, sIdx));
                    if (startingItems.length > 0) {
                      const span = Math.max(...startingItems.map(item => getRowSpan(item, sIdx)));
                      return (
                        <td 
                          key={`${day}-${slot}`} 
                          rowSpan={span} 
                          className="p-1 border-l border-gray-100 h-1"
                        >
                          <div className="flex flex-col h-full justify-stretch">
                            {startingItems.map(item => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-3 rounded-xl text-xs font-bold shadow-sm border border-black/5 flex flex-col gap-1 h-full flex-1 justify-center"
                                style={{ 
                                  backgroundColor: item.color || '#F3F4F6',
                                  color: '#1F2937'
                                }}
                              >
                                <span className="text-sm tracking-tight leading-snug">{item.className}</span>
                                <span className="text-[10px] text-gray-500 font-mono mt-1">{item.timeSlot}</span>
                                {item.isGroup && (
                                  <span className="inline-block self-start mt-1 px-1.5 py-0.5 text-[9px] bg-black/5 text-gray-600 rounded font-normal">그룹수업</span>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </td>
                      );
                    }

                    // Empty cell
                    return (
                      <td 
                        key={`${day}-${slot}`} 
                        className="p-2 border-l border-gray-100 h-20"
                      />
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      
      <div className="mt-8 p-6 bg-yellow-50/50 rounded-2xl border border-yellow-100/50">
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex gap-2">
            <span className="font-bold text-yellow-600">•</span>
            <span>색깔이 있는 클래스(능력시험반, 프리토킹 등)는 그룹수업입니다.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-yellow-600">•</span>
            <span>그 외 수업은 레벨/목표에 맞춘 개인 집중 케어 수업(소수정예)으로 진행됩니다.</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-yellow-600">•</span>
            <span>상세한 합류 가능 자리는 카카오톡이나 전화로 문의해 주세요.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
