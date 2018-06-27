const express = require('express');
const sqlite3 = require('sqlite3');

menuRouter = express.Router();

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


// GET from /api/menus
menuRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Menu`,
    (error, rows) => {
    if (error) {
      console.log(error);
    }
    res.status(200).send({menus: rows});
  });
});
// POST to /api/menus
menuRouter.post('/', (req, res, next) => {
  const newMenu = req.body.menu;
  db.run(`INSERT INTO Menu (title)
          VALUES ($title)`,
          {$title: newMenu.title},
          function(error) {
    if (error) {
          console.log(error);
          return res.status(400).send();
    }
    db.get('SELECT * FROM Menu WHERE id = $id',
      {$id: this.lastID},
      (error, row) => {
        if (error) {
          console.log(error);
        }
        res.status(201).send({menu: row});

    });
  });
});
// GET from /api/menus/:menuId
menuRouter.get('/:id', (req, res, next) => {
  const menuId = req.params.id;
  db.get('SELECT * FROM Menu WHERE id = $menuId',
    {$menuId: menuId},
    (error, row) => {
      if (error) {
        console.log(error);
      }
      if (!row) {
        return res.status(404).send();
      }
      res.status(200).send({menu: row});

  });
});
// PUT to /api/menus/:menuId
menuRouter.put('/:id', (req, res, next) => {
  const menuId = req.params.id;
  const updatedMenu = req.body.menu;
  db.run(`UPDATE Menu SET title = $title WHERE id = $id`,
    {$title: updatedMenu.title,
     $id: menuId},
    (error) => {
      if (error) {
        console.log(error);
        return res.status(400).send();
      }
      db.get(`SELECT * FROM Menu WHERE id = $id`,
        {$id: menuId},
        (error, row) => {
          if (error) {
            console.log(error);
          }
          res.status(200).send({menu: row});
      });
  });
});
// DELETE from /api/menus/:menuId
menuRouter.delete('/:id', (req, res, next) => {
  const menuId = req.params.id;
  db.get(`SELECT * FROM MenuItem WHERE menu_id = $menuId`,
    {$menuId: menuId},
    (error, row) => {
      if (error) {
        console.log(error);
      } else if (row) {
        return res.status(400).send();
      } else if (!row) {
        db.run(`DELETE FROM Menu WHERE id = $menuId`,
          {$menuId: menuId},
          (error) => {
            if (error) {
              console.log(error);
            }
            res.status(204).send();
        });
      }
  });
});
//GET from /api/menus/:menuId/menu-items
menuRouter.get('/:menuId/menu-items', (req, res, next) => {
  const menuId = req.params.menuId;
  db.get(`SELECT * FROM Menu WHERE id = $menuId`,
    {$menuId: menuId},
    (error, row) => {
      if (error) {
        console.log(error);
      }
      if (!row) {
        console.log('invalid');
        return res.status(404).send();
      }
      db.all(`SELECT * FROM MenuItem WHERE menu_id = $menuId`,
        {$menuId: menuId},
        (error, rows) => {
          if (error) {
            console.log(error);
          }
          res.status(200).send({menuItems: rows});

      });
  });
});
// POST to /api/menus/:menuId/menu-items
menuRouter.post('/:menuId/menu-items', (req, res, next) => {
  const menuId = req.params.menuId;
  const newMenuItem = req.body.menuItem;
  db.run(`INSERT INTO MenuItem (name, description, inventory, price, menu_id)
          VALUES ($name, $description, $inventory, $price, $menuId)`,
          {$name: newMenuItem.name,
           $description: newMenuItem.description,
           $inventory: newMenuItem.inventory,
           $price: newMenuItem.price,
           $menuId: menuId},
        function(error) {
          if (error) {
            console.log(error);
            return res.status(400).send();
          }
          db.get(`SELECT * FROM MenuItem WHERE id = $id`,
            {$id: this.lastID},
            (error, row) => {
              if (error) {
                console.log(error);
              }
              res.status(201).send({menuItem: row})
          });
  });
});
// PUT to /api/menus/:menuId/menu-items/:menuItemId
menuRouter.put('/:menuId/menu-items/:menuItemId', (req, res, next) => {
  const menuId = req.params.menuId;
  const menuItemId = req.params.menuItemId;
  const updatedMenuItem = req.body.menuItem;
  db.get(`SELECT * FROM MenuItem WHERE id = $menuItemId`,
    {$menuItemId: menuItemId},
    (error, row) => {
      if (error) {
        console.log(error);
      }
      if (!row) {
        return res.status(404).send();
      }
      db.run(`UPDATE MenuItem
              SET name = $name, description = $description, inventory = $inventory,
                  price = $price, menu_id = $menuId
              WHERE id = $menuItemId`,
        {$name: updatedMenuItem.name,
         $description: updatedMenuItem.description,
         $inventory: updatedMenuItem.inventory,
         $price: updatedMenuItem.price,
         $menuId: menuId,
         $menuItemId: menuItemId},
        function(error, row) {
          if (error) {
            console.log(error);
            return res.status(400).send();
          } else {
            db.get(`SELECT * FROM MenuItem WHERE id = $menuItemId`,
              {$menuItemId: menuItemId},
              (error, row) => {
              if (error) {
                console.log(error);
              }
              res.status(200).send({menuItem: row});
            });
          }
      });
  });
});
// DELTE from /api/menus/:menuId/menu-items/:menuItemId
menuRouter.delete('/:menuId/menu-items/:menuItemId', (req, res, next) => {
  const menuId = req.params.menuId;
  const menuItemId = req.params.menuItemId;
  console.log(menuId, menuItemId);
  db.get(`SELECT * FROM MenuItem WHERE id = $menuItemId`,
    {$menuItemId: menuItemId},
    (error, row) => {
      if (error) {
        console.log(row);
      }
      if (!row) {
        return res.status(404).send();
      }
      console.log(row);
      db.run(`DELETE FROM MenuItem WHERE id = $menuItemId`,
        {$menuItemId: menuItemId},
        (error) => {
          if (error) {
            console.log(error);
          }
          res.status(204).send();
      });
  });


});

module.exports = menuRouter;
