const path = require('path');
const fs = require('fs').promises;

const deleteFile = async (filePath) => {
    try {

        await fs.unlink(filePath);
        console.log("File Deleted Successfully");




    }
    catch (err) {
        //if user id is not correct 
        console.log(err);


    }
}


module.exports = { deleteFile }