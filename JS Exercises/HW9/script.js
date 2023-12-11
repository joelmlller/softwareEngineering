// Step 1: Select the element with the class "output"
const output = document.querySelector('.output');

// Step 2: Create another JavaScript object called "mainList" and update the ID of the <ul> tag
const mainList = output.querySelector('ul');
mainList.id = 'main-List';

// Step 3: Search for the tagName of each <div> and output them into the console as an array
const divElements = output.querySelectorAll('div');
const divTags = Array.from(divElements).map((div) => div.tagName);
console.log(divTags);

// Step 4: Using a for loop, set the ID of each <div> tag and alternate the text color
for (let i = 0; i < divElements.length; i++) {
    const div = divElements[i];
    div.id = 'id' + (i + 1);

    // Alternate the color of the contents (text) of each element
    if (i % 2 === 0) {
        div.style.color = 'red';
    } else {
        div.style.color = 'blue';
    }
}
