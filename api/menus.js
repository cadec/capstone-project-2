const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemsRouter = require('./menuItems');

menusRouter.param('menuId', (req, res, next, id) => {
  db.get('SELECT * FROM Menu WHERE id = $id', {
    $id: id
  }, (error, menu) => {
    if (error){
      next(error);
    } else if (!menu){
      res.sendStatus(404);
    } else {
      req.menu = menu;
      next();
    }
  });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (error, menus) => {
    if (error){
      next(error);
    } else {
      res.status(200).send({menus: menus});
    }
  });
})

menusRouter.post('/', (req, res, next) => {
  const menu = req.body.menu;
  if (menu.title){
    db.run('INSERT INTO Menu (title) VALUES ($title)', {
      $title: menu.title
    }, function(error){
      if (error){
        next(error);
      } else {
        db.get('SELECT * FROM Menu WHERE id = $id', {
          $id: this.lastID
        }, (error, menu) => {
          if (error){
            next(error);
          } else {
            res.status(201).send({menu: menu});
          }
        })
      }
    });
  } else {
    res.sendStatus(400);
  }
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).send({menu: req.menu});
});

menusRouter.put('/:menuId', (req, res, next) => {
  const menu = req.body.menu;
  if (menu.title){
    db.run('UPDATE Menu SET title = $title WHERE id = $id', {
      $title: menu.title,
      $id: req.menu.id
    }, (error) => {
      if (error){
        next(error);
      } else {
        db.get('SELECT * FROM Menu WHERE id = $id', {
          $id: req.menu.id
        }, (error, menu) => {
          if (error){
            next(error);
          } else {
            res.status(200).send({menu: menu});
          }
        });
      }
    });
  } else {
    res.sendStatus(400);
  }
});

menusRouter.delete('/:menuId', (req, res, next) => {
  db.all('SELECT * FROM MenuItem WHERE menu_id = $id', {
    $id: req.menu.id
  }, (error, menuItems) => {
    if (menuItems.length === 0){
      db.run('DELETE FROM Menu WHERE id = $id', {
        $id: req.params.menuId
      }, (error) => {
        if (error){
          next(error);
        } else {
          res.sendStatus(204);
        }
      })
    } else {
      res.sendStatus(400);
    }
  });
});

module.exports = menusRouter;
