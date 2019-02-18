/*
  Save PDFs

  Author: Mike Brady

  Description:
    This script automatically saves a proof quality and a print quality PDF of
    the open file

  Compatability:
    CS4, CS6, CC 2017, CC 2018, CC 2019
    Compatability with earlier versions untested.

  https://github.com/mike-brady/Adobe-Illustrator-Scripts
*/

#target illustrator

var pdfSaves = [
  {
    dest:       '../Production',
    pdfPreset:  '[High Quality Print]'
  },
  {
    dest:       '../Proofs',
    pdfPreset:  '[Smallest File Size]'
  }
];

function main() {
  if(app.documents.length > 0) {
    var idoc = app.activeDocument

    var fullName = idoc.fullName;
    var name = idoc.name;

    var docPath = idoc.path + '/';

    //Get filename without file extension
    var filename = name.substr(0, name.lastIndexOf('.')) || name;

    var options;
    for(var i=0; i<pdfSaves.length; i++) {
      options = new PDFSaveOptions();
      options.pDFPreset=pdfSaves[i]['pdfPreset'];
      save(idoc, docPath + pdfSaves[i]['dest'], filename, '.pdf', options);

      app.activeDocument.close();
      app.open(new File(fullName));
      idoc = app.activeDocument
    }

    alert('PDFs Saved');
  }

  function save(doc, dest, filename, ext, options) {
    // Create the folder if it doesn't exist
    var f = new Folder(dest);
    if(!f.exists) {
      f.create();
    }
    var file = new File(dest + '/' + filename + ext);

    //Check for write access rights
    if (file.open("w")) {
        file.close();
    }
    else {
        throw new Error('Access is denied');
    }

    doc.saveAs(file, options);
  }
}

main();
