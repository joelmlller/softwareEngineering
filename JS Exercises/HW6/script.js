//Recursive function that counts up to 10

function recusive10(num) {
  if (num > 10) {
    return;
  } else {
    console.log(num);
    recusive10(++num);
  }
}

// Invoke the function with different start numbers
const startNumbers = [1,2,3,4,5,6,7,8,9,10,11];

startNumbers.forEach((num) => {
  console.log(`Counting up to 10 starting from ${num}:`);
  recusive10(num);
  console.log();
});