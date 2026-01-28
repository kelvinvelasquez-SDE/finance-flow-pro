export function getRecommendedCard(cards) {
    if (!cards || cards.length === 0) return null;

    const today = new Date();
    const currentDay = today.getDate();

    // Sort cards by how recently their cycle started (best for financing)
    // New cycle starts day AFTER cutoff.
    // We want the card where (today - (cutoff + 1)) is small and positive.
    // Or rather: Time remaining until NEXT cutoff should be MAXIMIZED.

    const scoredCards = cards.map(card => {
        let nextCutoff = new Date(today);
        nextCutoff.setDate(card.cutoff_day);

        if (currentDay > card.cutoff_day) {
            // Cutoff passed this month, next one is next month
            nextCutoff.setMonth(nextCutoff.getMonth() + 1);
        }

        // Days remaining until next cutoff
        const msPerDay = 1000 * 60 * 60 * 24;
        const daysUntilCutoff = Math.ceil((nextCutoff - today) / msPerDay);

        return { ...card, daysUntilCutoff };
    });

    // The card with HIGHEST daysUntilCutoff gives you the longest time before bill is generated
    // Plus usually ~20 days to pay.
    scoredCards.sort((a, b) => b.daysUntilCutoff - a.daysUntilCutoff);

    return scoredCards[0];
}

export function calculateProgress(start, end, current) {
    // Simple linear progress
    return 0; // TODO
}
