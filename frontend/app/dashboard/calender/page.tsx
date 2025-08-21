
"use client";

import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { motion, AnimatePresence } from "framer-motion";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/app/styles/calendar.css";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import frLocale from "@fullcalendar/core/locales/fr";

import {
    format,
    parse,
    startOfWeek,
    getDay,
    addDays,
    addWeeks,
    addMonths,
    isAfter,
    isBefore,
} from "date-fns";
import { enGB } from "date-fns/locale";

import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";

import useSubscription from "../../lib/useSubscription";
import { useSequences } from "../../lib/useSequences";
import { setRequestMeta } from "next/dist/server/request-meta";

const locales = { enGB };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

type EventType = {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: {
        subject: string;
        to_email: string;
        recurrence: string;
        [key: string]: any;
    };
};

export default function CalendarPage() {
    const { loading, abonnementActif, type_Abonnement } = useSubscription();
    const [currentDate, setCurrentDate] = useState(new Date());

    const [events, setEvents] = useState<EventType[]>([]);
    const [selectedDayEvents, setSelectedDayEvents] = useState<EventType[]>([]);
    const [modalDate, setModalDate] = useState<Date | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.replace("/login");
                return;
            }
            setUserId(user.id);
        };

        fetchUser();
    }, [router]);

    const { sequences, loading: loadingSequences } = useSequences(userId);

    useEffect(() => {
        if (!sequences) return;

        const startWindow = addMonths(currentDate, -1);
        const endWindow = addMonths(currentDate, 3);
        const generated: EventType[] = [];

        sequences.forEach((seq) => {
            const recurrence = seq.recurrence || "none";
            const firstDate = new Date(seq.scheduled_at);
            let nextDate = new Date(firstDate);

            const intervalFn = {
                daily: (d: Date) => addDays(d, 1),
                weekly: (d: Date) => addWeeks(d, 1),
                monthly: (d: Date) => addMonths(d, 1),
            }[recurrence];

            if (!intervalFn) {
                if (isAfter(firstDate, startWindow) && isBefore(firstDate, endWindow)) {
                    generated.push({
                        title: seq.subject,
                        start: firstDate,
                        end: new Date(firstDate.getTime() + 60 * 60 * 1000),
                        allDay: false,
                        resource: seq,
                    });
                }
            } else {
                while (isBefore(nextDate, endWindow)) {
                    if (isAfter(nextDate, startWindow)) {
                        generated.push({
                            title: seq.subject,
                            start: new Date(nextDate),
                            end: new Date(nextDate.getTime() + 60 * 60 * 1000),
                            allDay: false,
                            resource: seq,
                        });
                    }
                    nextDate = intervalFn(nextDate);
                }
            }
        });

        const countsByDate: Record<string, number> = {};

        generated.forEach((event) => {
            const key = new Date(event.start).toDateString();
            countsByDate[key] = (countsByDate[key] || 0) + 1;
        });

        setEventCounts(countsByDate);
        setEvents(generated);
    }, [sequences, currentDate]);

    const handleSelectSlot = (slotInfo: { start: Date }) => {
        const clickedDate = slotInfo.start.toDateString();
        const dayEvents = events.filter(
            (event) => new Date(event.start).toDateString() === clickedDate
        );
        setSelectedDayEvents(dayEvents);
        setModalDate(slotInfo.start);
    };


    if (loading || loadingSequences) {
        return <p className="text-center text-gray-500 dark:text-gray-300">⏳ Chargement des séquences...</p>;
    }

    const abonnementsAutorises = ["premium", "ultimate"];

    if (!abonnementActif || !abonnementsAutorises.includes(type_Abonnement)) {
        return (
            <div className="max-w-xl mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔒 Accès réservé</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-4">
                    This functionality is unavailable to you. You can unlock it with the following plans : <strong>Premium</strong> or <strong >Ultimate </strong>

                </p>
                <a
                    href="/dashboard/bailing"
                    className="inline-block mt-6 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg shadow"
                >
                    Upgrading your plan 💳
                </a>
            </div>
        );
    }

    const MyEvent = ({ event }: { event: EventType }) => (
        <div className="bg-gradient-to-r from-indigo-900 to-fuchsia-500 text-white rounded-md px-2 py-1 text-xs shadow-md hover:scale-105 transition-transform font-semibold">
            {event.title}
        </div>
    );

    const CustomDateCellWrapper = ({ value, children }: any) => {
        const key = value.toDateString();
        const count = eventCounts?.[key] ?? 0;

        return (
            <div className="relative group hover:bg-pink-50 dark:hover:bg-pink-900 transition-all duration-200">
                {children}
                {count > 0 && (
                    <>
                        <span className="absolute top-1 right-1 bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5 shadow-md">
                            {count}
                        </span>
                        <div className="absolute z-10 hidden group-hover:block bg-gray-900 text-white text-xs rounded p-2 top-full right-0 mt-1 shadow-lg whitespace-nowrap">
                            {count} Sequence {count > 1 ? "s" : ""}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-6">
            <button
                onClick={() => router.push("/dashboard")}
                className="bg-indigo-600 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition"
            >
                ← Back to the Dashboard
            </button>

            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white font-poppins mt-4">
                Sequences Calendar
            </h1>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
                    initialView="dayGridMonth"
                    locales={[frLocale]}
                    locale="fr"
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                    }}
                    height={600}
                    selectable={true}
                    events={events.map(event => ({
                        title: event.title,
                        start: event.start,
                        end: event.end,
                        extendedProps: event.resource,
                        allDay: event.allDay,
                    }))}
                    dateClick={(arg) => handleSelectSlot({ start: arg.date })}
                    datesSet={({ start }) => {
                        const startDate = new Date(start);
                        if (currentDate.toDateString() !== startDate.toDateString()) {
                            setCurrentDate(startDate);
                        }
                    }}
                    eventContent={(arg) => (
                        <div className="truncate px-1 py-0.5 rounded text-xs font-medium bg-indigo-900 text-white shadow-sm">
                            {arg.event.title}
                        </div>
                    )}
                    dayMaxEvents={3}
                    moreLinkClick={(arg) => {
                        // Déclenche ton modal avec les séquences du jour
                        handleSelectSlot({ start: arg.date });
                        return "popover"; // ou "none" si tu veux désactiver le popover de base
                    }}
                />
            </div>

            {/* Bouton retour à aujourd'hui */}
            <button
                onClick={() => setCurrentDate(new Date())}
                className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-pink-700 text-white p-4 rounded-full shadow-lg transition-all z-50"
            >
                Back to the Current Day
            </button>

            {/* Modal animated */}
            <AnimatePresence>
                {modalDate && (
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl w-full shadow-2xl relative max-h-[80vh] overflow-y-auto">
                            <button
                                className="absolute top-3 right-3 text-xl text-gray-600 dark:text-gray-300 hover:text-red-600"
                                onClick={() => setModalDate(null)}
                            >
                                ✖
                            </button>

                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                Sequences planned for: {modalDate.toLocaleDateString("en-US")}
                            </h2>

                            {selectedDayEvents.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-300">
                                    No planned sequences. Create one in the Dashboard.
                                </p>
                            ) : (
                                Object.entries(
                                    selectedDayEvents.reduce((acc, event) => {
                                        const subject = event.resource.subject;
                                        acc[subject] = acc[subject] || [];
                                        acc[subject].push(event);
                                        return acc;
                                    }, {} as Record<string, EventType[]>)
                                ).map(([subject, group], i) => (
                                    <div key={i} className="mb-4">
                                        <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-400">
                                            {subject}
                                        </h3>
                                        <ul className="mt-2 space-y-2">
                                            {group.map((event, idx) => {
                                                // Normalize emails to array
                                                const emails = Array.isArray(event.resource.to_email)
                                                    ? event.resource.to_email
                                                    : event.resource.to_email
                                                        ? event.resource.to_email.split(",").map(e => e.trim())
                                                        : [];

                                                return (
                                                    <li
                                                        key={idx}
                                                        className="border-l-4 border-indigo-900 pl-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-md"
                                                    >
                                                        <p className="text-sm text-gray-700 dark:text-white">
                                                            📩 To:{" "}
                                                            {emails.length > 0 ? (
                                                                <ul className="list-disc list-inside">
                                                                    {emails.map((email, i) => (
                                                                        <li key={i}>{email}</li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <em>No emails specified</em>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-gray-400 italic">
                                                            🔁 Recurrence: {event.resource.recurrence || "None"}
                                                        </p>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}