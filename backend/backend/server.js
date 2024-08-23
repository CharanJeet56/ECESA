const express = require('express');
const mysql = require('mysql');
const fs = require('fs-extra');
const path = require('path');
const app = express();
const port = 3000;

// Create a database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ch1@charan',
    database: 'college'
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

// Route to download the R22 Syllabus PDF
app.get('/download/r22-syllabus', (req, res) => {
    // Query the database to retrieve the PDF file data
    const query = 'SELECT file_data FROM pdf_files WHERE file_name = ?';
    connection.query(query, ['R22-Syllabus.pdf'], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).send('Internal server error');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('File not found');
            return;
        }
        // Save the PDF file data to a temporary file
        const fileData = results[0].file_data;
        const tempFilePath = path.join(__dirname, 'temp', 'R22-Syllabus.pdf');
        fs.writeFile(tempFilePath, fileData, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                res.status(500).send('Internal server error');
                return;
            }
            // Send the PDF file as the response
            res.download(tempFilePath, 'R22-Syllabus.pdf', (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                    res.status(500).send('Internal server error');
                    return;
                }
                // Delete the temporary file after it has been sent
                fs.unlink(tempFilePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    }
                });
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
