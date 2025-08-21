import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function useSubscription() {
  const [loading, setLoading] = useState(true);
  const [abonnementActif, setAbonnementActif] = useState(false);
  const [type_Abonnement, setType_Abonnement] = useState<"gratuit" | "premium" | "ultimate">("gratuit");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Même quand pas de user, on finit le chargement
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("abonnement_actif, type_abonnement")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setAbonnementActif(data.abonnement_actif);
        setType_Abonnement(data.type_abonnement);
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  return { loading, abonnementActif, type_Abonnement };
}