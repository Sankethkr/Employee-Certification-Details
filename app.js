const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient();

const getCertificate = async (event) => {
  const response = { statusCode: 200 };
  try {
    // Check if empID is defined in event.pathParameters
    if (!event.pathParameters || !event.pathParameters.empID) {
      throw new Error('empID is missing in the path parameters');
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empID: event.pathParameters.empID }),
    };
    const { Item } = await client.send(new GetItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully retrieved post.',
      data: Item ? unmarshall(Item) : {},
      rawData: Item,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to get certificate.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

const getAllCertificates = async () => {
  const response = { statusCode: 200 };
  try {
    const { Items } = await client.send(
      new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
    );
    response.body = JSON.stringify({
      message: 'Successfully retrieved all Certificates',
      data: Items.map((item) => unmarshall(item)),
      Items,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to retrieve posts.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

module.exports = {
  getAllCertificates,
  getCertificate,
};
