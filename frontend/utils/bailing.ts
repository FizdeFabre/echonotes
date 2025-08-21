// bailing.ts
import { stripePromise } from "@/utils/stripe"; // ou ton bon chemin

export const redirectToCheckout = async (priceId: string) => {
  const stripe = await stripePromise;

  if (!stripe) {
    console.error("Stripe non initialisé");
    return;
  }

  const res = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId }),
  });

  const session = await res.json();

  const result = await stripe.redirectToCheckout({
    sessionId: session.id,
  });

  if (result?.error) console.error(result.error.message);
};