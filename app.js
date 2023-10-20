const {
  DynamoDBClient,
  GetItemCommand,
  ScanCommand,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient();

const getCertificates = async (event) => {
  const response = { statusCode: 200 };
  console.log('event', event);

  try {
    if (event.pathParameters && event.pathParameters.empID) {
      // Retrieve a specific certificate by empID
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
      // Retrieve all certificates
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
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to get certificates.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

const handleEmployeeSkillInfo = async (event) => {
  const response = { statusCode: 200 };
  const date = new Date().toISOString();

  try {
    const { empID, action } = event.pathParameters;

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ empID }),
    };

    if (action === 'delete') {
      const emptyList = { L: [] };
      params.UpdateExpression = 'SET skillInfoDetails = :emptyList';
      params.ExpressionAttributeValues = { ':emptyList': emptyList };
    } else if (action === 'softDelete') {
      params.UpdateExpression =
        'SET skillInfoDetails[0].isActive = :isActive, skillInfoDetails[0].UpdatedDateTime = :UpdatedDateTime';
      params.ExpressionAttributeValues = {
        ':isActive': { BOOL: true },
        ':UpdatedDateTime': { S: date },
      };
    } else {
      response.statusCode = 400;
      response.body = JSON.stringify({ message: 'Invalid action specified' });
      return response;
    }

    const updateResult = await client.send(new UpdateItemCommand(params));

    response.body = JSON.stringify({
      message: `Successfully ${
        action === 'delete' ? 'deleted' : 'soft deleted'
      } empID Skill Details`,
      updateResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: `Failed to ${
        action === 'delete' ? 'delete' : 'soft delete'
      } empID Skill Details`,
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = {
  getCertificates,
  handleEmployeeSkillInfo,
};
