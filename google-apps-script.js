// Google Apps Script for handling sign-up data
// This script creates a web app that can be called from your React app
// 
// IMPORTANT: The web app URL is now stored in config.js
// Current URL: https://script.google.com/macros/s/AKfycbwSP01NIVrsj-5ZDBXTh1Yc1GvJHIVNAUW2uC3i1wdDFZsQ29gr1RbiKtxt1DT6FB9F0w/exec
// 
// To update the URL:
// 1. Update the URL in config.js
// 2. Deploy the new version of this Google Apps Script
// 3. Copy the new web app URL and update config.js again

function doPost(e) {
  try {
    // Log the incoming request for debugging
    console.log('Received POST request');
    console.log('Content type:', e.postData.type);
    console.log('Content:', e.postData.contents);
    console.log('Parameters:', e.parameter);
    
    // Parse the incoming data - handle both JSON and form-encoded data
    let data;
    
    if (e.postData.type === 'application/json') {
      // Handle JSON data
      data = JSON.parse(e.postData.contents);
      console.log('Parsed JSON data:', data);
    } else if (e.postData.type === 'application/x-www-form-urlencoded') {
      // Handle form-encoded data
      const params = e.parameter;
      data = {
        email: params.email || '',
        resumesPerRole: params.resumesPerRole || '',
        jobRolesPerMonth: params.jobRolesPerMonth || '',
        painLevel: params.painLevel || '',
        frustration: params.frustration || ''
      };
      console.log('Parsed form data:', data);
    } else {
      // Try to parse as JSON anyway (fallback)
      try {
        data = JSON.parse(e.postData.contents);
        console.log('Parsed fallback JSON data:', data);
      } catch (parseError) {
        throw new Error('Unable to parse request data: ' + e.postData.contents);
      }
    }
    
    // Get the active spreadsheet (this will be created when you run setup)
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    console.log('Spreadsheet ID:', spreadsheet.getId());
    console.log('Spreadsheet URL:', spreadsheet.getUrl());
    
    const sheet = spreadsheet.getSheetByName('Signups') || spreadsheet.getActiveSheet();
    console.log('Sheet name:', sheet.getName());
    console.log('Current row count:', sheet.getLastRow());
    
    // Create headers if they don't exist
    if (sheet.getLastRow() === 0) {
      console.log('Creating headers...');
      sheet.getRange(1, 1, 1, 6).setValues([['Timestamp', 'Email', 'Resumes Per Role', 'Job Roles Per Month', 'Pain Level', 'Frustration']]);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
      sheet.getRange(1, 1, 1, 6).setBackground('#4285f4');
      sheet.getRange(1, 1, 1, 6).setFontColor('white');
      console.log('Headers created successfully');
    }
    
    // Check if email already exists in the sheet
    const emailColumn = 2; // Column B (Email)
    let existingRow = -1;
    
    // Only check for existing emails if there are data rows (more than just headers)
    if (sheet.getLastRow() > 1) {
      const emailRange = sheet.getRange(2, emailColumn, sheet.getLastRow() - 1, 1); // Skip header row
      const emailValues = emailRange.getValues();
      
      for (let i = 0; i < emailValues.length; i++) {
        if (emailValues[i][0] === data.email) {
          existingRow = i + 2; // +2 because we start from row 2 and i is 0-based
          break;
        }
      }
    }
    
    if (existingRow > 0) {
      // Email exists, update the existing row
      console.log('Email found in existing row:', existingRow);
      
      // Update only the questionnaire fields (columns 3-6)
      const updateData = [
        data.resumesPerRole || '',
        data.jobRolesPerMonth || '',
        data.painLevel || '',
        data.frustration || ''
      ];
      
      sheet.getRange(existingRow, 3, 1, 4).setValues([updateData]);
      console.log('Updated existing row with questionnaire data');
      
      // Return success response for update
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          message: 'Questionnaire data updated successfully',
          action: 'updated',
          row: existingRow
        }))
        .setMimeType(ContentService.MimeType.JSON);
        
    } else {
      // Email doesn't exist, create new row
      console.log('Creating new row for email:', data.email);
      
      // Prepare the row data
      const timestamp = new Date().toISOString();
      const rowData = [
        timestamp,
        data.email || '',
        data.resumesPerRole || '',
        data.jobRolesPerMonth || '',
        data.painLevel || '',
        data.frustration || ''
      ];
      
      console.log('Prepared row data:', rowData);
      
      // Add the data to the next available row
      const nextRow = sheet.getLastRow() + 1;
      console.log('Adding data to row:', nextRow);
      sheet.getRange(nextRow, 1, 1, 6).setValues([rowData]);
      console.log('Data added successfully');
      
      // Auto-resize columns for better readability
      sheet.autoResizeColumns(1, 6);
      console.log('Columns auto-resized');
      
      // Force spreadsheet refresh to ensure data is saved
      SpreadsheetApp.flush();
      console.log('Spreadsheet flushed');
      
      // Return success response for new entry
      return ContentService
        .createTextOutput(JSON.stringify({ 
          success: true, 
          message: 'Data saved successfully',
          action: 'created',
          timestamp: timestamp,
          row: nextRow
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString(),
        message: 'Failed to save data' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (for testing)
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'Google Apps Script is running',
      message: 'Use POST to submit sign-up data'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function setup() {
  // This function sets up the spreadsheet with proper formatting
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getActiveSheet();
  
  // Set sheet name
  sheet.setName('Signups');
  
  // Create headers
  const headers = ['Timestamp', 'Email', 'Resumes Per Role', 'Job Roles Per Month', 'Pain Level', 'Frustration'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Format headers
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setHorizontalAlignment('center');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, headers.length);
  
  // Freeze the header row
  sheet.setFrozenRows(1);
  
  // Add some protection to prevent accidental deletion
  const protection = sheet.protect();
  protection.setDescription('Protected sheet - do not delete');
  protection.setWarningOnly(true);
  
  console.log('Setup completed successfully!');
  console.log('Spreadsheet ID:', spreadsheet.getId());
  console.log('Spreadsheet URL:', spreadsheet.getUrl());
}
