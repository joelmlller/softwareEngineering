// Create an empty array to hold the inventory.
let inventory = [];
// Create three items with properties: name, model, cost, and quantity.
let item1 = {
name: "Car",
model: "Ford Mustang",
cost: 5000,
quantity: 1,
};
let item2 = {
name: "Smartphone",
model: "iPhone 15 Pro",
cost: 1000,
quantity: 14,
};
let item3 = {
name: "Headphones",
model: "Apple Airpods Pro",
cost: 250,
quantity: 23,
};
// Add all three items to the inventory array.
inventory.push(item1, item2, item3);
// Log the inventory array to the console.
console.log("Inventory Array:",inventory);
// Access the quantity element of the third item and log it.
console.log("Quantity of the third item:", inventory[2].quantity);
// Add and access more elements within the data structure.
item1.sold = 2; // Add a "sold" property to item1.
console.log("Quantity of item1 sold:", inventory[0].sold);
item2.port = "USB-C";
console.log("Type of Iphone Port:",inventory[1].port);
item1.engine = "V8";
console.log("Type of Ford Engine:", inventory[0].engine);
