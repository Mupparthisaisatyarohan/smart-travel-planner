export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(String(email || '').trim());
};

export const getInitials = (username) => {
    if (!username) return "";
    const names = username.split(" ");
    let initials = names[0].charAt(0).toUpperCase();
    if (names.length > 1) {
        initials += names[names.length - 1].charAt(0).toUpperCase();
    }
    return initials;
};

export const getEmptyCardMessage = (filterType) => {
    switch (filterType) {
        case "search":
            return `Oops! No stories found matching your search .`;

        case "date":
            return `No stories found in the given date range`;

        default:
            return `Start creating your first travel story`
    }
};