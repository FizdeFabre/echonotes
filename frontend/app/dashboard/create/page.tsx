"use client";

import { CreateSequenceDialog } from "@/app/components/CreateSequenceDialog";

export default function Page() {
    return (
        <div>
            <h1>Créer une séquence</h1>
            <CreateSequenceDialog
                open={true}
                onClose={() => { }}
                onCreated={() => { }}
                userId={"fake-id"}
            />
        </div>
    );
}