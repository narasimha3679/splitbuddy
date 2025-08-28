import { generateUserAvatar, generateGroupAvatar, getInitials } from './avatar';

// Simple test to verify avatar generation
export const testAvatarGeneration = () => {
    console.log('Testing avatar generation...');

    // Test user avatar
    const userAvatar = generateUserAvatar('John Doe');
    console.log('User avatar generated:', userAvatar.substring(0, 50) + '...');

    // Test group avatar
    const groupAvatar = generateGroupAvatar('Trip to Paris');
    console.log('Group avatar generated:', groupAvatar.substring(0, 50) + '...');

    // Test initials
    const initials = getInitials('John Doe');
    console.log('Initials for "John Doe":', initials);

    const initials2 = getInitials('Alice Johnson Smith');
    console.log('Initials for "Alice Johnson Smith":', initials2);

    console.log('Avatar generation test completed!');
};

// Export for manual testing
export default testAvatarGeneration;
