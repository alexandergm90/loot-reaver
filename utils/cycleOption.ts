export const cycleOption = (
    options: string[],
    current: string,
    direction: 'next' | 'prev'
): string => {
    const index = options.indexOf(current);
    const newIndex =
        direction === 'next'
            ? (index + 1) % options.length
            : (index - 1 + options.length) % options.length;
    return options[newIndex];
};