const { db, prompt } = require("../src/helperFunctions");

class Employees {
  constructor() {
    this.employeeList = null;
    this.refreshEmployeeList();
  }

  getEmployeeList() {
    return this.employeeList;
  }

  async refreshEmployeeList() {
    let employees = await db.promise().query(
      `SELECT copy1.id AS 'Employee ID', copy1.first_name AS 'First Name', copy1.last_name AS 'Last Name', role.title AS ' Title', role.salary AS 'Salary', department.name AS 'Department', copy2.first_name AS 'Manager First Name', copy2.last_name as 'Manager Last Name'
                FROM employee copy1
                LEFT JOIN role ON copy1.role_id=role.id 
                LEFT JOIN department ON role.department_id=department.id
                LEFT JOIN employee copy2 ON copy1.manager_id=copy2.id`
    );
    this.employeeList = employees;
  }

  showTable() {
    this.refreshEmployeeList();
    console.table(this.employeeList[0]);
    console.log("");
  }

  async addNewEmployee(roleList) {
   
    let availableRoles = roleList[0];
    availableRoles = availableRoles.map((role) => role.Title);

    let employeeListNames = this.employeeList[0].map(
      (emp) => `${emp["First Name"]} ${emp["Last Name"]}`
    );


    let employeeQuestions = [
      {
        type: "input",
        message: "New employee first name: ",
        name: "newEmpFirstName",
      },
      {
        type: "input",
        message: "New employee last name: ",
        name: "newEmpLastName",
      },
      {
        type: "list",
        message: "New employee role: ",
        choices: availableRoles,
        name: "newEmpRole",
      },
      {
        type: "list",
        message: `New employee's manager: `,
        choices: [...employeeListNames, "None"], 
        name: "newEmpMan",
      },
    ];


    const empInfo = await prompt(employeeQuestions);

 
    let managerIndex = employeeListNames.indexOf(empInfo.newEmpMan);
    let managerID = this.employeeList[0][managerIndex]['Employee ID'];
    let roleIndex = availableRoles.indexOf(empInfo.newEmpRole);
    let roleID = roleList[0][roleIndex]['Role ID']

  
    if (empInfo.newEmpMan !== "None") {
      return db
        .promise()
        .query(
          `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`,
          [
            empInfo.newEmpFirstName,
            empInfo.newEmpLastName,
            roleID,
            managerID,
          ]
        );
    } else {
      return db
        .promise()
        .query(
          `INSERT INTO employee (first_name, last_name, role_id) VALUES (?,?,?)`,
          [empInfo.newEmpFirstName, empInfo.newEmpLastName, roleID]
        );
    }
  }

  async changeEmployeeRole(rolesList) {

    let roleTitles = rolesList[0].map((role) => role.Title);


    let employeeNames = this.employeeList[0].map(
      (emp) => `${emp["First Name"]} ${emp["Last Name"]}`
    );

    
    const empPicker = await prompt({
      type: "list",
      message: "Select employee to modify:",
      choices: employeeNames,
      name: "selectedEmployee",
    });

  
    const rolePicker = await prompt({
      type: "list",
      message: "Select employee new role: ",
      choices: roleTitles,
      name: "newRole",
    });


    let newRoleIndex = roleTitles.indexOf(rolePicker.newRole);
    let newRoleID = rolesList[0][newRoleIndex]['Role ID']
    let employeeIndex = employeeNames.indexOf(empPicker.selectedEmployee);
    let employeeID = this.employeeList[0][employeeIndex]['Employee ID']


    return db
      .promise()
      .query(`UPDATE employee SET role_id=? WHERE id=?`, [
        newRoleID,
        employeeID,
      ]);
  }

  async changeEmployeeManager() {

    let employeeNames = this.employeeList[0].map(
      (emp) => `${emp["First Name"]} ${emp["Last Name"]}`
    );


    const empPicker = await prompt({
      type: "list",
      message: "Select employee to modify:",
      choices: employeeNames,
      name: "selectedEmployee",
    });

  
    const managerPicker = await prompt({
      type: "list",
      message: "Select employee's new manager: ",
      choices: [...employeeNames, 'None'],
      name: "newManager",
    });


    let newManagerIndex = employeeNames.indexOf(managerPicker.newManager);
    let newManagerID = this.employeeList[0][newManagerIndex]['Employee ID']
    let employeeIndex = employeeNames.indexOf(empPicker.selectedEmployee);
    let employeeID = this.employeeList[0][employeeIndex]['Employee ID']

    if (managerPicker.newManager === 'None') {
      return db
      .promise()
      .query(`UPDATE employee SET manager_id=null WHERE id=?`, 
      employeeID
      );
    } else {
      return db
      .promise()
      .query(`UPDATE employee SET manager_id=? WHERE id=?`, [
        newManagerID,
        employeeID,
      ]);
    }
  };

  async removeEmployee() {

    let employeeNames = this.employeeList[0].map(
      (emp) => `${emp["First Name"]} ${emp["Last Name"]}`
    );

    const empPicker = await prompt({
      type: "list",
      message: "Select employee to remove:",
      choices: employeeNames,
      name: "selectedEmployee",
    });

  
    let employeeIndex = employeeNames.indexOf(empPicker.selectedEmployee);
    let employeeID = this.employeeList[0][employeeIndex]['Employee ID']

    return db
      .promise()
      .query(`DELETE FROM employee WHERE id=?`, 
      employeeID
      );

  };


  async viewEmployeesByManager() {
    
    let employeeNames = this.employeeList[0].map(
      (emp) => `${emp["First Name"]} ${emp["Last Name"]}`
    );

    const empPicker = await prompt({
      type: "list",
      message: "Select manager to get direct reports from:",
      choices: employeeNames,
      name: "selectedEmployee",
    });


    let employeeIndex = employeeNames.indexOf(empPicker.selectedEmployee);
    let employeeID = this.employeeList[0][employeeIndex]['Employee ID']
    

    let managedEmployees = await db.promise().query(
      `SELECT copy1.id AS 'Employee ID', copy1.first_name AS 'First Name', copy1.last_name AS 'Last Name', role.title AS ' Title', role.salary AS 'Salary', department.name AS 'Department', copy2.first_name AS 'Manager First Name', copy2.last_name as 'Manager Last Name'
                FROM employee copy1
                LEFT JOIN role ON copy1.role_id=role.id 
                LEFT JOIN department ON role.department_id=department.id
                LEFT JOIN employee copy2 ON copy1.manager_id=copy2.id
                WHERE copy1.manager_id=?`,
                employeeID
    );

    console.log(`Employees reporting to ${empPicker.selectedEmployee}:`)
    console.table(managedEmployees[0]);
    console.log("");
  };
  

  async viewEmployeesByDepartment(depts) {
    let deptNames = depts[0].map(dept => dept.Department);

    const deptPicker = await prompt({
      type: "list",
      message: "Select department to get employees from:",
      choices: deptNames,
      name: "selectedDept",
    });
    

    let deptEmployees = await db.promise().query(
      `SELECT copy1.id AS 'Employee ID', copy1.first_name AS 'First Name', copy1.last_name AS 'Last Name', role.title AS ' Title', role.salary AS 'Salary', department.name AS 'Department', copy2.first_name AS 'Manager First Name', copy2.last_name as 'Manager Last Name'
                FROM employee copy1
                LEFT JOIN role ON copy1.role_id=role.id 
                LEFT JOIN department ON role.department_id=department.id
                LEFT JOIN employee copy2 ON copy1.manager_id=copy2.id
                WHERE department.name=?`,
                deptPicker.selectedDept
    );


    console.log(`Employees in department ${deptPicker.selectedDept}:`)
    console.table(deptEmployees[0]);
    console.log("");
  }
}

module.exports = Employees;