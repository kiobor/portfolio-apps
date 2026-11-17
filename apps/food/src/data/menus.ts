import type { DishTag, MenuItem, MenuSection } from "./types";

const dish = (
  id: string,
  name: string,
  description: string,
  price: number,
  tags: DishTag[] = [],
): MenuItem => ({ id, name, description, price, tags });

/** Menu inventati, uno per ristorante (chiave = id del ristorante). */
export const menus: Record<string, MenuSection[]> = {
  "salt-and-lime": [
    { title: "Tacos", items: [
      dish("sl-1", "Baja fish taco", "Crispy white fish, lime slaw, chipotle crema", 5.5, ["popular"]),
      dish("sl-2", "Al pastor taco", "Marinated pork, pineapple, coriander", 5),
      dish("sl-3", "Mushroom taco", "Roasted oyster mushrooms, salsa verde, pickled onion", 4.8, ["vegan"]),
    ] },
    { title: "Ceviche", items: [
      dish("sl-4", "Sea bass ceviche", "Citrus-cured sea bass, red onion, chilli, sweet potato", 13.5, ["popular"]),
      dish("sl-5", "Shrimp and mango ceviche", "Lime, mango, cucumber, toasted corn", 14.5),
    ] },
    { title: "Sides and drinks", items: [
      dish("sl-6", "Grilled corn", "Cotija, lime, chilli", 5.5, ["spicy"]),
      dish("sl-7", "Hibiscus agua fresca", "House-made, lightly sweet", 3.5, ["vegan"]),
    ] },
  ],
  "sweet-crumb": [
    { title: "Pastries", items: [
      dish("sc-1", "Brown butter croissant", "Laminated daily, sea salt", 3.8, ["popular"]),
      dish("sc-2", "Cardamom bun", "Swedish-style, pearl sugar", 3.6),
      dish("sc-3", "Pistachio twist", "Almond cream, roasted pistachio", 4.2),
    ] },
    { title: "Cakes and tarts", items: [
      dish("sc-4", "Strawberry pistachio tart", "Vanilla custard, fresh strawberries", 6.5, ["popular"]),
      dish("sc-5", "Chocolate layer cake", "Dark chocolate ganache, hazelnut crunch", 6.8),
      dish("sc-6", "Crumb loaf slice", "Brown sugar crumb, cinnamon", 4.5),
    ] },
    { title: "Drinks", items: [
      dish("sc-7", "Flat white", "Double shot, steamed milk", 3.8),
      dish("sc-8", "Iced oat latte", "Espresso, oat milk, ice", 4.2, ["vegan"]),
    ] },
  ],
  "green-table": [
    { title: "Salads", items: [
      dish("gt-1", "Harvest salad", "Roasted squash, kale, pomegranate, tahini dressing", 11.5, ["popular", "vegan"]),
      dish("gt-2", "Greek-ish salad", "Cucumber, tomato, olives, whipped feta", 10.5),
      dish("gt-3", "Crunchy peanut salad", "Cabbage, carrot, herbs, lime-peanut dressing", 10.8, ["vegan", "spicy"]),
    ] },
    { title: "Bowls", items: [
      dish("gt-4", "Falafel bowl", "Quinoa, falafel, hummus, pickled cabbage", 12.5, ["popular"]),
      dish("gt-5", "Miso roots bowl", "Brown rice, miso-glazed carrots, edamame", 12, ["vegan"]),
    ] },
    { title: "Drinks", items: [
      dish("gt-6", "Ginger lemonade", "Fresh ginger, lemon, honey", 3.8),
    ] },
  ],
  "poke-harbour": [
    { title: "Signature bowls", items: [
      dish("ph-1", "Salmon classic", "Salmon, avocado, edamame, cucumber, sesame", 14.5, ["popular"]),
      dish("ph-2", "Spicy tuna", "Tuna, sriracha mayo, mango, crispy onion", 15.5, ["spicy"]),
      dish("ph-3", "Tofu garden", "Marinated tofu, seaweed salad, radish, avocado", 13, ["vegan"]),
    ] },
    { title: "Build your own", items: [
      dish("ph-4", "Regular bowl", "Pick a base, one protein and four toppings", 12.5),
      dish("ph-5", "Large bowl", "Pick a base, two proteins and six toppings", 15.5),
    ] },
    { title: "Sides", items: [
      dish("ph-6", "Edamame", "Sea salt", 4.2, ["vegan"]),
      dish("ph-7", "Seaweed salad", "Sesame, rice vinegar", 4.8, ["vegan"]),
    ] },
  ],
  "sunny-side": [
    { title: "Eggs", items: [
      dish("ss-1", "Avocado toast and eggs", "Sourdough, smashed avocado, two poached eggs", 11.5, ["popular"]),
      dish("ss-2", "Shakshuka", "Spiced tomato, baked eggs, feta, flatbread", 12.5, ["spicy"]),
      dish("ss-3", "Egg and bacon roll", "Brioche, fried egg, smoked bacon, brown sauce", 8.5),
    ] },
    { title: "Sweet", items: [
      dish("ss-4", "Buttermilk pancakes", "Maple syrup, berries, whipped butter", 10.5, ["popular"]),
      dish("ss-5", "French toast", "Brioche, banana, cinnamon sugar", 10.8),
    ] },
    { title: "Drinks", items: [
      dish("ss-6", "Fresh orange juice", "Squeezed to order", 4.5, ["vegan"]),
      dish("ss-7", "Cappuccino", "Double shot, silky milk", 3.6),
    ] },
  ],
  "press-and-pour": [
    { title: "Smoothies", items: [
      dish("pp-1", "Green machine", "Spinach, pineapple, banana, ginger", 6.5, ["popular", "vegan"]),
      dish("pp-2", "Berry blast", "Strawberry, blueberry, banana, oat milk", 6.5, ["vegan"]),
      dish("pp-3", "Peanut power", "Peanut butter, banana, cacao, oat milk", 6.8, ["vegan"]),
    ] },
    { title: "Cold-pressed juices", items: [
      dish("pp-4", "Beet and apple", "Beetroot, apple, lemon, ginger", 5.8, ["vegan"]),
      dish("pp-5", "Sunrise", "Orange, carrot, turmeric", 5.5, ["vegan"]),
    ] },
    { title: "Shots", items: [
      dish("pp-6", "Ginger shot", "Ginger, lemon, cayenne", 2.5, ["vegan", "spicy"]),
    ] },
  ],
  "root-and-sprout": [
    { title: "Plates", items: [
      dish("rs-1", "Charred cauliflower", "Tahini, herb oil, dukkah, pomegranate", 14, ["popular", "vegan"]),
      dish("rs-2", "Mushroom bao", "Soy-glazed king oyster, pickled cucumber, hoisin", 13.5, ["vegan"]),
      dish("rs-3", "Smoky aubergine", "Miso glaze, black sesame, crispy shallots", 14.5, ["vegan"]),
    ] },
    { title: "Bowls", items: [
      dish("rs-4", "Roots and grains", "Farro, roasted beets, carrots, almond cream", 15, ["vegan"]),
      dish("rs-5", "Lentil dal bowl", "Coconut dal, basmati, coriander chutney", 14, ["vegan", "spicy"]),
    ] },
    { title: "Dessert", items: [
      dish("rs-6", "Cacao avocado mousse", "Raspberries, toasted coconut", 7.5, ["vegan"]),
    ] },
  ],
  "bowl-theory": [
    { title: "Grain bowls", items: [
      dish("bt-1", "Chicken and corn", "Brown rice, grilled chicken, charred corn, beans", 12.5, ["popular"]),
      dish("bt-2", "Sweet potato bowl", "Farro, roasted sweet potato, kale, tahini", 12, ["vegan"]),
      dish("bt-3", "Teriyaki salmon", "Sushi rice, salmon, pickled ginger, greens", 14),
    ] },
    { title: "Add-ons", items: [
      dish("bt-4", "Extra avocado", "Half, sliced", 2.2, ["vegan"]),
      dish("bt-5", "Soft egg", "Marinated, halved", 1.5),
    ] },
    { title: "Drinks", items: [
      dish("bt-6", "Iced green tea", "Unsweetened, lemon", 3.2, ["vegan"]),
    ] },
  ],
  "leaf-society": [
    { title: "Salads", items: [
      dish("ls-1", "Caesar-ish", "Little gem, parmesan, crunchy croutons, anchovy dressing", 10.5, ["popular"]),
      dish("ls-2", "Rainbow slaw", "Red cabbage, carrot, mango, lime dressing", 9.5, ["vegan"]),
      dish("ls-3", "Beet and goat cheese", "Roasted beets, rocket, walnuts, honey", 11),
    ] },
    { title: "Add protein", items: [
      dish("ls-4", "Grilled chicken", "Lemon and thyme", 3.5),
      dish("ls-5", "Crispy tofu", "Soy and sesame", 3, ["vegan"]),
    ] },
    { title: "Drinks", items: [
      dish("ls-6", "Cucumber mint water", "Still, fresh", 2.8, ["vegan"]),
    ] },
  ],
  "morning-ritual": [
    { title: "Brunch", items: [
      dish("mr-1", "Ricotta toast", "Whipped ricotta, roasted grapes, honey, thyme", 10.5, ["popular"]),
      dish("mr-2", "Breakfast board", "Eggs, bacon, roast tomato, mushrooms, sourdough", 13.5),
      dish("mr-3", "Granola bowl", "Greek yoghurt, seasonal fruit, honey", 8.5),
    ] },
    { title: "Coffee and more", items: [
      dish("mr-4", "Flat white", "Double shot, steamed milk", 3.8),
      dish("mr-5", "Mango lassi", "Yoghurt, mango, cardamom", 5.2),
      dish("mr-6", "Berry smoothie", "Mixed berries, banana, oat milk", 6, ["vegan"]),
    ] },
  ],
  "tokyo-tide": [
    { title: "Poke", items: [
      dish("tt-1", "Salmon poke", "Sushi rice, salmon, avocado, nori, ponzu", 15, ["popular"]),
      dish("tt-2", "Tuna poke", "Tuna, cucumber, sesame, spicy mayo", 15.5, ["spicy"]),
    ] },
    { title: "Sushi", items: [
      dish("tt-3", "Salmon nigiri (4)", "Hand-pressed, wasabi", 9.5),
      dish("tt-4", "Dragon roll (8)", "Prawn tempura, avocado, eel sauce", 13.5, ["popular"]),
      dish("tt-5", "Cucumber maki (6)", "Sesame, pickled radish", 6.5, ["vegan"]),
    ] },
    { title: "Sides", items: [
      dish("tt-6", "Miso soup", "Tofu, wakame, spring onion", 3.8, ["vegan"]),
      dish("tt-7", "Gyoza (5)", "Pork and cabbage, soy dip", 6.2),
    ] },
  ],
  "berry-good": [
    { title: "Smoothie bowls", items: [
      dish("bg-1", "Açaí classic", "Açaí, banana, granola, berries, coconut", 9.5, ["popular", "vegan"]),
      dish("bg-2", "Pitaya glow", "Dragon fruit, mango, chia, toasted seeds", 9.8, ["vegan"]),
      dish("bg-3", "Peanut butter crunch", "Banana, cacao, peanut butter, granola", 9.5, ["vegan"]),
    ] },
    { title: "Smoothies", items: [
      dish("bg-4", "Tropical", "Mango, pineapple, passion fruit", 6, ["vegan"]),
      dish("bg-5", "Berry good", "Strawberry, raspberry, banana", 6, ["vegan"]),
    ] },
    { title: "Extras", items: [
      dish("bg-6", "Extra granola", "House-made, oat and honey", 1.2),
    ] },
  ],
};
