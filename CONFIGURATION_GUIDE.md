# Configuration Guide

## Google Apps Script URL Management

The Google Apps Script web app URL is now centrally managed in `config.js` instead of being hardcoded throughout the application.

### Current Configuration

- **File**: `config.js`
- **Variable**: `GOOGLE_SCRIPT_URL`
- **Current Value**: The Google Apps Script web app URL for handling sign-up data

### How to Update the URL

1. **Update Google Apps Script**:
   - Make changes to `google-apps-script.js`
   - Deploy as a new version in Google Apps Script
   - Copy the new web app URL

2. **Update Configuration**:
   - Open `config.js`
   - Replace the `GOOGLE_SCRIPT_URL` value with the new URL
   - Save the file

3. **Update Documentation**:
   - Update the URL in `google-apps-script.js` comments
   - Update this guide if needed

### Benefits of This Approach

- ✅ **Centralized Management**: URL is stored in one place
- ✅ **Easy Updates**: No need to search and replace throughout code
- ✅ **Version Control**: Configuration changes are tracked in git
- ✅ **Team Collaboration**: Clear where to make URL changes
- ✅ **Documentation**: Self-documenting configuration

### Files Modified

- `config.js` - New configuration file
- `src/App.js` - Updated to use config instead of hardcoded URL
- `google-apps-script.js` - Added documentation about URL management

### Security Notes

- The `config.js` file is committed to version control
- For production deployments, consider using environment variables
- The current approach is suitable for development and staging environments
