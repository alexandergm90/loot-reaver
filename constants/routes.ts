export const ROUTES = {
    intro: '/auth/intro',
    register: '/auth/register',
    main: {
        home: '/main/home',
        inventory: '/main/inventory',
        dungeon: '/main/dungeon',
        settings: '/main/settings',
    },
    auth: {
        login: '/auth/intro',
    },
} as const;
