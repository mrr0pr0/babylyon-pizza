export const categoryNames = [
  "Kebab",
  "Grill",
  "Salater",
  "Barnemeny",
  "Pizza",
  "Tilbehor",
  "Drikke",
] as const;

export type MockMenuItem = {
  id: number;
  name: string;
  description: string;
  fromPrice: number;
  category: (typeof categoryNames)[number];
  location: string;
  allergens: string[];
};

export const mockMenuItems: MockMenuItem[] = [
  {
    id: 1,
    name: "Rull Kebab",
    description: "Kebabkjott med salat og valgfri saus i hjemmelaget brod.",
    fromPrice: 139,
    category: "Kebab",
    location: "as",
    allergens: ["Gluten"],
  },
  {
    id: 2,
    name: "Babylon Spesial",
    description: "Tomatsaus, ost, kebabkjott, paprika, log og jalapenos.",
    fromPrice: 214,
    category: "Pizza",
    location: "as",
    allergens: ["Melk", "Gluten"],
  },
  {
    id: 3,
    name: "Cheeseburger Tall.",
    description: "Serveres med pommes frites og dressing.",
    fromPrice: 149,
    category: "Grill",
    location: "vestby",
    allergens: ["Melk", "Gluten"],
  },
];
