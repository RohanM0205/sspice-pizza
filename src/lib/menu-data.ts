import heroPizza from "@/assets/hero-pizza.jpg";
import burgerImg from "@/assets/burger.jpg";
import pastaImg from "@/assets/pasta.jpg";
import sidesImg from "@/assets/sides.jpg";
import wrapImg from "@/assets/wrap.jpg";
import dessertImg from "@/assets/dessert.jpg";

export interface Variant {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
  variants: Variant[];
  addons: Addon[];
}

export interface Category {
  id: string;
  name: string;
  image: string;
  sortOrder: number;
}

export const categories: Category[] = [
  { id: "pizza", name: "Pizza", image: heroPizza, sortOrder: 1 },
  { id: "pasta", name: "Pasta", image: pastaImg, sortOrder: 2 },
  { id: "burgers", name: "Burgers", image: burgerImg, sortOrder: 3 },
  { id: "wraps", name: "Wraps", image: wrapImg, sortOrder: 4 },
  { id: "sides", name: "Sides", image: sidesImg, sortOrder: 5 },
  { id: "desserts", name: "Desserts", image: dessertImg, sortOrder: 6 },
];

export const products: Product[] = [
  {
    id: "p1",
    categoryId: "pizza",
    name: "Margherita Classic",
    description: "Fresh mozzarella, tangy tomato sauce, and aromatic basil on our signature crust",
    image: heroPizza,
    isAvailable: true,
    isFeatured: true,
    variants: [
      { id: "v1", name: "Regular (7\")", price: 149, isDefault: true },
      { id: "v2", name: "Medium (10\")", price: 249 },
      { id: "v3", name: "Large (12\")", price: 349 },
    ],
    addons: [
      { id: "a1", name: "Extra Cheese", price: 49 },
      { id: "a2", name: "Jalapeños", price: 29 },
      { id: "a3", name: "Olives", price: 39 },
    ],
  },
  {
    id: "p2",
    categoryId: "pizza",
    name: "Farm Fresh Veggie",
    description: "Loaded with capsicum, onion, tomato, sweet corn, and mushrooms",
    image: heroPizza,
    isAvailable: true,
    isFeatured: true,
    variants: [
      { id: "v4", name: "Regular (7\")", price: 179, isDefault: true },
      { id: "v5", name: "Medium (10\")", price: 299 },
      { id: "v6", name: "Large (12\")", price: 399 },
    ],
    addons: [
      { id: "a4", name: "Extra Cheese", price: 49 },
      { id: "a5", name: "Paneer Cubes", price: 59 },
    ],
  },
  {
    id: "p3",
    categoryId: "pizza",
    name: "Paneer Tikka Pizza",
    description: "Spiced paneer tikka with onions and capsicum on a tandoori base",
    image: heroPizza,
    isAvailable: true,
    isFeatured: true,
    variants: [
      { id: "v7", name: "Regular (7\")", price: 199, isDefault: true },
      { id: "v8", name: "Medium (10\")", price: 329 },
      { id: "v9", name: "Large (12\")", price: 449 },
    ],
    addons: [
      { id: "a6", name: "Extra Cheese", price: 49 },
      { id: "a7", name: "Extra Paneer", price: 69 },
    ],
  },
  {
    id: "p4",
    categoryId: "burgers",
    name: "Classic Veg Burger",
    description: "Crispy aloo tikki patty with fresh veggies and our signature sauce",
    image: burgerImg,
    isAvailable: true,
    isFeatured: true,
    variants: [
      { id: "v10", name: "Single", price: 99, isDefault: true },
      { id: "v11", name: "Double Patty", price: 149 },
    ],
    addons: [
      { id: "a8", name: "Extra Cheese Slice", price: 29 },
      { id: "a9", name: "Crispy Onion Rings", price: 39 },
    ],
  },
  {
    id: "p5",
    categoryId: "burgers",
    name: "Paneer Royale Burger",
    description: "Grilled paneer patty with chipotle mayo and crunchy lettuce",
    image: burgerImg,
    isAvailable: true,
    isFeatured: false,
    variants: [
      { id: "v12", name: "Regular", price: 129, isDefault: true },
      { id: "v13", name: "Jumbo", price: 179 },
    ],
    addons: [
      { id: "a10", name: "Extra Cheese", price: 29 },
    ],
  },
  {
    id: "p6",
    categoryId: "pasta",
    name: "Creamy Alfredo Pasta",
    description: "Rich and creamy white sauce pasta with herbs and parmesan",
    image: pastaImg,
    isAvailable: true,
    isFeatured: true,
    variants: [
      { id: "v14", name: "Regular", price: 179, isDefault: true },
      { id: "v15", name: "Large", price: 259 },
    ],
    addons: [
      { id: "a11", name: "Extra Cheese", price: 49 },
      { id: "a12", name: "Garlic Bread (2pcs)", price: 59 },
    ],
  },
  {
    id: "p7",
    categoryId: "pasta",
    name: "Arrabbiata Penne",
    description: "Spicy tomato sauce with garlic, chili flakes, and fresh herbs",
    image: pastaImg,
    isAvailable: true,
    isFeatured: false,
    variants: [
      { id: "v16", name: "Regular", price: 169, isDefault: true },
      { id: "v17", name: "Large", price: 249 },
    ],
    addons: [
      { id: "a13", name: "Extra Cheese", price: 49 },
    ],
  },
  {
    id: "p8",
    categoryId: "wraps",
    name: "Paneer Tikka Wrap",
    description: "Smoky paneer tikka wrapped in soft tortilla with mint chutney",
    image: wrapImg,
    isAvailable: true,
    isFeatured: false,
    variants: [
      { id: "v18", name: "Regular", price: 129, isDefault: true },
      { id: "v19", name: "Large", price: 179 },
    ],
    addons: [
      { id: "a14", name: "Extra Paneer", price: 49 },
    ],
  },
  {
    id: "p9",
    categoryId: "sides",
    name: "Classic Fries",
    description: "Golden crispy french fries seasoned with our special spice blend",
    image: sidesImg,
    isAvailable: true,
    isFeatured: false,
    variants: [
      { id: "v20", name: "Regular", price: 89, isDefault: true },
      { id: "v21", name: "Large", price: 129 },
    ],
    addons: [
      { id: "a15", name: "Cheese Dip", price: 29 },
      { id: "a16", name: "Peri Peri Seasoning", price: 19 },
    ],
  },
  {
    id: "p10",
    categoryId: "sides",
    name: "Garlic Bread",
    description: "Toasted bread with garlic butter and herbs, served with marinara",
    image: sidesImg,
    isAvailable: true,
    isFeatured: true,
    variants: [
      { id: "v22", name: "Plain (4pcs)", price: 99, isDefault: true },
      { id: "v23", name: "With Cheese (4pcs)", price: 139 },
    ],
    addons: [],
  },
  {
    id: "p11",
    categoryId: "desserts",
    name: "Choco Lava Cake",
    description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
    image: dessertImg,
    isAvailable: true,
    isFeatured: true,
    variants: [
      { id: "v24", name: "Single", price: 129, isDefault: true },
      { id: "v25", name: "With Ice Cream", price: 169 },
    ],
    addons: [],
  },
  {
    id: "p12",
    categoryId: "desserts",
    name: "Brownie Sundae",
    description: "Freshly baked brownie topped with ice cream and chocolate sauce",
    image: dessertImg,
    isAvailable: true,
    isFeatured: false,
    variants: [
      { id: "v26", name: "Regular", price: 149, isDefault: true },
    ],
    addons: [
      { id: "a17", name: "Extra Scoop", price: 49 },
    ],
  },
];
