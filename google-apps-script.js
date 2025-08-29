// Google Apps Script for handling sign-up data
// This script creates a web app that can be called from your React app

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
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Data saved successfully',
        timestamp: timestamp,
        row: nextRow
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
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
