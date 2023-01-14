const inquirer = require("inquirer");
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PSWD,
  database: process.env.DB_NAME,
});

// Creating an independent prompt module (future proofing)
let prompt = inquirer.createPromptModule();

// Function to alert the user that the database connection is closing
function closeDB() {
  console.log("\nClosing db connection...");
  db.end();
  console.log("db connection closed.");
}

// Displays the main menu options that make high level functions available
async function getMenuOption() {
  let menuQuestions = [
    {
      type: "list",
      message: "",
      choices: [
        "View all departments",
        "Add department",
        "Remove department",
        "See department budget",

        "View all roles",
        "Add role",
        "Remove role",

        "View all employees",
        "View employees by manager",
        "View employees by department",
        "Add employee",
        "Remove employee",
        "Change employee role",
        "Change employee manager",
        
        "Quit",
      ],
      name: "Options",
    },
  ];

  const selectedOption = await prompt(menuQuestions);
  return selectedOption.Options;
};


module.exports = {
  getMenuOption,
  db,
  prompt,
  closeDB,
};