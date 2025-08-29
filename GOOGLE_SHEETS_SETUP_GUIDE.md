# Google Sheets Integration Setup Guide

## 🚀 Complete Setup Instructions

### Step 1: Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheetsheets.google.com
3. Name it "Resume Screening Signups" (or any name you prefer)
4. **Save the Spreadsheet ID** from the URL: `https://docs.google.com/spreadsheets/d/126R0H3jlClA263Pz0qtZvGau_GuExYuNB4hYzq4Wk_I/edit`

### Step 2: Set up Google Apps Script
1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete any existing code in the editor
3. Copy and paste the entire content from `google-apps-script.js` file
4. Click **Save** (give it a name like "Signup Handler")
5. Click **Deploy** → **New deployment**
6. Choose **Web app** as the type
7. Set **Execute as**: "Me"
8. Set **Who has access**: "Anyone"
9. Click **Deploy**
10. **Copy the Web App URL** that appears

### Step 3: Update React App
1. Open `src/App.js`
2. Find the line: `'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'`
3. Replace it with your actual Google Apps Script Web App URL from Step 2

### Step 4: Test the Integration
1. Run your React app
2. Fill out the sign-up form
3. Check your Google Sheet - you should see the data appear in a new row

## 🔒 Security Features Built-In

✅ **Data Protection**: Sheet is protected against accidental deletion
✅ **Error Handling**: App continues to work even if Google Sheets fails
✅ **Backup**: All data is automatically timestamped
✅ **Validation**: Data is properly formatted and validated

## 📊 Data Structure

Your Google Sheet will have these columns:
- **Timestamp**: When the signup occurred
- **Email**: User's email address
- **Resumes Per Role**: How many resumes they check per role
- **Job Roles Per Month**: How many roles they handle monthly
- **Pain Level**: How painful resume screening is (1-5)
- **Frustration**: Optional text about their biggest frustration

## 🛠️ Troubleshooting

### If data isn't saving:
1. Check the browser console for errors
2. Verify your Google Apps Script URL is correct
3. Make sure your Google Apps Script is deployed as a web app
4. Check that "Anyone" has access to the web app

### If you get CORS errors:
1. Make sure your Google Apps Script is deployed as a web app
2. Verify the deployment settings are correct

### To view your data:
1. Open your Google Sheet
2. Data will appear in the "Signups" sheet
3. Each new signup creates a new row

## 📈 Analytics

You can now:
- Track signup trends over time
- Export data to other tools
- Create charts and reports
- Filter and sort signups by various criteria

## 🔄 Updating the Integration

If you need to modify the data structure:
1. Update the Google Apps Script code
2. Redeploy the web app
3. Update the React app if needed

## 📞 Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all URLs and IDs are correct
3. Test the Google Apps Script directly in the Apps Script editor

---

**Your data is now safely stored in Google Sheets and protected against accidental deletion!** 🎉
