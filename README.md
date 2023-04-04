# Human-Like Query to SQL Translator

This project is a Node.js application that provides an API to convert human-like queries into SQL queries using OpenAI's GPT-4 model. The application connects to a MySQL database, retrieves the schema, and sends it to the OpenAI API along with the user's query. The resulting SQL query is returned to the user. A simple React front-end is included to interact with the API.

## Configuration

1. Clone this repository:
````
git clone https://github.com/your-github-username/human-like-query-to-sql-translator.git
cd human-like-query-to-sql-translator
````
2. Install dependencies:
````
npm install
````
3. Create a `.env` file in the src directory and add the following:
````
OPENAI_API_KEY=your_openai_api_key
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_db_database
DB_PORT=your_db_port
DB_TABLES=table1,table2,table3
````
Replace the placeholders with your actual OpenAI API key and database credentials.
## How it works

1. Start the server in one terminal:
````
cd src
node server.js
````

2. Start the React front-end in another terminal:
````
npm start
````
3. Open http://localhost:3000 in your browser.


The server will return an SQL query based on the provided human-like query.

## Greetings and Author Info

This project was created with care by Andy Cufari. If you have any questions or feedback, feel free to reach out at andycufari@gmail.com.

Happy coding!