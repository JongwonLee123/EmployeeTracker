
require("dotenv").config();


const Employees = require("./lib/Employees");
const Roles = require("./lib/Roles");
const Departments = require("./lib/Departments");


const { getMenuOption, closeDB } = require("./src/helperFunctions");


let EMPLOYEES = new Employees();
let DEPARTMENTS = new Departments();
let ROLES = new Roles();


async function cycleMenuOptions() {

  let option = await getMenuOption();

  switch (option) {
    
    case "Quit":
      closeDB();
      console.log("\nGoodbye.\n");
      return;

    case "View all departments":
      DEPARTMENTS.showTable();
      cycleMenuOptions();
      break;

    case "View all roles":
      ROLES.showTable();
      cycleMenuOptions();
      break;

    case "View all employees":
      EMPLOYEES.showTable();
      cycleMenuOptions();
      break;

    case "Add department":
      await DEPARTMENTS.addNewDept();

      DEPARTMENTS.refreshDepartmentList();

      console.log("\nSUCCESS:\nSuccessfully wrote new deptartment to db.\n");
      cycleMenuOptions();
      break;

    case "Add role":
  
      await ROLES.addNewRole(DEPARTMENTS.getDepartmentList());

      ROLES.refreshRoleList();

      console.log("\nSUCCESS:\nSuccessfully wrote new role to db.\n");
      cycleMenuOptions();
      break;

    case "Add employee":
  
      await EMPLOYEES.addNewEmployee(ROLES.getRoleList());


      EMPLOYEES.refreshEmployeeList();

      console.log("\nSUCCESS:\nSuccessfully wrote new employee to db.\n");
      cycleMenuOptions();
      break;

    case "Change employee role":
   
      await EMPLOYEES.changeEmployeeRole(ROLES.getRoleList());


      EMPLOYEES.refreshEmployeeList();

      console.log(
        "\nSUCCESS:\nSuccessfully wrote modified employee info to db.\n"
      );
      cycleMenuOptions();
      break;

    case "Change employee manager":
      await EMPLOYEES.changeEmployeeManager()
      EMPLOYEES.refreshEmployeeList();
      console.log(
        "\nSUCCESS:\nSuccessfully wrote modified employee manager to db.\n"
      );
      cycleMenuOptions();
      break;

    case "Remove employee":
      await EMPLOYEES.removeEmployee()
      EMPLOYEES.refreshEmployeeList();
      console.log(
        "\nSUCCESS:\nSuccessfully removed employee from db.\n"
      );
      cycleMenuOptions();
      break;

    case "View employees by manager":
      await EMPLOYEES.viewEmployeesByManager()
      cycleMenuOptions();
      break;

    case "View employees by department":
      await EMPLOYEES.viewEmployeesByDepartment(DEPARTMENTS.getDepartmentList())
      cycleMenuOptions();
      break;

    case "Remove role":
      await ROLES.removeRole()
      ROLES.refreshRoleList();
      EMPLOYEES.refreshEmployeeList();
      console.log(
        "\nSUCCESS:\nSuccessfully removed role from db.\n"
      );
      cycleMenuOptions();
      break;

    case "Remove department":
      await DEPARTMENTS.removeDept()
      DEPARTMENTS.refreshDepartmentList()
      ROLES.refreshRoleList()
      EMPLOYEES.refreshEmployeeList()
      console.log(
        "\nSUCCESS:\nSuccessfully removed department from db.\n"
      );
      cycleMenuOptions();
      break;

    case "See department budget":
      await DEPARTMENTS.displayDeptCost()
      cycleMenuOptions();
      break;

  }
}

console.clear();
console.log(`\nWelcome to the company CMS\n`);
cycleMenuOptions();