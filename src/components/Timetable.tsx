import React, { useState } from 'react';
import { ScheduleItem } from '../types';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface TimetableProps {
  month: string;
  schedule: ScheduleItem[];
}

const DAYS = ['월', '화', '수', '목', '금', '토'];

export default function Timetable({ month, schedule = [] }: TimetableProps) {
  const [activeDay, setActiveDay] = useState('월');
  
  // Get unique time slots and sort them
  const safeSchedule = Array.isArray(schedule) ? schedule : [];
  const timeSlots = Array.from(new Set(safeSchedule.map(item => item.timeSlot))).sort();

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
              {timeSlots.map(slot => {
                const items = safeSchedule.filter(item => item.day === activeDay && item.timeSlot === slot);
                if (items.length === 0) return null;

                return (
                  <div key={slot} className="flex gap-4 items-start bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <div className="w-24 shrink-0 pt-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time</span>
                      <p className="text-sm font-bold text-gray-700">{slot}</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {items.map(item => (
                        <div
                          key={item.id}
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
                      ))}
                    </div>
                  </div>
                );
              })}
              {safeSchedule.filter(item => item.day === activeDay).length === 0 && (
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
        <div className="min-w-[800px]">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
            <div className="p-4 text-center font-bold text-gray-400 text-sm">시간</div>
            {DAYS.map(day => (
              <div key={day} className="p-4 text-center font-bold text-gray-900">{day}</div>
            ))}
          </div>
          
          <div className="divide-y divide-gray-100">
            {timeSlots.map(slot => (
              <div key={slot} className="grid grid-cols-7 group hover:bg-gray-50/30 transition-colors">
                <div className="p-4 flex items-center justify-center text-xs font-medium text-gray-500 bg-gray-50/30">
                  {slot}
                </div>
                {DAYS.map(day => {
                  const items = safeSchedule.filter(item => item.day === day && item.timeSlot === slot);
                  return (
                    <div key={`${day}-${slot}`} className="p-2 border-l border-gray-50 flex flex-col gap-2 min-h-[80px] justify-center">
                      {items.map(item => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-2 rounded-lg text-xs font-semibold shadow-sm border border-black/5 flex flex-col gap-1"
                          style={{ 
                            backgroundColor: item.color || '#F3F4F6',
                            color: '#1F2937'
                          }}
                        >
                          <span>{item.className}</span>
                          {item.isGroup && (
                            <span className="text-[10px] opacity-60 font-normal">그룹수업</span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
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
