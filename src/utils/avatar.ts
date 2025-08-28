// Simple hash function to generate consistent colors from names
const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
};

// Get consistent background color based on name
export const getAvatarColor = (name: string, isGroup: boolean = false): string => {
    const hash = hashString(name);
    const colors = isGroup
        ? ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd']
        : ['#b6e3f4', '#c0aede', '#ffd5dc', '#ffdfbf', '#a8e6cf', '#dcedc1', '#ffd3b6', '#ffaaa5'];

    return colors[hash % colors.length];
};

// Generate avatar URL for users (returns null to use initials)
export const generateUserAvatar = async (name: string, size: number = 100): Promise<string | null> => {
    return null; // Use initials instead
};

// Generate avatar URL for groups (returns null to use initials)
export const generateGroupAvatar = async (name: string, size: number = 100): Promise<string | null> => {
    return null; // Use initials instead
};

// Get initials from name for fallback
export const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};
