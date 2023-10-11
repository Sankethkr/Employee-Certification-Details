//This program is to retrieve the certification details of employee by empId and all records
const {
  DynamoDBClient, //creating of instance of dynamoDB
  GetItemCommand, //fetch the Item details in dynamoDB
  ScanCommand, //scan the
  UpdateItemCommand, // for updating data
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb'); // retrieve and store

//creating constant client(instance) of dynamoDB and called in the program
const client = new DynamoDBClient();

const getCertificates = async (event) => {
  const response = { statusCode: 200 };
  console.log('event', event);
  console.log('response', response);
  try {
    if (event.pathParameters && event.pathParameters.empID) {
      // If empID is provided in the path parameters, retrieve a specific certificate
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ empID: event.pathParameters.empID }),
      };
      const { Item } = await client.send(new GetItemCommand(params));
      console.log('Item', JSON.stringify(Item, null, 2));

      response.body = JSON.stringify({
        message: `Successfully retrieved empId: ${event.pathParameters.empID}`,
        data: Item ? unmarshall(Item) : {},
        rawData: Item,
      });
    } else {
      // If empID is not provided, retrieve all certificates
      const { Items } = await client.send(
        new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
      );

      response.body = JSON.stringify({
        message: 'Successfully retrieved all Certificates',
        data: Items?.map((item) => unmarshall(item)),
        Items,
      });
    }
  } catch (e) {
    console.error(e);
    response.body = JSON.stringify({
      message: 'Failed to get certificates.',
      errorMsg: e.message,
      errorStack: e.stack,
      statusCode: e.$metadata.httpStatusCode,
    });
    console.log(response.body);
  }

  return response;
};

const deleteEmployeeSkillInfo = async (event) => {
  // defined const response and store the status code of 200
  const response = { statusCode: 200 };
  // try block will examine employeeId in DB and if found it will delete otherwise it will throw error
  try {
    const { empID } = event.pathParameters;

    // Create an empty DynamoDB List attribute after delete perform
    const emptyList = { L: [] };

    // created const params and refered in program to proccess employeeId update
    const params = {
      // Table name
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empID }),
      UpdateExpression: 'SET bankInfoDetails = :emptyList',
      ExpressionAttributeValues: {
        ':emptyList': emptyList, //
      },
    };

    // Use the update method with UpdateExpression to set bankInfoDetails to an empty list
    const updateResult = await client.send(new UpdateItemCommand(params));

    // convert raw data response from server to JSON string format
    response.body = JSON.stringify({
      message: `Successfully deleted employeeId bank Details.`,
      updateResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    // convert raw data response from server to JSON string format
    response.body = JSON.stringify({
      message: `Failed to delete employeeId bank Details.`,
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  // returns the response 200
  return response;
};

const softDeleteEmployeeSkillInfo = async (event) => {
  // set 200 response
  const response = { statusCode: 200 };
  try {
    const { empID } = event.pathParameters;
    // writing params
    const params = {
      // table name
      TableName: process.env.DYNAMODB_TABLE_NAME,
      // passing marshalled employeeId value
      Key: marshall({ empID }),
      // update expression for isActive property which present in bankInfoDetails
      UpdateExpression: 'SET bankInfoDetails[0].isActive = :isActive',
      ExpressionAttributeValues: {
        // Set to true to update "isActive" to true
        ':isActive': { BOOL: true },
      },
    };

    // sending params to dynamoDb
    const updateResult = await client.send(new UpdateItemCommand(params));

    // response body values
    response.body = JSON.stringify({
      message: `Successfully soft deleted employeeId bank Details.`,
      updateResult,
    });
  } catch (e) {
    // error handling block for 500 error satus
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: `Failed to soft delete employeeId bank Details.`,
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  // returns the response
  return response;
};

//exports methods globally
module.exports = {
  getCertificates,
  deleteEmployeeSkillInfo,
  softDeleteEmployeeSkillInfo,
};
