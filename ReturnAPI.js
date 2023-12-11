const AWS = require("aws-sdk");
AWS.config.update( {
  region: "us-east-1"
});

//Connects to DB (Database)
const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = "ReturnAPI";
const dynamodbCustomerNameIndex = "customerName-index";


//Method paths
const returnsPath = "/returns";
const returnsParamPath = "/returns/{returnID}";
const returnsPaymentPath = "/returns/{returnID}/payment";
const returnsInstructionsPath = "/returns/{returnID}/instructions";
const returnsLabelPath = "/returns/{returnID}/label";
const returnsStatusPath = "/returns/{returnID}/status";
const returnsItemsPath = "/returns/{returnID}/items";

//Processes all method calls to the API
exports.handler = async function(event) {

  //Check for invalid query parameters
  if (event.queryStringParameters) {
    const validQueryParams = ['customerName'];
    for (const param in event.queryStringParameters) {
      if (!validQueryParams.includes(param)) {
        return buildResponse(400, { Message: `Invalid query parameter '${param}'. Only 'customerName' is allowed.` });
      }
    }
  }
  console.log("Request event method: ", event.httpMethod);
  console.log("EVENT\n" + JSON.stringify(event, null, 2));
  let response;
  switch(true) {

    //Get payment information information
    case event.httpMethod === "GET" && event.requestContext.resourcePath === returnsPaymentPath:
    response = await getPaymentInfo(event.pathParameters.returnID);
    break;


    
    //Get returns instructions information
    case event.httpMethod === "GET" && event.requestContext.resourcePath === returnsInstructionsPath:
    response = await getInstructionsInfo(event.pathParameters.returnID);
    break;
    
    //Get return label istructions information
    case event.httpMethod === "GET" && event.requestContext.resourcePath === returnsLabelPath:
    response = await getLabelInfo(event.pathParameters.returnID);
    break;
    
    //Get return status information
    case event.httpMethod === "GET" && event.requestContext.resourcePath === returnsStatusPath:
    response = await getStatusInfo(event.pathParameters.returnID);
    break;

    //Get return items information
    case event.httpMethod === "GET" && event.requestContext.resourcePath === returnsItemsPath:
    response = await getItemsInfo(event.pathParameters.returnID);
    break;

    //Gets a return based on the return ID given 
    case event.httpMethod === "GET" && event.requestContext.resourcePath === returnsParamPath:
    response = await getReturn(event.pathParameters.returnID);
    break;

    //Gets all returns in DB
    case event.httpMethod === "GET" && event.requestContext.resourcePath === returnsPath:
    if (event.queryStringParameters && event.queryStringParameters.customerName) {
    // If customerName is in query parameters
    response = await getReturnByName(event.queryStringParameters.customerName);
    break;
    }
    else {
      response = await getReturns();
      break;
    }

    //Creates a new return
    case event.httpMethod === "POST" && event.requestContext.resourcePath === returnsPath:
    response = await saveReturn(JSON.parse(event.body));
    break;

    //Adds/Changes payment information to/in a return
    case event.httpMethod === "PATCH" && event.requestContext.resourcePath === returnsPaymentPath:
    response = await addPaymentInfoToReturn(event.pathParameters.returnID, JSON.parse(event.body));
    break;
    //Changes the item information in a return
    case event.httpMethod === "PATCH" && event.requestContext.resourcePath === returnsItemsPath:
    const requestBodyItems = JSON.parse(event.body);
    response = await modifyReturnItems(event.pathParameters.returnID, requestBodyItems);
    break;

    //Changes the status of a return
    case event.httpMethod === "PATCH" && event.requestContext.resourcePath === returnsStatusPath:
    const requestBodyStatus = JSON.parse(event.body);
    response = await modifyReturnStatus(event.pathParameters.returnID, requestBodyStatus);
    break;

    //Deletes a return based on the return ID 
    case event.httpMethod === "DELETE" && event.requestContext.resourcePath === returnsParamPath:
    response = await deleteReturn(event.pathParameters.returnID);
    break;

    //Sends a 404 response for invalid method 
    default:
    response = buildResponse(404, event.requestContext.resourcePath);
  }

 return response;
}

//Grabs a return from the DB based on the return ID
async function getReturn(returnID) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      "returnID": returnID
    }
  }

  //Checks for valid returnID
  if(returnID<1)
  {
      console.error("ERROR: returnID should be greater than or equal to 1");
    return buildResponse(400, { Message: "returnID should be greater than or equal to 1" });
  }
  
  const result = await dynamodb.get(params).promise();

  //Checks if the returnID is in the DB
  if(!result.Item)
  {
    console.error("ERROR:returnID does not exist");
  return buildResponse(400, { Message: "returnID does not exist" });
  }
  
  return await dynamodb.get(params).promise().then((response) => {
    return buildResponse(200, response.Item);
  }, (error) => {
    console.error("Failed to grab return from the DB", error);
  });
}

//Grabs all returns by customerName query
async function getReturnByName(customerName) {
  const params = {
    TableName: dynamodbTableName,
    IndexName: dynamodbCustomerNameIndex,
    KeyConditionExpression: "customerName = :customerName",
    ExpressionAttributeValues: {
      ":customerName": customerName
    }
  };

  try {
    const result = await dynamodb.query(params).promise();
    return buildResponse(200, { returns: result.Items });
  } catch (error) {
    console.error("Error querying returns by customer name: ", error);
    return buildResponse(500, { Message: "Error querying returns by customer name" });
  }
}



//Grabs all the returns from the DB
async function getReturns() {
  const params = {
    TableName: dynamodbTableName
  }
  const allReturns = await scanDynamoRecords(params, []);
  const body = {
    returns: allReturns
  }
  return buildResponse(200, body);
}

//Grab the return paymnet information from DB
async function getPaymentInfo(returnID) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      "returnID": returnID
    }
  }

  //Checks for valid returnID
  if(returnID < 1)
  {
      console.error("ERROR: returnID should be greater than or equal to 1");
    return buildResponse(400, { Message: "returnID should be greater than or equal to 1" });
  }
  
  try {

    const response = await dynamodb.get(params).promise();

    //Checks if the returnID is in the DB
    if (!response.Item) {
      console.error(`ERROR: returnID ${returnID} does not exist`);
      return buildResponse(404, { Message: `returnID ${returnID} does not exist` });
    }

    const paymentInfo = response.Item.returnPaymentDetails;
    return buildResponse(200, paymentInfo);
  } catch (error) {
    console.error("Failed to get payment information", error);
    return buildResponse(500, { Message: "Internal Server Error" });
  }
}

//Grab the return instructions information from DB
async function getInstructionsInfo(returnID) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      "returnID": returnID
    }
  }

  //Checks for valid returnID
  if(returnID < 1)
  {
      console.error("ERROR: returnID should be greater than or equal to 1");
    return buildResponse(400, { Message: "returnID should be greater than or equal to 1" });
  }
  
  try {

    const response = await dynamodb.get(params).promise();
  
    //Checks if the returnID is in the DB
    if (!response.Item) {
      console.error(`ERROR: returnID ${returnID} does not exist`);
      return buildResponse(404, { Message: `returnID ${returnID} does not exist` });
    }

    const instructionInfo = response.Item.returnInstruction;
    return buildResponse(200, instructionInfo);
  } catch (error) {
    console.error("Failed to get return instructions", error);
    return buildResponse(500, { Message: "Internal Server Error" });
  }
}

//Grab the return label information from DB
async function getLabelInfo(returnID) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      "returnID": returnID
    }
  }

  //Checks for valid returnID
  if(returnID < 1)
  {
      console.error("ERROR: returnID should be greater than or equal to 1");
    return buildResponse(400, { Message: "returnID should be greater than or equal to 1" });
  }
  
   try {
    const response = await dynamodb.get(params).promise();
    
    //Checks if the returnID is in the DB
    if (!response.Item) {
      console.error(`ERROR: returnID ${returnID} does not exist`);
      return buildResponse(404, { Message: `returnID ${returnID} does not exist` });
    }

    const labelInfo = response.Item.returnLabel;
    return buildResponse(200, labelInfo);
  } catch (error) {
    console.error("Failed to get returnLabel information", error);
    return buildResponse(500, { Message: "Internal Server Error" });
  }
}

//Grab the return status information from DB
async function getStatusInfo(returnID) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      "returnID": returnID
    }
  }

  //Checks for valid returnID
  if(returnID < 1)
  {
      console.error("ERROR: returnID should be greater than or equal to 1");
    return buildResponse(400, { Message: "returnID should be greater than or equal to 1" });
  }
  
  try {

    const response = await dynamodb.get(params).promise();
  
    //Checks if the returnID is in the DB
    if (!response.Item) {
      console.error(`ERROR: returnID ${returnID} does not exist`);
      return buildResponse(404, { Message: `returnID ${returnID} does not exist` });
    }

    const statusInfo = response.Item.returnStatus;
    return buildResponse(200, statusInfo);
  } catch (error) {
    console.error("Failed to get returnStatus information", error);
    return buildResponse(500, { Message: "Internal Server Error" });
  }
}

//Grab the return items information from DB
async function getItemsInfo(returnID) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      "returnID": returnID
    }
  }
  if(returnID < 1)
  {
      console.error("ERROR: returnID should be greater than or equal to 1");
    return buildResponse(400, { Message: "returnID should be greater than or equal to 1" });
  }
  
   try {
    const response = await dynamodb.get(params).promise();
  
    //Checks if the returnID is in the DB
    if (!response.Item) {
      console.error(`ERROR: returnID ${returnID} does not exist`);
      return buildResponse(404, { Message: `returnID ${returnID} does not exist` });
    }

    const itemsInfo = response.Item.returnItems;
    return buildResponse(200, itemsInfo);
  } catch (error) {
    console.error("Failed to get returnItems information", error);
    return buildResponse(500, { Message: "Internal Server Error" });
  }
}

//Searches the DB for the all the returns 
async function scanDynamoRecords(scanParams, itemArray) {
  try {
    const dynamoData = await dynamodb.scan(scanParams).promise();
    itemArray = itemArray.concat(dynamoData.Items);
    if (dynamoData.LastEvaluatedKey) {
      scanParams.ExclusiveStartkey = dynamoData.LastEvaluatedKey;
      return await scanDynamoRecords(scanParams, itemArray);
    }
    return itemArray;
  } catch(error) {
    console.error('Failed during DB scan', error);
  }
}

async function saveReturn(requestBody) {

  //Checks if the request body is correct
  const validationError = validateRequestBody(requestBody);
  if (validationError) {
    return buildResponse(400, { Message: validationError });
  }
  
  //Grab the itemCount and itemCost from the requestBody
  const itemCount = parseInt(requestBody.returnItems.itemCount);
  const itemCost = parseFloat(requestBody.returnItems.itemCost);
  const returnID = generateReturnID().toString();

  //Calculate the returnAmount and convert it to a string
  const calculatedReturnAmount = (itemCount * itemCost).toString();

  // Determine the instruction type based on the calculatedReturnAmount 
  let instructionType;
  let returnShippingPaymentAmt = "0";
  let returnStatus = "Pending";

  //the numeric value for comparison
  const numericReturnAmount = itemCount * itemCost;
  if (numericReturnAmount < 10) {
    instructionType = "USPS";
  } else if (numericReturnAmount < 50) {
    instructionType = "UPS";
  } else {
    instructionType = "FedX";
    //Charges the customer 5% for returns over $50
    returnShippingPaymentAmt = (parseFloat(calculatedReturnAmount) / 20.00).toString();
    returnStatus = "Waiting on Payment";
  }

  // Define the returnInstruction object
  const returnInstruction = {
    InstructionDetails: "Follow the instruction manual provided",
    instructionType: instructionType,
  };

  const returnLabel = (Math.floor(10000 + Math.random() * 90000)).toString();

  // Adds all new values to the request body
  const completeReturn = {
    returnID: returnID,
    ...requestBody,
    returnStatus: returnStatus,
    returnAmount: calculatedReturnAmount,
    returnInstruction: returnInstruction,
    returnLabel: returnLabel,
    returnShippingPaymentAmt: returnShippingPaymentAmt,
   
  };

  const params = {
    TableName: dynamodbTableName,
    Item: completeReturn,
  };

  return await dynamodb.put(params).promise().then(
    () => {
      const body = {
        Operation: "SAVE",
        Message: "SUCCESS",
        Item: completeReturn,
      };
      return buildResponse(200, body);
    },
    (error) => {
      console.error("Faild to store return in DB", error);
    }
  );
}

// Generate a random number between 100000 and 999999
function generateReturnID() {
  const randomNumber = Math.floor(Math.random() * 900000) + 100000;
  return randomNumber;
}

//Deletes a return from the DB based on the return ID
async function deleteReturn(returnID) {
  const params = {
    TableName: dynamodbTableName,
    Key: {
      "returnID": returnID
    },
    ReturnValues: "ALL_OLD"
  }
  return await dynamodb.delete(params).promise().then((response) => {
    const body = {
      Operation: "DELETE",
      Message: "SUCCESS",
      Item: response
    }
    return buildResponse(200, body);
  }, (error) => {
    console.error("Failed to delete return", error);
  })
}


//Adds or changes the payment details of a return
async function addPaymentInfoToReturn(returnID, paymentInfo) {
  //Checks for valid returnID
  if (returnID < 1) {
    console.error("ERROR: returnID should be greater than or equal to 1");
    return buildResponse(400, { Message: "returnID should be greater than or equal to 1" });
  }

  //Defines the valid payment methods
  const validPaymentMethods = new Set(['Credit Card', 'Debit Card', 'PayPal']);

  //Defines what keys should be in the body
  const expectedKeys = new Set(['paymentMethod', 'paymentAmount']);

  //Checks for valid keys and no additional keys
  const paymentInfoKeys = Object.keys(paymentInfo);
  if (paymentInfoKeys.some(key => !expectedKeys.has(key)) || paymentInfoKeys.length !== expectedKeys.size) {
    return buildResponse(400, { Message: "Invalid request body. Only 'paymentMethod' and 'paymentAmount' are required and allowed." });
  }

  //Validates the paymentMethod
  if (!validPaymentMethods.has(paymentInfo.paymentMethod)) {
    return buildResponse(400, { Message: "Invalid payment method. Allowed methods are Credit Card, Debit Card, or PayPal." });
  }

  paymentAmountString = paymentInfo.paymentAmount.toString();

  // Validates paymentAmount as non-negative number
  if (!isNonNegativeFloat(paymentAmountString)) {
    return buildResponse(400, { Message: "Invalid payment amount. Must be a non-negative number." });
  }

  // Set paymentStatus
  const paymentStatus = "Pending";

  // Create the returnPayment object
  const returnPayment = {
    paymentMethod: paymentInfo.paymentMethod,
    paymentAmount: paymentAmountString,
    paymentStatus: paymentStatus
  };

  const params = {
    TableName: dynamodbTableName,
    Key: {
      "returnID": returnID
    },
    UpdateExpression: "set returnPaymentDetails = :returnPayment",
    ExpressionAttributeValues: {
      ":returnPayment": returnPayment
    },
    ConditionExpression: "attribute_exists(returnID)",
    ReturnValues: "UPDATED_NEW"
  };

  try {
    const response = await dynamodb.update(params).promise();
    return buildResponse(200, { Operation: "UPDATE", Message: "Payment information added successfully.", UpdatedAttributes: response });
  } catch (error) {
    //Checks if error is due to the returnID not existing 
    if (error.code === 'ConditionalCheckFailedException') {
      console.error("Error: returnID does not exist", error);
      return buildResponse(400, { Message: `returnID ${returnID} does not exist` });
    }
    console.error("Error updating return with payment info: ", error);
    return buildResponse(500, { Message: "Error updating return with payment info" });
  }
}


//Creates the response and response code sent to the client 
 function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
 }
}

//Checks to make sure that the request body in the POST method is correct
function validateRequestBody(requestBody) {
  // Define required and allowed keys
  const requiredTopLevelKeys = ['orderNumber', 'customerName', 'returnItems'];
  const allowedTopLevelKeys = new Set(requiredTopLevelKeys);
  const requiredReturnItemKeys = ['itemID', 'itemCount', 'itemCost'];
  const allowedReturnItemKeys = new Set(requiredReturnItemKeys);

  //Checks that all keys are in the request body with no extra keys
  for (const key of requiredTopLevelKeys) {
    if (!(key in requestBody)) {
      return `Missing required key in request body: ${key}`;
    }
  }
  for (const key in requestBody) {
    if (!allowedTopLevelKeys.has(key)) {
      return `Invalid key in request body: ${key}`;
    }
  }

  // Validates the customerName
  if (!/^[A-Za-z\s]+$/.test(requestBody.customerName)) {
    return "Invalid customerName. Must contain only letters.";
  }

  //Checks for the keys in returnItems
  const returnItems = requestBody.returnItems;
  for (const key of requiredReturnItemKeys) {
    if (!(key in returnItems)) {
      return `Missing required key in returnItems: ${key}`;
    }
  }
  for (const key in returnItems) {
    if (!allowedReturnItemKeys.has(key)) {
      return `Invalid key in returnItems: ${key}`;
    }
  }

  //Validates that orderNumber, itemID, and itemCount are positive integers
  if (!isStrictlyPositiveInteger(requestBody.orderNumber) ||
      !isStrictlyPositiveInteger(returnItems.itemID) ||
      !isStrictlyPositiveInteger(returnItems.itemCount)) {
    return "orderNumber, itemID, and itemCount must be positive integers.";
  }

  //Validates that itemCost is a non-negative number
  if (!isNonNegativeFloat(returnItems.itemCost)) {
    return "itemCost must be a non-negative number.";
  }

  // If all validations pass
  return null;
}

//Checks if a value is a positive integer
function isStrictlyPositiveInteger(value) {
  const number = parseInt(value);
  return !isNaN(number) && number > 0 && number.toString() === value.toString();
}

//Checks if a value is a non-negative number
function isNonNegativeFloat(value) {
  //Checks if the value is a string representation of a non-negative number
  if (!/^\d+(\.\d+)?$/.test(value)) {
    return false;
  }

  //Parses it as a float and checks if it's a non-negative number
  const number = parseFloat(value);
  return !isNaN(number) && number >= 0;
}



//Changes the return status of a return
async function modifyReturnStatus(returnID, requestBody) {
  //Checks for valid returnID
  if (returnID < 1) {
    console.error("ERROR: returnID should be greater than or equal to 1");
    return buildResponse(400, { Message: "returnID should be greater than or equal to 1" });
  }

  // Validate that requestBody has only the returnStatus key
  const keys = Object.keys(requestBody);
  if (keys.length !== 1 || keys[0] !== 'returnStatus') {
    return buildResponse(400, { Message: "Invalid request body. Only 'returnStatus' key is allowed" });
  }

  //Grabs the returnStatus from requestBody
  const returnStatus = requestBody.returnStatus;

  //Validates the returnStatus
  if (!['Pending', 'Complete', 'Awaiting Payment', 'In Process', 'Denied'].includes(returnStatus)) {
    return buildResponse(400, { Message: "Invalid value for returnStatus. Allowed values are 'Pending', 'Complete', 'Awaiting Payment', 'In Process', 'Denied'" });
  }

  const params = {
    TableName: dynamodbTableName,
    Key: { "returnID": returnID },
    UpdateExpression: "set returnStatus = :value",
    ExpressionAttributeValues: {
      ":value": returnStatus
    },
    ConditionExpression: "attribute_exists(returnID)", // Ensure returnID exists
    ReturnValues: "UPDATED_NEW"
  };

  //Performs the update
  try {
    const result = await dynamodb.update(params).promise();
    return buildResponse(200, { Operation: "UPDATE", Message: "SUCCESS", UpdatedAttributes: result.Attributes });
  } catch (error) {
    //Checks if error is due to the returnID not existing 
    if (error.code === 'ConditionalCheckFailedException') {
      console.error("Error: returnID does not exist", error);
      return buildResponse(400, { Message: `returnID ${returnID} does not exist` });
    }
    console.error("Error updating return: ", error);
    return buildResponse(500, { Message: "Error updating return" });
  }
}

async function modifyReturnItems(returnID, updateItems) {
  //Checks for valid returnID
  if (returnID < 1) {
      console.error("ERROR: returnID should be greater than or equal to 1");
      return buildResponse(400, { Message: "returnID should be greater than or equal to 1" });
  }

  //Validates the keys and types in updateItems
  const validKeys = {
      itemID: 'string',
      itemCount: 'integer',
      itemCost: 'number'
  };

  //Checks if all keys in the request body are valid and have the correct values
  for (const key in updateItems) {
      if (!validKeys.hasOwnProperty(key)) {
          console.error(`Invalid key in updateItems: ${key}`);
          return buildResponse(400, { Message: `Invalid key in updateItems: ${key}` });
      }

      const type = validKeys[key];
      const value = updateItems[key];

      if (type === 'integer' && !isStrictlyPositiveInteger(value)) {
          return buildResponse(400, { Message: `Invalid value for ${key}. Must be a positive integer.` });
      } else if (type === 'number' && !isNonNegativeFloat(value)) {
          return buildResponse(400, { Message: `Invalid value for ${key}. Must be a non-negative number.` });
      }
  }

  //Sets up update parameters
  let updateExpression = 'set ';
  const expressionAttributeValues = {};
  const expressionAttributeNames = { "#returnItems": "returnItems" };

  for (const key in updateItems) {
      updateExpression += `#returnItems.#${key} = :${key}, `;
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = updateItems[key];
  }

  //Removes trailing comma and space
  updateExpression = updateExpression.slice(0, -2);

  const params = {
      TableName: dynamodbTableName,
      Key: { "returnID": returnID },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: "attribute_exists(returnID)",
      ReturnValues: "UPDATED_NEW"
  };

  //Performs the update
  try {
      const result = await dynamodb.update(params).promise();
      return buildResponse(200, { Message: "Return item updated successfully", UpdatedAttributes: result.Attributes });
  } catch (error) {
      //Checks if error is due to the returnID not existing 
      if (error.code === 'ConditionalCheckFailedException') {
          console.error("Error: returnID does not exist", error);
          return buildResponse(400, { Message: `returnID ${returnID} does not exist` });
      }
      console.error("Error updating return item: ", error);
      return buildResponse(500, { Message: "Error updating return item" });
  }
}