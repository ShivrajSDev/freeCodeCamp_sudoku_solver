const chai = require('chai');
const assert = chai.assert;

const Solver = require('../controllers/sudoku-solver.js');
let solver = new Solver();

const validPuzzleString = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3';
const validPuzzleSolution = '568913724342687519197254386685479231219538467734162895926345178473891652851726943';
const puzzleStringWithInvalidCharacters = '1.5a.2.84..63.12.7.2..5..c..9..1..0.8.2.3674.3.7.2..9.47.0.8..1..16....926914.37.';
const puzzleStringOfWrongLength = '..839.7.575.....964..1.....16.29846.9.32.7..754.....62..5.78.8...3.2...492...1';
const unsolvablePuzzleString = '82..4..6...16..89...18315.749.157...2....4....53..4...16.415..81..7632..3...28.5.'

suite('Unit Tests', () => {

    test('Logic handles a valid puzzle string of 81 characters', function() {
        assert.equal((solver.validate(validPuzzleString)).valid, true);
    });

    test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', function() {
        assert.equal((solver.validate(puzzleStringWithInvalidCharacters)).valid, false);
    });

    test('Logic handles a puzzle string that is not 81 characters in length', function() {
        assert.equal((solver.validate(puzzleStringOfWrongLength)).valid, false);
    });

    test('Logic handles a valid row placement', function() {
        assert.equal(solver.checkRowPlacement(validPuzzleString, 1, 2, 1), true);
    });
    
    test('Logic handles an invalid row placement', function() {
        assert.equal(solver.checkRowPlacement(validPuzzleString, 0, 2, 1), false);
    });

    test('Logic handles a valid column placement', function() {
        assert.equal(solver.checkColPlacement(validPuzzleString, 5, 4, 1), true);
    });
    
    test('Logic handles an invalid column placement', function() {
        assert.equal(solver.checkColPlacement(validPuzzleString, 5, 5, 1), false);
    });

    test('Logic handles a valid region (3x3 grid) placement', function() {
        assert.equal(solver.checkRegionPlacement(validPuzzleString, 1, 2, 1), true);
    });
    
    test('Logic handles an invalid region (3x3 grid) placement', function() {
        assert.equal(solver.checkRegionPlacement(validPuzzleString, 1, 4, 1), false);
    });

    test('Valid puzzle strings pass the solver', function() {
        assert.equal(solver.solve(validPuzzleString).solved, true);
    });

    test('Valid puzzle strings pass the solver', function() {
        assert.equal(solver.solve(unsolvablePuzzleString).solved, false);
    });

    test('Solver returns the expected solution for an incomplete puzzle', function() {
        assert.equal(solver.solve(validPuzzleString).solution, validPuzzleSolution);
    });
});
