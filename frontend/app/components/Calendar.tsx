"use client";

import { useState } from "react";
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
} from "date-fns";
import { fr } from "date-fns/locale";

type EventType = {
    title: string;
    date: Date;
};

const dummyEvents: EventType[] = [
    { title: "Rituel de feu 🔥", date: new Date() },
    { title: "Invocation du chat démoniaque 🐈‍⬛", date: addDays(new Date(), 3) },
    { title: "Révision exam magie noire", date: addDays(new Date(), 7) },
];

export default function CustomCalendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: fr });
    const endDate = endOfWeek(monthEnd, { locale: fr });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderHeader = () => (
        <div className="flex justify-between items-center mb-4">
            <button onClick={prevMonth} className="text-pink-500 hover:text-pink-700 text-xl">←</button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {format(currentMonth, "MMMM yyyy", { locale: fr })}
            </h2>
            <button onClick={nextMonth} className="text-pink-500 hover:text-pink-700 text-xl">→</button>
        </div>
    );

    const renderDays = () => {
        const days = [];
        const date = startOfWeek(new Date(), { locale: fr });

        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    {format(addDays(date, i), "EEEEEE", { locale: fr })}
                </div>
            );
        }

        return <div className="grid grid-cols-7 mb-2">{days}</div>;
    };

    const renderCells = () => {
        const rows = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            const days = [];

            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, "d", { locale: fr });
                const cloneDay = day;
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                const events = dummyEvents.filter((ev) => isSameDay(ev.date, day));

                days.push(
                    <div
                        key={day.toString()}
                        className={`p-2 border border-gray-200 dark:border-gray-700 h-24 cursor-pointer transition-all duration-150
                            ${!isCurrentMonth ? "bg-gray-100 dark:bg-gray-800 text-gray-400" : ""}
                            ${isToday ? "bg-pink-100 dark:bg-pink-900 border-pink-500" : ""}
                            ${isSelected ? "ring-2 ring-pink-500" : ""}
                        `}
                        onClick={() => setSelectedDate(cloneDay)}
                    >
                        <div className="text-xs font-bold mb-1">{formattedDate}</div>

                        {events.length > 0 && (
                            <ul className="space-y-1">
                                {events.map((ev, idx) => (
                                    <li
                                        key={idx}
                                        className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded shadow"
                                    >
                                        {ev.title}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                );

                day = addDays(day, 1);
            }

            rows.push(
                <div key={day.toString()} className="grid grid-cols-7">
                    {days}
                </div>
            );
        }

        return <div className="grid gap-1">{rows}</div>;
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
}