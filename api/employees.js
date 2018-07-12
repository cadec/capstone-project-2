const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const timesheetsRouter = require('./timesheets');

employeesRouter.param('employeeId', (req, res, next, id) => {
  db.get('SELECT * FROM Employee WHERE id = $id', {
    $id: id
  }, (error, employee) => {
    if (error){
      next(error);
    } else if (!employee) {
      res.sendStatus(404);
    } else {
      req.employee = employee;
      next();
    }
  });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (error, employees) => {
    if (error){
      next(error);
    } else {
      res.status(200).send({employees: employees});
    }
  })
});

employeesRouter.post('/', (req, res, next) => {
  const employee = req.body.employee;
  if (employee.name && employee.position && employee.wage){
    db.run('INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage)', {
      $name: employee.name,
      $position: employee.position,
      $wage: employee.wage
    }, function(error){
      if (error){
        next(error);
      } else {
        db.get('SELECT * FROM Employee WHERE id = $id', {
          $id: this.lastID
        }, (error, employee) => {
          if (error){
            next(error);
          } else {
            res.status(201).send({employee: employee});
          }
        });
      }
    });
  } else {
    res.sendStatus(400);
  }
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).send({employee: req.employee});
})

employeesRouter.put('/:employeeId', (req, res, next) => {
  const employee = req.body.employee;
  if (employee.name && employee.position && employee.wage){
    db.run(`UPDATE Employee SET name = $name, position = $position, wage = $wage
            WHERE id = $id`, {
              $name: employee.name,
              $position: employee.position,
              $wage: employee.wage,
              $id : req.employee.id
            }, (error) => {
              if (error){
                next(error);
              } else {
                db.get('SELECT * FROM Employee WHERE id = $id', {
                  $id: req.employee.id
                }, (error, employee) => {
                  if (error){
                    next(error);
                  } else {
                    res.status(200).send({employee: employee});
                  }
                })
              }
            });
  } else {
    res.sendStatus(400);
  }
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  db.run('UPDATE Employee SET is_current_employee = 0', (error) => {
    if (error){
      next(error);
    } else {
      db.get('SELECT * FROM Employee WHERE id = $id', {
        $id: req.employee.id
      }, (error, employee) => {
        if (error){
          next(error);
        } else {
          res.status(200).send({employee: employee})
        }
      });
    }
  });
});

module.exports = employeesRouter;
