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

var idoc;
var selectedLayers;

function main() {
  if(app.documents.length > 0) {
    idoc = app.activeDocument
    selectedLayers = idoc.selection;

    var dlg = createDialog();
    dlg.show();
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

  function createDialog() {
    var spacing = 4;

    var dlg = new Window('dialog', 'Auto Mirror Bleed');
    dlg.orientation = 'column';
    dlg.alignChildren = 'left';
    dlg.spacing = spacing;

    dlg.bleedLocPnl = dlg.add('panel', undefined, undefined);

    dlg.bleedLocPnl.bleedTopCb = dlg.bleedLocPnl.add('checkbox', undefined, undefined);
    dlg.bleedLocPnl.bleedTopCb.value = true;

    dlg.bleedLocPnl.grp1 = dlg.bleedLocPnl.add('group', undefined, undefined);
    dlg.bleedLocPnl.grp1.orientation = 'row';

    dlg.bleedLocPnl.grp1.bleedLeftCb = dlg.bleedLocPnl.grp1.add('checkbox', undefined, undefined);
    dlg.bleedLocPnl.grp1.bleedLeftCb.value = true;

    dlg.bleedLocPnl.grp1.bleedGrp = dlg.bleedLocPnl.grp1.add('group', undefined, undefined);
    dlg.bleedLocPnl.grp1.bleedGrp.size = [85,81];
    dlg.bleedLocPnl.grp1.bleedGrp.margins = [10, 0, 10, 0];
    dlg.bleedLocPnl.grp1.bleedGrp.orientation = 'row';
    dlg.bleedLocPnl.grp1.bleedGrp.spacing = 2;
    dlg.bleedLocPnl.grp1.bleedGrp.bleedEt = dlg.bleedLocPnl.grp1.bleedGrp.add('edittext {text: \'.125"\', justify: "right"}', undefined, '.125"');
    dlg.bleedLocPnl.grp1.bleedGrp.bleedEt.size = [65,18];
    dlg.bleedLocPnl.grp1.bleedGrp.bleedEt.addEventListener('focus',function(e) { bleedFocus(e); }, false);
    dlg.bleedLocPnl.grp1.bleedGrp.bleedEt.addEventListener('blur',function(e) { bleedBlur(e); }, false);
    dlg.bleedLocPnl.grp1.bleedGrp.bleedEt.addEventListener ('keydown', function (e) { enterKeyPressed(e); }, false);

    dlg.bleedLocPnl.grp1.bleedRightCb = dlg.bleedLocPnl.grp1.add('checkbox', undefined, undefined);
    dlg.bleedLocPnl.grp1.bleedRightCb.value = true;

    dlg.bleedLocPnl.bleedBottomCb = dlg.bleedLocPnl.add('checkbox', undefined, undefined);
    dlg.bleedLocPnl.bleedBottomCb.value = true;

    dlg.grp2 = dlg.add('group', undefined, undefined);
    dlg.grp2.orientation = 'row';

    dlg.grp2.addBtn = dlg.grp2.add('button', undefined, 'Cancel');
    dlg.grp2.addBtn.onClick = function() { dlg.close(); };

    dlg.grp2.addBtn = dlg.grp2.add('button', undefined, 'Add Bleed');
    dlg.grp2.addBtn.onClick = addBleed;


    dlg.bleedLocPnl.grp1.bleedGrp.bleedEt.active = true;

    return dlg;
  }

  function bleedFocus(event) {
    event.target.text = removeUnit(event.target.text);
  }

  function bleedBlur(event) {
    if(isNaN(event.target.text)) {
      event.target.text = '';
    } else {
      event.target.text = addUnit(event.target.text);
    }
  }

  function addUnit(str) {
    return removeUnit(str) + '"';
  }

  function removeUnit(str) {
    return str.match(/^[0-9]*\.?[0-9]*/)[0];
  }

  function getIndex(item, parent) {
    for(var i=0; i<parent.groupItems; i++) {
      if(parent.groupItems.index(i) == item) {
        return i;
      }
    }

    return 99999;
  }

  function enterKeyPressed (e) {
    if(e.keyName === "Enter"){
      addBleed();
    }
  }

  function addBleed() {
    bleedSize = parseFloat(removeUnit(dlg.bleedLocPnl.grp1.bleedGrp.bleedEt.text));

    //Convert inch input into points
    bleedSize *= 72;

    for(i=0;i<selectedLayers.length;i++) {
      var image = selectedLayers[i];
      var parent = image.layer;

      var coords = image.geometricBounds;
      var xLeft = coords[0];
      var yTop = coords[1];
      var width = Math.abs(coords[2] - xLeft);
      var height = Math.abs(yTop - coords[3]);
      var newGroup = app.activeDocument.groupItems.add();
      newGroup.move(image, ElementPlacement.PLACEAFTER);
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
          //Only add top bleed if checkbox is checked
          if(dlg.bleedLocPnl.bleedTopCb.value == false) {
            continue;
          }
          vertical = 'top-';
        } else if(j%3 == 1) {
          //Only add bottom bleed if checkbox is checked
          if(dlg.bleedLocPnl.bleedBottomCb.value == false) {
            continue;
          }
          vertical = 'bottom-';
        }

        if(j<3) {
          //Only add left bleed if checkbox is checked
          if(dlg.bleedLocPnl.grp1.bleedLeftCb.value == false) {
            continue;
          }
          horizontal = 'left-';
        } else if(j>4) {
          //Only add right bleed if checkbox is checked
          if(dlg.bleedLocPnl.grp1.bleedRightCb.value == false) {
            continue;
          }
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
    dlg.close();
  }
}

main();
