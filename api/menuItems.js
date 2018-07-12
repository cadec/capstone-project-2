const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, id) => {
  db.get('SELECT * FROM MenuItem WHERE id = $id', {
    $id: id
  }, (error, menuItem) => {
    if (error){
      next(error);
    } else if (!menuItem){
      res.sendStatus(404);
    } else {
      req.menuItem = menuItem;
      next();
    }
  });
});

menuItemsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM MenuItem WHERE menu_id = $id', {
    $id: req.params.menuId
  }, (error, menuItems) => {
    if (error){
      next(error);
    } else {
      res.status(200).send({menuItems: menuItems});
    }
  });
});

menuItemsRouter.post('/', (req, res, next) => {
  const menuItem = req.body.menuItem;
  if (menuItem.name && menuItem.inventory && menuItem.price){
    db.run(`INSERT INTO MenuItem (name, inventory, price, menu_id, description) VALUES (
      $name, $inventory, $price, $id, $description)`, {
      $name: menuItem.name,
      $inventory: menuItem.inventory,
      $price: menuItem.price,
      $id: req.params.menuId,
      $description: menuItem.description
    }, function(error){
      if (error){
        next(error);
      } else {
        db.get('SELECT * FROM MenuItem WHERE id = $id', {
          $id: this.lastID
        }, (error, menuItem) => {
          if (error){
            next(error);
          } else {
            res.status(201).send({menuItem: menuItem});
          }
        });
      }
    });
  } else {
    res.sendStatus(400);
  }
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const menuItem = req.body.menuItem;
  if (menuItem.name && menuItem.inventory && menuItem.price){
    db.run('UPDATE MenuItem SET name = $name, inventory = $inventory, description = $description, price = $price WHERE id = $id', {
      $name: menuItem.name,
      $inventory: menuItem.inventory,
      $price: menuItem.price,
      $description: menuItem.description,
      $id: req.menuItem.id
    }, (error) => {
      if (error){
        next(error);
      } else {
        db.get('SELECT * FROM MenuItem WHERE id = $id', {
          $id: req.menuItem.id
        }, (error, menuItem) => {
          if (error){
            next(error);
          } else {
            res.status(200).send({menuItem: menuItem})
          }
        });
      }
    });
  } else {
    res.sendStatus(400);
  }
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.run('DELETE FROM MenuItem WHERE id = $id', {
    $id: req.menuItem.id
  }, (error) => {
    if (error){
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuItemsRouter;
