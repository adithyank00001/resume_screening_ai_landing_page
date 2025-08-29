# Google Sheets Integration Troubleshooting Guide

## 🚨 Common Issues and Solutions

### Issue 1: Data Not Appearing in Google Sheets

**Symptoms:**
- Success alert shows but no data in spreadsheet
- Console shows no errors
- Form submission appears to work

**Possible Causes & Solutions:**

#### 1.1 CORS Issues
**Problem:** Browser blocks the request due to CORS policy
**Solution:** 
- Open `test-integration.html` in your browser
- Test both JSON and Form Data methods
- Check browser console for CORS errors

#### 1.2 Google Apps Script Not Deployed
**Problem:** The script URL is invalid or not deployed
**Solution:**
1. Go to your Google Sheet
2. Click **Extensions** → **Apps Script**
3. Click **Deploy** → **Manage deployments**
4. Make sure you have an active deployment
5. Copy the correct Web App URL

#### 1.3 Wrong Spreadsheet
**Problem:** Script is saving to wrong spreadsheet
**Solution:**
1. In Apps Script, make sure you're in the correct project
2. Check that `SpreadsheetApp.getActiveSpreadsheet()` refers to the right sheet
3. Run the `setup()` function in Apps Script to verify

#### 1.4 Permissions Issues
**Problem:** Script doesn't have permission to write to spreadsheet
**Solution:**
1. In Apps Script deployment, set "Execute as" to "Me"
2. Set "Who has access" to "Anyone"
3. Authorize the script when prompted

### Issue 2: Console Errors

**Common Error Messages:**

#### 2.1 "Failed to fetch"
**Solution:** Check your internet connection and script URL

#### 2.2 "CORS policy" errors
**Solution:** Use the Form Data method instead of JSON

#### 2.3 "Script not found" errors
**Solution:** Redeploy your Google Apps Script

### Issue 3: Data Format Issues

**Problem:** Data appears but is malformed
**Solution:** Check the Google Apps Script logs

## 🔧 Step-by-Step Debugging

### Step 1: Test the Integration
1. Open `test-integration.html` in your browser
2. Fill out the form with test data
3. Click "Test JSON Method" and "Test Form Data Method"
4. Check the results

### Step 2: Check Google Apps Script Logs
1. Go to your Google Apps Script project
2. Click **Executions** in the left sidebar
3. Look for recent executions
4. Check the logs for any errors

### Step 3: Verify Spreadsheet Setup
1. Open your Google Sheet
2. Check if the "Signups" sheet exists
3. Look for headers: Timestamp, Email, Resumes Per Role, etc.
4. Check if data is being added to new rows

### Step 4: Test Manual Execution
1. In Google Apps Script, click the **Run** button
2. Select the `setup()` function
3. Check if it runs without errors
4. Verify the spreadsheet is properly formatted

## 🛠️ Quick Fixes

### Fix 1: Redeploy the Script
```javascript
// In Google Apps Script:
// 1. Click Deploy → Manage deployments
// 2. Click the pencil icon to edit
// 3. Click Deploy
// 4. Copy the new URL
// 5. Update your React app
```

### Fix 2: Update React App URL
```javascript
// In src/App.js, update this line:
const GOOGLE_SCRIPT_URL = 'YOUR_NEW_SCRIPT_URL_HERE';
```

### Fix 3: Force Refresh
```javascript
// Add this to your Google Apps Script doPost function:
function doPost(e) {
  try {
    // ... existing code ...
    
    // Force spreadsheet refresh
    SpreadsheetApp.flush();
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Data saved successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // ... error handling ...
  }
}
```

## 📊 Monitoring and Verification

### Check if Data is Being Received
1. Open browser developer tools (F12)
2. Go to Network tab
3. Submit the form
4. Look for the request to your Google Apps Script URL
5. Check the response

### Verify Google Apps Script Execution
1. In Google Apps Script, go to **Executions**
2. Look for recent executions
3. Check execution time and status
4. View logs for any errors

### Test Different Data Formats
The updated code now supports both:
- JSON format (preferred)
- Form-encoded format (fallback)

## 🚀 Advanced Debugging

### Enable Detailed Logging
The updated Google Apps Script includes detailed logging:
- Request content type
- Parsed data
- Spreadsheet operations
- Success/error messages

### Test with Different Browsers
- Chrome
- Firefox
- Safari
- Edge

### Check Network Conditions
- Test on different networks
- Check if corporate firewall blocks requests
- Verify no proxy interference

## 📞 Getting Help

If you're still having issues:

1. **Check the test page:** Use `test-integration.html` to isolate the problem
2. **Review logs:** Check both browser console and Google Apps Script logs
3. **Verify setup:** Ensure all steps in the setup guide were followed
4. **Test manually:** Try the Google Apps Script directly

## 🔄 Common Workarounds

### If CORS is blocking requests:
- Use the Form Data method (already implemented)
- Consider using a proxy service
- Deploy to a different domain

### If Google Apps Script is slow:
- Add timeout handling in React app
- Implement retry logic
- Consider caching responses

### If data is inconsistent:
- Add validation in Google Apps Script
- Implement data sanitization
- Add error recovery mechanisms

---

**Remember:** The most common issue is incorrect deployment or URL. Always test with the `test-integration.html` file first!
