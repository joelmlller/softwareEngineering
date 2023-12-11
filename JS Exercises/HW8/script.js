
function wordScrambler(word) {
  // Create a copy of the original word
  let originalWord = word;
  let newScrambledWord = '';

  for (let i = word.length; i > 0; i--) {
    // Generate a random index within the current length of the word
    const randomIndex = Math.floor(Math.random() * i);

    // Add the randomly selected letter to the new scrambled word
    newScrambledWord += word[randomIndex];

    // Update the original word by removing the selected letter
    word = word.substring(0, randomIndex) + word.substring(randomIndex + 1);
    
    // Output the current state
    console.log(`Original Word: ${originalWord}`);
    console.log(`Scrambled Word: ${newScrambledWord}`);
    console.log(`Remaining Letters: ${word}`);
  }

  return newScrambledWord;
}

// Example usage
const originalWord = "clemson";
const scrambled = wordScrambler(originalWord);
console.log(`Final Scrambled Word: ${scrambled}`);
