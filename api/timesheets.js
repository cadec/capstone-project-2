const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, id) => {
  db.get('SELECT * FROM Timesheet WHERE id = $id', {
    $id: id
  }, (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet){
      req.timesheet = timesheet;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Timesheet WHERE employee_id = $id', {
    $id: req.params.employeeId
  }, (error, timesheets) => {
    if (error){
      next(error);
    } else {
      res.status(200).send({timesheets: timesheets});
    }
  });
})

timesheetsRouter.post('/', (req, res, next) => {
  const timesheet = req.body.timesheet;
  if (timesheet.hours && timesheet.rate && timesheet.date){
    db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES
            ($hours, $rate, $date, $employeeId)`, {
              $hours: timesheet.hours,
              $rate: timesheet.rate,
              $date: timesheet.date,
              $employeeId: req.params.employeeId
            }, function(error){
              if (error){
                return next(error);
              } else {
                db.get('SELECT * FROM Timesheet WHERE id = $id', {
                  $id: this.lastID
                }, (error, timesheet) => {
                  if (error){
                    next(error);
                  } else {
                    res.status(201).send({timesheet: timesheet});
                  }
                });
              }
            });
  } else {
    res.sendStatus(400);
  }
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const timesheet = req.body.timesheet;
  if (timesheet.hours && timesheet.rate && timesheet.date){
    db.run(`UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date
      WHERE id = $id`, {
        $hours: timesheet.hours,
        $rate: timesheet.rate,
        $date: timesheet.date,
        $id: req.timesheet.id
      }, (error) => {
        if (error){
          next(error);
        } else {
          db.get('SELECT * FROM Timesheet WHERE id = $id', {
            $id: req.timesheet.id
          }, (error, timesheet) => {
            if (error){
              next(error);
            } else {
              res.status(200).send({timesheet: timesheet});
            }
          })
        }
      });
  } else {
    res.sendStatus(400);
  }
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  db.run('DELETE FROM Timesheet WHERE id = $id', {
    $id: req.timesheet.id
  }, (error) => {
    if (error){
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = timesheetsRouter;
