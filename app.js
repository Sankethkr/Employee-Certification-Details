//This program is to retrieve the certification details of employee by empId and all records
const {
  DynamoDBClient, //creating of instance of dynamoDB
  GetItemCommand, //fetch the Item details in dynamoDB
  ScanCommand, //scan the database
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb'); // retrieve and store

//creating constant client(instance) of dynamoDB and called in the program
const client = new DynamoDBClient();

const getCertificates = async (event) => {
  const response = { statusCode: 200 };
console.log('event', event);
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

//exports methods globally
module.exports = {
  getCertificates,
};
