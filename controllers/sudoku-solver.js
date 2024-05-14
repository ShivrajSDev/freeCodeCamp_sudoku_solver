class SudokuSolver {

  constructor() {
    this.puzzleStringRegex = /^[0-9.]{81}$/;
    this.puzzleStringValidLength = 81
  }

  validate(puzzleString) {
    if(puzzleString.length !== this.puzzleStringValidLength) {
      return { valid: false, error: "Expected puzzle to be 81 characters long" };
    }
      
    if(!this.puzzleStringRegex.test(puzzleString)) {
      return { valid: false, error: "Invalid characters in puzzle" };
    }

    return { valid: true }
  }

  checkRowPlacement(puzzleString, row, column, value) {
    let rowItems = '';

    for(let i = 0; i < 9; i++) {
      rowItems += (puzzleString[(row*9) + i]);
    }

    let rowItemsToCheck = rowItems.slice(0, column-1) + rowItems.slice(column);

    return !rowItemsToCheck.includes(value);
  }

  checkColPlacement(puzzleString, row, column, value) {
    let columnItems = '';

    for(let i = 0; i < 9; i++) {
      columnItems += (puzzleString[(i*9) + (column-1)]);
    }

    let columnItemsToCheck = columnItems.slice(0, row) + columnItems.slice(row+1);

    return !columnItemsToCheck.includes(value);
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    let regionItems = '';
    let startingRow = parseInt(row / 3) * 3;
    let startingColumn = parseInt((column-1) / 3) * 3;

    for(let puzzleRow = startingRow; puzzleRow < startingRow + 3; puzzleRow++) {
      for(let puzzleCol = startingColumn; puzzleCol < startingColumn + 3; puzzleCol++) {
          regionItems += puzzleString[(9*puzzleRow) + puzzleCol];
      }
    }

    let itemToRemove = (row%3)*3 + (column-1)%3;
    let regionItemsToCheck = regionItems.slice(0, itemToRemove) + regionItems.slice(itemToRemove+1);

    return !regionItemsToCheck.includes(value);
  }

  solve(puzzleString) {
    if(!puzzleString.includes('.')) {
      return { solved: true, solution: puzzleString };
    }

    let i = puzzleString.indexOf('.');
    let row =  parseInt(i / 9);
    let column = parseInt(i % 9) + 1;

    for(let n = 1; n <= 9; n++) {
      if(!this.checkRowPlacement(puzzleString, row, column, n) || !this.checkColPlacement(puzzleString, row, column, n) 
        || !this.checkRegionPlacement(puzzleString, row, column, n)) {
        continue;
      }

      let updatedPuzzleString = puzzleString.split('');
      updatedPuzzleString[i] = n;
      let result = this.solve(updatedPuzzleString.join(''));

      if(result.solved) {
        return { solved: true, solution: result.solution };
      }
    }

    return { solved: false };
  }
}

module.exports = SudokuSolver;

