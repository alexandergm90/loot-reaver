export const ROUTES = {
    intro: '/auth/intro',
    register: '/auth/register',
    main: {
        home: '/main/home',
        inventory: '/main/inventory',
        dungeon: '/main/dungeon',
        combat: '/main/combat',
        settings: '/main/settings',
    },
    auth: {
        login: '/auth/intro',
    },
} as const;

// Bottom navigation configuration
export const BOTTOM_NAV_ITEMS = [
    { label: 'Home', route: ROUTES.main.home },
    { label: 'Skills', route: null }, // TODO: Add route when available
    { label: 'Inventory', route: ROUTES.main.inventory },
    { label: 'Dungeon', route: ROUTES.main.dungeon },
    { label: 'Shop', route: null }, // TODO: Add route when available
    { label: 'Guild', route: null }, // TODO: Add route when available
] as const;

// Routes that should not show the bottom navigation
export const HIDE_BOTTOM_NAV_ROUTES = [
    ROUTES.main.combat,
] as const;
