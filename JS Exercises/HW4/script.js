//Joel Miller

//Array index to store options
const options = ['Rock', 'Paper', 'Scissors'];

//helper function to calculate random index
function choice() {
  const randomIndex = Math.floor(Math.random() * 3);
  return options[randomIndex];
}

//function to determine win logic
function play(playerChoice) {
 
  //chooses computers choice
  const computerChoice = choice();
  let message = '';

  if (playerChoice === computerChoice) {
    message = 'It\'s a tie!';
  } else if (
    //could also do if playerchoice == options[e.g 0,1,2 etc..]
    (playerChoice === 'Rock' && computerChoice === 'Scissors') ||
    (playerChoice === 'Paper' && computerChoice === 'Rock') ||
    (playerChoice === 'Scissors' && computerChoice === 'Paper')
  ) {
    message = `You win! ${playerChoice} beats ${computerChoice}.`;
  } else {
    message = `Computer wins! ${computerChoice} beats ${playerChoice}.`;
  }

  console.log(`You chose ${playerChoice}, and the computer chose ${computerChoice}. ${message}`);
}

//chooses players index choice
const playerChoice = choice();
//starts the game
play(playerChoice);

//Joel Miller