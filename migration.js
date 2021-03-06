const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

db.serialize(() => {

db.run('DROP TABLE IF EXISTS Employee');
db.run('DROP TABLE IF EXISTS Timesheet');
db.run('DROP TABLE IF EXISTS Menu');
db.run('DROP TABLE IF EXISTS MenuItem');
db.run(`CREATE TABLE Employee (id INTEGER PRIMARY KEY, name TEXT NOT NULL,
        position TEXT NOT NULL, wage INTEGER NOT NULL, is_current_employee INTEGER DEFAULT 1)`);
db.run(`CREATE TABLE Timesheet (id INTEGER PRIMARY KEY NOT NULL, hours INTEGER NOT NULL,
        rate INTEGER NOT NULL, date INTEGER NOT NULL, employee_id INTEGER NOT NULL)`);
db.run('CREATE TABLE Menu (id INTEGER PRIMARY KEY, title TEXT NOT NULL)');
db.run(`CREATE TABLE MenuItem (id INTEGER PRIMARY KEY, name TEXT NOT NULL,
        description TEXT, inventory INTEGER NOT NULL, price INTEGER NOT NULL,
        menu_id INTEGER NOT NULL)`);
});
