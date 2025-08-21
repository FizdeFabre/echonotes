interface MultiEmailDisplayProps {
    emails: string[] | null;
}

export function MultiEmailDisplay({ emails }: MultiEmailDisplayProps) {
    if (!emails || emails.length === 0) return <span className="italic">0 Email</span>;

    const displayLimit = 4;
    const visibleEmails = emails.slice(0, displayLimit);
    const remainingCount = emails.length - displayLimit;

    return (
        <div className="flex flex-wrap gap-1">
            {visibleEmails.map((email, idx) => (
                <span
                    key={idx}
                    className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 text-xs px-2 py-1 rounded-full truncate max-w-[120px]"
                    title={email}
                >
                    {email}
                </span>
            ))}
            {remainingCount > 0 && (
                <span className="text-xs text-gray-600 dark:text-gray-300 italic">
                    And {remainingCount}+ Other
                </span>
            )}
        </div>
    );
}