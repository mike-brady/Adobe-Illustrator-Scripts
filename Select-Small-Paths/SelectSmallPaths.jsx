#target illustrator

/*
  Select Small Paths

  Author: Mike Brady

  Description:
    This script automatically selects all paths with a bounding box smaller than
    or equal to a given size inputed by the user.

  Compatability:
    CS4, CS6, CC 2017, CC 2018, CC 2019
    Compatability with earlier versions untested.

  License:
    MIT License

    Copyright (c) 2018 Mike Brady

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
*/
function main() {
  var doc = app.activeDocument;

  //Deselect all objects
  doc.selection = null;

  var size = prompt("Enter the max size (in inches) to select.\n\nExample: If .05 is entered, all paths with a bounding box smaller than or equal to .05\" x .05\" will be selected.", .05, "Select Small Paths");

  //If user clicks the Cancel button
  if(size==null) {
    return;
  }

  size = parseFloat(size);
  if(isNaN(size)) {
    alert("Error: Input must be a number.");
    return;
  }

  //Convert inch input into points
  size *= 72;

  for(i=0; i<doc.pathItems.length; i++) {
    var path = doc.pathItems[i];
    if(path.width < size && path.height < size) {
      path.selected = true;
    }
  }

  app.redraw();
}

main();
