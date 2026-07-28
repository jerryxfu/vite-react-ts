// Navigation data + types.
//
// A drawer item is either a `link` (navigates, then closes the drawer)
// or a `branch` (drills one level deeper, i.e. creates a new level of navigation).

export type DrawerLink = {
    type: "link";
    label: string;
    href: string;
};

// Nestable to any depth
export type DrawerBranch = {
    type: "branch";
    label: string;
    key: string; // stable id for this branch (used for animation keys)
    children: DrawerItem[];
};

export type DrawerItem = DrawerLink | DrawerBranch;

// Text shown by the brand/logo in the top-left.
export const BRAND = "Acme";

// Links shown inline in the top bar
export const inlineLinks: { href: string; label: string }[] = [
    {href: "/", label: "Home"},
    {href: "/about", label: "About"},
];

// The drawer's grouped menu. The root is an array of groups (rendered with a
// divider between each); every branch is a single group one level down.
export const menuGroups: DrawerItem[][] = [
    [
        {type: "link", label: "Home", href: "/"},
        {type: "link", label: "About", href: "/about"},
    ],
    [
        {
            type: "branch",
            label: "Products",
            key: "products",
            children: [
                {type: "link", label: "All products", href: "/products"},
                {type: "link", label: "Featured", href: "/products?filter=featured"},
                {
                    type: "branch",
                    label: "Categories",
                    key: "products-categories",
                    children: [
                        {type: "link", label: "Category A", href: "/products?category=a"},
                        {type: "link", label: "Category B", href: "/products?category=b"},
                    ],
                },
            ],
        },
        {type: "link", label: "Pricing", href: "/pricing"},
    ],
    [
        {type: "link", label: "Contact", href: "/contact"},
    ],
];