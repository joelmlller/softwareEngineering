const heightInInches = 85; 
const weightInPounds = 175; 

const inchesToCm = 2.54;
const poundsToKilos = 0.453592;

const heightInCm = heightInInches * inchesToCm;
const weightInKilos = weightInPounds * poundsToKilos;

// Calculate BMI
const heightInMeters = heightInCm / 100;
const bmi = weightInKilos / (heightInMeters * heightInMeters);

// Output the results to the console
console.log(`Height in inches: ${heightInInches}`);
console.log(`Height in centimeters: ${heightInCm}`);
console.log(`Weight in pounds: ${weightInPounds}`);
console.log(`Weight in kilograms: ${weightInKilos.toFixed(2)}`);
console.log(`BMI: ${bmi.toFixed(2)}`);
