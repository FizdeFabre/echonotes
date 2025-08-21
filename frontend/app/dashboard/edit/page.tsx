"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { EditSequenceDialog } from "@/app/components/EditSequenceDialog";

const ensureUtcISOString = (input: string | Date): string => {
    const d =
        typeof input === "string"
            ? new Date(input.endsWith("Z") ? input : input + "Z")
            : input;
    return d.toISOString();
};

export default function EditPage() {
    const { id } = useParams();
    const [open, setOpen] = useState(true);
    const [sequence, setSequence] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchSequence = async () => {
            const { data, error } = await supabase
                .from("email_sequences")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                console.error("Erreur :", error);
                setError("Error encountered while loading the sequence.");
                setLoading(false);
                return;
            }

            // Patch flamboyant : on corrige scheduled_at pour l'interprétation UTC
            if (data.scheduled_at) {
                data.scheduled_at = ensureUtcISOString(data.scheduled_at);
            }

            setSequence(data);
            setLoading(false);
        };

        fetchSequence();
    }, [id]);

    if (loading) return <p className="p-4">🔄 Loading ...</p>;
    if (error) return <p className="p-4 text-red-500">❌ {error}</p>;

    return (
        <>
            <EditSequenceDialog
                open={open}
                onClose={() => setOpen(false)}
                onUpdated={() => alert("✅ Sequence edited !")}
                sequence={sequence}
            />
            {!open && (
                <p className="p-4 text-sm text-gray-600 dark:text-gray-300">
                    Recharge the page, please.
                </p>
            )}
        </>
    );
}
