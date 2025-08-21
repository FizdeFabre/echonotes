export default function SubscribeButtonUltimate() {
    const handleClick = async () => {
        try {
            const response = await fetch("/api/create-checkout-session", {
                method: "POST",
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Erreur : impossible de démarrer la session Stripe");
            }
        } catch (error) {
            console.error("Erreur Stripe :", error);
            alert("Erreur réseau ou serveur 😵‍💫");
        }
    };

    return (
        <button
            onClick={handleClick}
            className="mt-4 inline-block rounded-md bg-yellow-600 px-4 py-2 text-white hover:bg-purple-700 transition-colors"
        >
            Subscribe (Stripe)
        </button>
    );
}