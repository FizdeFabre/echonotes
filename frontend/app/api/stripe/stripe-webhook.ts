  import { buffer } from "micro";
  import Stripe from "stripe";
  import { createClient } from "@supabase/supabase-js";
  import type { NextApiRequest, NextApiResponse } from "next";

  export const config = {
    api: {
      bodyParser: false,
    },
  };

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {

  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const buf = await buffer(req);
   const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        buf.toString(),
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      const error = err as Error;
      console.error("Erreur webhook Stripe:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email;

    // Déduction du rôle (type d’abonnement)
    const priceId = session.metadata?.price_id 
    let type_abonnement = "gratuit"; // fallback
    if (priceId === "price_1RmbVdC4lwWUAKCQ39Mu4NFJ") type_abonnement = "premium";
    else if (priceId === "price_1RmpHwC4lwWUAKCQT56NtWfX") type_abonnement = "ultimate";

    // Mise à jour du profil
    const { error } = await supabase
      .from("profiles")
      .update({
        abonnement_actif: true,
        type_abonnement,
      })
      .eq("email", email); // ou .eq("user_id", id) si t’as l’ID

    if (error) {
      console.error("Erreur Supabase :", error.message);
      return res.status(500).send("Erreur lors de la mise à jour du profil.");
    }
  }


    res.status(200).json({ received: true });
  }
