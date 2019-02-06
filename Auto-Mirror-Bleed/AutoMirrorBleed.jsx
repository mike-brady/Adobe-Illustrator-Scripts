/*
  Auto Mirror Bleed

  Author: Mike Brady

  Description:
    This script automatically adds bleed around the selected objects.

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

#target illustrator

function main() {
  if(app.documents.length > 0) {
    var idoc = app.activeDocument
    var layers = idoc.selection;

    var length = layers.length;

    var bleedSize = prompt("Enter Bleed", .125, "Auto Mirror Bleed");

    //If user clicks the Cancel button
    if(bleedSize==null) {
      return;
    }

    bleedSize = parseFloat(bleedSize);
    if(isNaN(bleedSize)) {
      alert("Error: Input must be a number.");
      return;
    }

    //Convert inch input into points
    bleedSize *= 72;

    for(i=0;i<length;i++) {
      var image = layers[i];
      var parent = image.parent;

      var coords = image.geometricBounds;
      var xLeft = coords[0];
      var yTop = coords[1];
      var width = Math.abs(coords[2] - xLeft);
      var height = Math.abs(yTop - coords[3]);
      var newGroup = app.activeDocument.groupItems.add();
      newGroup.moveToBeginning(parent);
      newGroup.name = image.name;

      var bleedGroup = app.activeDocument.groupItems.add();
      bleedGroup.name = "bleed";

      bleedGroup.moveToBeginning(newGroup);
      image.moveToBeginning(newGroup);

      var bleedLayers = [];
      var bleedMasks = [];
      for(j=0;j<8;j++) {
        var vertical = '';
        var horizontal = '';

        var clipWidth = width;
        var clipHeight = height;

        if(j%3 == 0) {
          vertical = 'top-';
        } else if(j%3 == 1) {
          vertical = 'bottom-';
        }

        if(j<3) {
          horizontal = 'left-';
        } else if(j>4) {
          horizontal = 'right-';
        }
        var layerName = vertical + horizontal + "bleed"

        bleedLayers[j] = image.duplicate();

        var deltaY = 0;
        if(vertical != '') {
          clipHeight = bleedSize;
          bleedLayers[j].transform(app.getScaleMatrix(100,-100));
          if(vertical == 'top-') {
            deltaY = height;
          } else if(vertical == 'bottom-') {
            deltaY = height*-1;
          }
        }

        var deltaX = 0;
        if(horizontal != '') {
          clipWidth = bleedSize;
          bleedLayers[j].transform(app.getScaleMatrix(-100,100));
          if(horizontal == 'left-') {
            deltaX = width*-1;
          } else if(horizontal == 'right-') {
            deltaX = width;
          }
        }
        bleedLayers[j].transform(app.getTranslationMatrix(deltaX,deltaY));

        bleedMasks[j] = app.activeDocument.pathItems.rectangle(yTop,xLeft,clipWidth,clipHeight);
        if(deltaX < 0) {
          deltaX = bleedSize*-1;
        }
        if(deltaY > 0) {
          deltaY = bleedSize;
        }
        bleedMasks[j].transform(app.getTranslationMatrix(deltaX,deltaY));

        var rasterOpts = new RasterizeOptions;
        rasterOpts.antiAliasingMethod = AntiAliasingMethod.ARTOPTIMIZED;
        rasterOpts.resolution = objectResolution(image);
        bleedLayers[j] = idoc.rasterize(bleedLayers[j], bleedMasks[j].geometricBounds, rasterOpts);
        bleedLayers[j].name = layerName;
        bleedLayers[j].moveToBeginning(bleedGroup);

        bleedMasks[j].remove();
      }
    }
  }

  /*
    Source: https://aiscripts.com/image-crop-script/
  */
  function objectResolution(obj) {
      var resw = Math.abs(72/obj.matrix.mValueA); // thanks to Moluapple for this
      var resh = Math.abs(72/obj.matrix.mValueD);
      var objRes = Math.round((resw+resh)/2);

      return objRes;
  }
}

main();
