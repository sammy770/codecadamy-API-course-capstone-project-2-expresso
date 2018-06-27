const express = require('express');
const sqlite3 = require('sqlite3');

employeeRouter = express.Router();

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


// GET from /api/employees
employeeRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`,
    (error, rows) => {
      if (error) {
        console.log(error);
      }
      res.status(200).send({employees: rows})
  });
});

// POST to /api/employees
employeeRouter.post('/', (req, res, next) => {
  const employeeToCreate = req.body.employee;
  const newName = employeeToCreate.name;
  const newPosition = employeeToCreate.position;
  const newWage = employeeToCreate.wage;
  db.run(`INSERT INTO Employee (name, position, wage)
          VALUES ($name, $position, $wage)`,
    {$name: newName,
     $position: newPosition,
     $wage: newWage},
    function(error, row) {
    if (error) {
      console.log(error);
      return res.status(400).send();
    }
    db.get(`SELECT * FROM Employee WHERE id = $id`, // get employee with newly created id
      {$id: this.lastID},
      (error, row) => {
      if (error) {
        console.log(error);
      }
      res.status(201).send({employee: row})
    })
  })
});
// GET from /api/employees/:employeeId
employeeRouter.get('/:id', (req, res, next) => {
  const EmployeeId = req.params.id;
  db.get(`SELECT * FROM Employee WHERE id = $id`,
    {$id: EmployeeId},
    (error, row) => {
    if (error) {
      console.log(error);
    }
    if (!row) {
      return res.status(404).send();
    }
    res.status(200).send({employee: row});
  });
});
// PUT to /api/employees/:employeeId
employeeRouter.put('/:id', (req, res, next) => {
  const EmployeeId = req.params.id;
  const Employee = req.body.employee;
  const name = Employee.name;
  const position = Employee.position;
  const wage = Employee.wage;
  db.run(`UPDATE Employee
          SET name = $name,
            position = $position,
            wage = $wage,
            is_current_employee = 1
          WHERE id = $id`,
    {$name: name,
     $position: position,
     $wage: wage,
     $id: EmployeeId},
    function(error, row) {
    if (error) {
      console.log(error);
      return res.status(400).send();
    }
    db.get(`SELECT * FROM Employee WHERE id = $id`,
      {$id: EmployeeId},
      (error, row) => {
      if (error) {
        console.log(error);
      }
      res.status(200).send({employee: row});
    })
  })
});
// DELETE from /api/employees/:employeeId
employeeRouter.delete('/:id', (req, res, next) => {
  const employeeId = req.params.id;
  db.get(`SELECT * FROM Employee WHERE id = $employeeId`,
    {$employeeId: employeeId},
    (error, row) => {
      if (error) {
        console.log(error);
      }
      if (!row) {
        res.status(404).send();
      }
      const deletedEmployee = row;
      db.run(`UPDATE Employee SET is_current_employee = 0 WHERE id = $id`,
        {$id: employeeId},
        (error) => {
        if (error) {
          console.log(error);
        }
        deletedEmployee.is_current_employee = 0;
        res.status(200).send({employee: deletedEmployee})
      })
    });
});
// GET from /api/employees/:employeeId/timesheets
employeeRouter.get('/:employeeId/timesheets', (req, res, next) => {
  const employeeId = req.params.employeeId;
  db.get(`SELECT * FROM Employee WHERE id = $employeeId`,
    {$employeeId: employeeId},
    (error, row) => {
      if (error) {
        console.log(error);
      }
      if (!row) {
        return res.status(404).send();
      }
      db.all(`SELECT * FROM Timesheet WHERE employee_id = $employeeId`,
        {$employeeId: employeeId},
        (error, rows) => {
        if (error) {
          console.log(error);
        }
        if (!rows) {
          return res.status(200).send({timesheets: []});
        }
        res.status(200).send({timesheets: rows})
      });
  });
});
// POST to /api/employees/:employeeId/timesheets
employeeRouter.post('/:employeeId/timesheets', (req, res, next) => {
  const employeeId = req.params.employeeId;
  const timesheet = req.body.timesheet;
  db.get(`SELECT * FROM Employee where id = $employeeId`,
    {$employeeId: employeeId},
    (error, row) => {
    if (error) {
      console.log(error);
    }
    if (!row) {
      return res.status(404).send();
    }
    db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id)
            VALUES ($hours, $rate, $date, $employeeId)`,
      {$hours: timesheet.hours,
       $rate: timesheet.rate,
       $date: timesheet.date,
       $employeeId: employeeId},
      function(error) {
      if (error) {
        console.log(error);
        return res.status(400).send();
      }
      db.get(`SELECT * FROM Timesheet WHERE id = $id`,
        {$id: this.lastID},
        (error, row) => {
        if (error) {
          console.log(error);
        }
        res.status(201).send({timesheet: row})
      })
    });
  });
});
// PUT to /api/employees/:employeeId/timesheets/:timesheetId
employeeRouter.put('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
  const employeeId = req.params.employeeId;
  const timesheetId = req.params.timesheetId;
  const updatedTimesheet = req.body.timesheet;

  db.get(`SELECT * FROM Employee where id = $employeeId`,
    {$employeeId: employeeId},
    (error, row) => {
    if (error) {
      console.log(error);
    }
    if (!row) {
      return res.status(404).send();
    }
    db.get('SELECT * FROM Timesheet WHERE id = $timesheetId',
            {$timesheetId: timesheetId},
    (error, row) => {
      if (error) {
        console.log(error);
      }
      if (!row) {
        return res.status(404).send();
      }
      db.run(`UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE id = $timesheetId `,
        {$hours: updatedTimesheet.hours,
          $rate: updatedTimesheet.rate,
          $date: updatedTimesheet.date,
          $timesheetId: timesheetId},
        (error) => {
        if (error) {
          console.log(error);
          return res.status(400).send();
        }
        db.get('SELECT * FROM Timesheet WHERE id = $timesheetId',
                {$timesheetId: timesheetId},
        (error, row) => {
          if (error) {
            console.log(error);
          }
          res.status(200).send({timesheet: row});
        });
      })
    });
  });
});
// DELETE from /api/employees/:employeeId/timesheets/:timesheetId
employeeRouter.delete('/:employeeId/timesheets/:timesheetId', (req, res, next) => {
  const employeeId = req.params.employeeId;
  const timesheetId = req.params.timesheetId;
  db.get(`SELECT * FROM Timesheet where id = $timesheetId`,
    {$timesheetId: timesheetId},
    (error, row) => {
    if (error) {
      console.log(error);
    }
    if (!row) {
      return res.status(404).send();
    }
    db.run('DELETE FROM Timesheet WHERE id = $timesheetId',
      {$timesheetId: timesheetId},
      (error) => {
      if (error) {
        console.log(error);
      }
      res.status(204).send();
    })

  });
});

module.exports = employeeRouter;
