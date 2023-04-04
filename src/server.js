/**
 * Author: Andy Cufari
 * Email: andycufari@gmail.com
 */

const express = require('express');
const mysql = require('mysql');
const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs').promises;
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
};
const tables = process.env.DB_TABLES.split(',');
const connection = mysql.createConnection(dbConfig);
const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

// Utility functions
const readSchemaFromFile = async () => {
  try {
    const data = await fs.readFile('schema.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading schema from file:', error);
    return null;
  }
};

const writeSchemaToFile = async (schema) => {
  try {
    await fs.writeFile('schema.json', JSON.stringify(schema, null, 2));
  } catch (error) {
    console.error('Error writing schema to file:', error);
  }
};


const getDbInfo = async (tables) => {
  const tableNames = tables.map(table => `'${table}'`).join(', ');

  const tablesAndColumnsQuery = `
    SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_KEY, EXTRA
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = '${dbConfig.database}' AND TABLE_NAME IN (${tableNames});
  `;

  const foreignKeysQuery = `
    SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE CONSTRAINT_SCHEMA = '${dbConfig.database}' AND REFERENCED_TABLE_NAME IS NOT NULL AND TABLE_NAME IN (${tableNames});
  `;

  const [tablesAndColumns, foreignKeys] = await Promise.all([
    executeQuery(tablesAndColumnsQuery),
    executeQuery(foreignKeysQuery)
  ]);

  const schema = {};

  tablesAndColumns.forEach(row => {
    if (!schema[row.TABLE_NAME]) {
      schema[row.TABLE_NAME] = {
        columns: {},
        primaryKeys: [],
        foreignKeys: {}
      };
    }

    schema[row.TABLE_NAME].columns[row.COLUMN_NAME] = row.DATA_TYPE;

    if (row.COLUMN_KEY === 'PRI') {
      schema[row.TABLE_NAME].primaryKeys.push(row.COLUMN_NAME);
    }
  });

  foreignKeys.forEach(row => {
    schema[row.TABLE_NAME].foreignKeys[row.COLUMN_NAME] = {
      referencesTable: row.REFERENCED_TABLE_NAME,
      referencesColumn: row.REFERENCED_COLUMN_NAME
    };
  });

  return schema;
};

const executeQuery = (query) => {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
};

const sendPromptToOpenAI = async (dbInfo, humanQuery) => {
  const prompt = `Given the following MySQL database information:\n\n${JSON.stringify(dbInfo, null, 2)}\n\nTranslate the following human-like query into an SQL query:\n"${humanQuery}"\n\nSQL query:`;

  let messages = [{role: "user", content: prompt}]

  try {
    response_ai = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        max_tokens: 500,
        temperature: 0.5,
        messages: messages,
        //user: prospect.id
    });
    //return response content
    let msg = "Error in OpenAI";
    //check if response has choices
    if (response_ai.data.hasOwnProperty("choices")) {
    //  get message from response
        msg = response_ai.data["choices"][0]["message"]["content"];
        //get tokens from response
        
        console.log(msg);
        
    } else {
        console.error("ERROR OPENAI");
        //console.error(response_ai.data);
    }
    return msg;
  } catch (error) {
    console.error('Error sending request to OpenAI:', error);
  }
};

// Express app setup
const app = express();
app.use(express.json());

app.post('/api/generate-sql', async (req, res) => {
    const humanQuery = req.body.humanQuery;
    const tables = ['patient', 'account', 'event'];
    let dbInfo = await readSchemaFromFile();
  
    if (!dbInfo) {
      dbInfo = await getDbInfo(tables);
      await writeSchemaToFile(dbInfo);
    }
  
    const sqlQuery = await sendPromptToOpenAI(dbInfo, humanQuery);
    res.send(sqlQuery);
    connection.end();
});

// Server start
app.listen(3001, () => {
    console.log('Server listening on port 3001');
});