const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

const validPuzzleString = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3';
const validPuzzleSolution = '568913724342687519197254386685479231219538467734162895926345178473891652851726943';
const puzzleStringWithInvalidCharacters = '1.5a.2.84..63.12.7.2..5..c..9..1..0.8.2.3674.3.7.2..9.47.0.8..1..16....926914.37.';
const puzzleStringOfWrongLength = '..839.7.575.....964..1.....16.29846.9.32.7..754.....62..5.78.8...3.2...492...1';
const unsolvablePuzzleString = '82..4..6...16..89...18315.749.157...2....4....53..4...16.415..81..7632..3...28.5.'

chai.use(chaiHttp);

suite('Functional Tests', () => {
    test('Solve a puzzle with valid puzzle string: POST request to /api/solve', function(done){
        chai.request(server)
         .post('/api/solve')
         .send({puzzle: validPuzzleString})
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.property(res.body, 'solution', 'Body should contain solution for solvable puzzles');
           assert.notProperty(res.body, 'error', 'Body should not contain error for solvable puzzles');
           assert.equal(res.body.solution, validPuzzleSolution, 'Body should contain correct solution for solvable puzzles');
           done();
         });
     });

     test('Solve a puzzle with missing puzzle string: POST request to /api/solve', function(done){
        chai.request(server)
         .post('/api/solve')
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.notProperty(res.body, 'solution', 'Body should not contain solution if puzzle string was missing');
           assert.property(res.body, 'error', 'Body should contain error if puzzle string was missing');
           assert.equal(res.body.error, 'Required field missing');
           done();
         });
     });

     test('Solve a puzzle with invalid characters: POST request to /api/solve', function(done){
        chai.request(server)
         .post('/api/solve')
         .send({puzzle: puzzleStringWithInvalidCharacters})
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.notProperty(res.body, 'solution', 'Body should not contain solution if puzzle string was missing');
           assert.property(res.body, 'error', 'Body should contain error for invalid puzzle string');
           assert.equal(res.body.error, 'Invalid characters in puzzle');
           done();
         });
     });

     test('Solve a puzzle with incorrect length: POST request to /api/solve', function(done){
        chai.request(server)
         .post('/api/solve')
         .send({puzzle: puzzleStringOfWrongLength})
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.notProperty(res.body, 'solution', 'Body should not contain solution if puzzle string is incorrect length');
           assert.property(res.body, 'error', 'Body should contain error for puzzle string with incorrect length');
           assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
           done();
         });
     });

     test('Solve a puzzle that cannot be solved: POST request to /api/solve', function(done){
        chai.request(server)
         .post('/api/solve')
         .send({puzzle: unsolvablePuzzleString})
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.notProperty(res.body, 'solution', 'Body should not contain solution if puzzle cannot be solved');
           assert.property(res.body, 'error', 'Body should contain error for puzzle that cannot be solved');
           assert.equal(res.body.error, 'Puzzle cannot be solved');
           done();
         });
     });

     test('Check a puzzle placement with all fields: POST request to /api/check', function(done){
        chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, coordinate: 'E5', value: 3})
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.property(res.body, 'valid', 'Body should contain valid when checking puzzle placement');
           assert.notProperty(res.body, 'conflict', 'Body should not contain conflict for valid puzzle placement');
           assert.equal(res.body.valid, true);
           done();
         });
     });

     test('Check a puzzle placement with single placement conflict: POST request to /api/check', function(done){
        chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, coordinate: 'E5', value: 1})
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.property(res.body, 'valid', 'Body should contain valid when checking puzzle placement');
           assert.property(res.body, 'conflict', 'Body should contain conflict for invalid puzzle placement');
           assert.isArray(res.body.conflict, 'conflict should be an array when checking for invalid puzzle placements')
           assert.equal(res.body.valid, false);
           assert.equal(res.body.conflict.length, 1, 'conflict should only have one item when a single conflict placement was found');
           assert.include(res.body.conflict, 'column', 'conflict should only have "column" if only an invalid column displacement was found');
         });

        chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, coordinate: 'A2', value: 1})
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.property(res.body, 'valid', 'Body should contain valid when checking puzzle placement');
           assert.property(res.body, 'conflict', 'Body should contain conflict for invalid puzzle placement');
           assert.isArray(res.body.conflict, 'conflict should be an array when checking for invalid puzzle placements')
           assert.equal(res.body.valid, false);
           assert.equal(res.body.conflict.length, 1, 'conflict should only have one item when a single conflict placement was found');
           assert.include(res.body.conflict, 'row', 'conflict should only have "row" if only an invalid row displacement was found');
         });

        chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, coordinate: 'G4', value: 1})
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.property(res.body, 'valid', 'Body should contain valid when checking puzzle placement');
           assert.property(res.body, 'conflict', 'Body should contain conflict for invalid puzzle placement');
           assert.isArray(res.body.conflict, 'conflict should be an array when checking for invalid puzzle placements')
           assert.equal(res.body.valid, false);
           assert.equal(res.body.conflict.length, 1, 'conflict should only have one item when a single conflict placement was found');
           assert.include(res.body.conflict, 'region', 'conflict should only have "region" if only an invalid region displacement was found');
         });

         done();
     });

     test('Check a puzzle placement with multiple placement conflicts: POST request to /api/check', function(done){
        chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, coordinate: 'E5', value: 9})
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.property(res.body, 'valid', 'Body should contain valid when checking puzzle placement');
           assert.property(res.body, 'conflict', 'Body should contain conflict for invalid puzzle placement');
           assert.isArray(res.body.conflict, 'conflict should be an array when checking for invalid puzzle placements')
           assert.equal(res.body.valid, false);
           assert.equal(res.body.conflict.length, 2, 'conflict should have more than one item when multiple conflict placements were found');
           assert.include(res.body.conflict, 'column', 'conflict should have "column" if an invalid column displacement was found');
           assert.include(res.body.conflict, 'row', 'conflict should have "row" if an invalid row displacement was found');
         });

        chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, coordinate: 'G5', value: 9})
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.property(res.body, 'valid', 'Body should contain valid when checking puzzle placement');
           assert.property(res.body, 'conflict', 'Body should contain conflict for invalid puzzle placement');
           assert.isArray(res.body.conflict, 'conflict should be an array when checking for invalid puzzle placements')
           assert.equal(res.body.valid, false);
           assert.equal(res.body.conflict.length, 2, 'conflict should have more than one item when multiple conflict placements were found');
           assert.include(res.body.conflict, 'column', 'conflict should have "column" if an invalid column displacement was found');
           assert.include(res.body.conflict, 'region', 'conflict should have "region" if an invalid region displacement was found');
         });

         chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, coordinate: 'C6', value: 8})
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.property(res.body, 'valid', 'Body should contain valid when checking puzzle placement');
           assert.property(res.body, 'conflict', 'Body should contain conflict for invalid puzzle placement');
           assert.isArray(res.body.conflict, 'conflict should be an array when checking for invalid puzzle placements')
           assert.equal(res.body.valid, false);
           assert.equal(res.body.conflict.length, 2, 'conflict should have more than one item when multiple conflict placements were found');
           assert.include(res.body.conflict, 'row', 'conflict should have "row" if an invalid row displacement was found');
           assert.include(res.body.conflict, 'region', 'conflict should have "region" if an invalid region displacement was found');
         });

         done();
     });

     test('Check a puzzle placement with all placement conflicts: POST request to /api/check', function(done){
        chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, coordinate: 'E2', value: 9})
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.property(res.body, 'valid', 'Body should contain valid when checking puzzle placement');
           assert.property(res.body, 'conflict', 'Body should contain conflict for invalid puzzle placement');
           assert.isArray(res.body.conflict, 'conflict should be an array when checking for invalid puzzle placements')
           assert.equal(res.body.valid, false);
           assert.equal(res.body.conflict.length, 3, 'conflict should have more than one item when multiple conflict placements were found');
           assert.include(res.body.conflict, 'column', 'conflict should have "column" if an invalid column displacement was found');
           assert.include(res.body.conflict, 'row', 'conflict should have "row" if an invalid row displacement was found');
           assert.include(res.body.conflict, 'region', 'conflict should have "region" if an invalid region displacement was found');
           done();
         });
     });

     test('Check a puzzle placement with missing required fields: POST request to /api/check', function(done){
        chai.request(server)
         .post('/api/check')
         .end(function(err, res){
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'valid', 'Body should not contain placement outcome if all required placement fields are missing');
            assert.property(res.body, 'error', 'Body should contain error if required placement fields are missing');
            assert.equal(res.body.error, 'Required field(s) missing');
         });

        chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString})
         .end(function(err, res){
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'valid', 'Body should not contain placement outcome if all required placement fields are missing');
            assert.property(res.body, 'error', 'Body should contain error if required placement fields are missing');
            assert.equal(res.body.error, 'Required field(s) missing');
         });

         chai.request(server)
         .post('/api/check')
         .send({coordinate: 'E2'})
         .end(function(err, res){
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'valid', 'Body should not contain placement outcome if all required placement fields are missing');
            assert.property(res.body, 'error', 'Body should contain error if required placement fields are missing');
            assert.equal(res.body.error, 'Required field(s) missing');
         });

         chai.request(server)
         .post('/api/check')
         .send({value: 9})
         .end(function(err, res){
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'valid', 'Body should not contain placement outcome if all required placement fields are missing');
            assert.property(res.body, 'error', 'Body should contain error if required placement fields are missing');
            assert.equal(res.body.error, 'Required field(s) missing');
         });

        chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, coordinate: 'E2'})
         .end(function(err, res){
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'valid', 'Body should not contain placement outcome if all required placement fields are missing');
            assert.property(res.body, 'error', 'Body should contain error if required placement fields are missing');
            assert.equal(res.body.error, 'Required field(s) missing');
         });

        chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, value: 9})
         .end(function(err, res){
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'valid', 'Body should not contain placement outcome if all required placement fields are missing');
            assert.property(res.body, 'error', 'Body should contain error if required placement fields are missing');
            assert.equal(res.body.error, 'Required field(s) missing');
         });

         chai.request(server)
         .post('/api/check')
         .send({coordinate: 'E2', value: 9})
         .end(function(err, res){
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'valid', 'Body should not contain placement outcome if all required placement fields are missing');
            assert.property(res.body, 'error', 'Body should contain error if required placement fields are missing');
            assert.equal(res.body.error, 'Required field(s) missing');
         });

         done();
     });

     test('Check a puzzle placement with invalid characters: POST request to /api/check', function(done){
        chai.request(server)
         .post('/api/check')
         .send({puzzle: puzzleStringWithInvalidCharacters, coordinate: 'E2', value: 9})
         .end(function(err, res){
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'valid', 'Body should not contain placement outcome if puzzle has invalid characters');
            assert.property(res.body, 'error', 'Body should contain error if puzzle has invalid characters');
            assert.equal(res.body.error, 'Invalid characters in puzzle');
           done();
         });
     });

     test('Check a puzzle placement with incorrect length: POST request to /api/check', function(done){
        chai.request(server)
         .post('/api/check')
         .send({puzzle: puzzleStringOfWrongLength, coordinate: 'E2', value: 9})
         .end(function(err, res){
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'valid', 'Body should not contain placement outcome if puzzle is of incorrect length');
            assert.property(res.body, 'error', 'Body should contain error if puzzle is of incorrect length');
            assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
           done();
         });
     });

     test('Check a puzzle placement with invalid placement coordinate: POST request to /api/check', function(done){
        chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, coordinate: 'K2', value: 9})
         .end(function(err, res){
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'valid', 'Body should not contain placement outcome if incorrect coordinate was provided');
            assert.property(res.body, 'error', 'Body should contain error if incorrect coordinate was provided');
            assert.equal(res.body.error, 'Invalid coordinate');
           done();
         });
     });

     test('Check a puzzle placement with invalid placement value: POST request to /api/check*/', function(done){
        chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, coordinate: 'E2', value: '0'})
         .end(function(err, res){
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'valid', 'Body should not contain placement outcome if incorrect value was provided');
            assert.property(res.body, 'error', 'Body should contain error if incorrect value was provided');
            assert.equal(res.body.error, 'Invalid value');
         });

         chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, coordinate: 'E2', value: '10'})
         .end(function(err, res){
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'valid', 'Body should not contain placement outcome if incorrect value was provided');
            assert.property(res.body, 'error', 'Body should contain error if incorrect value was provided');
            assert.equal(res.body.error, 'Invalid value');
         });

         chai.request(server)
         .post('/api/check')
         .send({puzzle: validPuzzleString, coordinate: 'E2', value: 'A'})
         .end(function(err, res){
            assert.equal(res.status, 200);
            assert.notProperty(res.body, 'valid', 'Body should not contain placement outcome if incorrect value was provided');
            assert.property(res.body, 'error', 'Body should contain error if incorrect value was provided');
            assert.equal(res.body.error, 'Invalid value');
         });

         done();
     });
});

/*


Check a puzzle placement with invalid placement value: POST request to /api/check*/