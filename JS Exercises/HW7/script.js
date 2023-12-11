// Menu items price calculator
// Create a class which will allow you to work out the combined price of a number of items, and interact with it to work out the total cost of different orders.

// Create a class that contains the prices of two menu items as private field declarations.
// Use the constructor in the class to get the argument values (how many of each item are being bought).
// Create a method to calculate and return the total cost depending on how many of each item the user selects.
// Use a getter property to grab the value output by the calculation method.
// Create two or three objects with different combinations of menu selections, and output the total cost in the console.

class Menu {
  #coke = 2;//private class variables
  #pizza = 10;

  constructor(numCoke, numPizza) {//constructor to get the quantities
    this.numCoke = numCoke;
    this.numPizza = numPizza;
  }

   calcTotal(){//method to calculate total cost
    const cokeCost = this.#coke * this.numCoke;
    const pizzaCost = this.#pizza * this.numPizza;
    return cokeCost + pizzaCost;
  }

  get totalCost() {//getter to get the return of calcTotal
    return this.calcTotal();
  }

}



//Objects
const order1 = new Menu(1, 2); // 2 cokes and 3 pizzas
const order2 = new Menu(23, 12); // 4 cokes and 2 pizzas
const order3 = new Menu(50, 100); // 1 cokes and 5 pizzas

console.log("Order 1 Total Cost: $" + order1.totalCost.toFixed(2));
console.log("Order 2 Total Cost: $" + order2.totalCost.toFixed(2));
console.log("Order 3 Total Cost: $" + order3.totalCost.toFixed(2));