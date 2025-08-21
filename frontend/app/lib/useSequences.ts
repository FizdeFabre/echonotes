import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Sequence {
    id: string;
    created_at: string;
    subject: string;
    body: string;
    to_email: string;
    recurrence: string;
    scheduled_at: string;
    user_id: string;
}

export function useSequences(userId: string | null) {
    const [sequences, setSequences] = useState<Sequence[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;

        setLoading(true);
        supabase
            .from("email_sequences")
            .select("*")
            .eq("user_id", userId)
            .order("scheduled_at", { ascending: true })
            .then(({ data, error }) => {
                if (error) {
                    console.error("Erreur lors du fetch des séquences:", error);
                    setSequences([]);
                } else {
                    setSequences(data || []);
                }
                setLoading(false);
            });
    }, [userId]);

    return { sequences, loading };
}