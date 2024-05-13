'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  let coordinategRegex = /^[A-Ia-i][1-9]$/;
  let valueRegex = /^[1-9]$/;

  app.route('/api/check')
    .post((req, res) => {

      if(!req.body.coordinate || !req.body.value) {
        res.json({error: "Required field(s) missing"});
        return;
      }

      try {
        let { puzzle, coordinate, value } = req.body;
        solver.validate(puzzle);

        if (!coordinategRegex.test(coordinate)) {
          throw { error: "Invalid coordinate" };
        } else if (!valueRegex.test(value)) {
          throw { error: "Invalid value" };
        }

        let row = (coordinate[0].charCodeAt(0) - 65);     
        let column = coordinate[1];

        let valid = true;
        let conflict = [];

        if(!solver.checkRowPlacement(puzzle, row, column, value)) {
          valid = false;
          conflict.push("row");
        }

        if(!solver.checkColPlacement(puzzle, row, column, value)) {
          valid = false;
          conflict.push("column");
        }

        if(!solver.checkRegionPlacement(puzzle, row, column, value)) {
          valid = false;
          conflict.push("region");
        }

        let result = { valid };
        if(conflict.length > 0) {
          result.conflict = conflict;
        }

        res.json(result);
        
      } catch(err) {
        res.json(err);
      }
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      try {
        let { puzzle } = req.body;

        solver.validate(puzzle);

        let solution = solver.solve(puzzle);

        if(solution) {
          res.json({solution});
        } else {
          res.json({error: "Puzzle cannot be solved"});
        }        
      } catch(err) {
        res.json(err);
      }
    });
};
