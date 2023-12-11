const size = 10; // Sets the size of the multiplication table
const multiplicationTable = []; // empty array

for (let i = 1; i <= size; i++) {
  const row = []; // temp array 
  for (let j = 1; j <= size; j++) {
    row.push(i * j); // calculate
  }
  multiplicationTable.push(row); // Pushes the row to the multiplication table
}

for (let i = 0; i < size; i++) {
  console.log(multiplicationTable[i].join('\t')); // Displays the multiplication table
}
