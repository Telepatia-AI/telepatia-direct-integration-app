# Doctor Management - UZUI Integration

This document describes how to use the Doctor Management feature that integrates with the UZUI backend API.

## Overview

The Doctor Management screen allows institutional administrators to:
- View a list of doctors associated with their institution
- Create new doctor accounts with unique credentials
- Enable and disable doctor accounts
- Search and filter doctors by name, email, and status
- Navigate through paginated results

## Getting Started

### 1. API Key Setup

Before you can use the doctor management features, you need to provide a valid UZUI API key:

1. Open the Doctor Management page
2. You'll see an "UZUI API Key" input field at the top
3. Enter your institutional admin API key
4. Click "Connect" to authenticate and load doctor data

**Note:** The API key is stored locally in your browser for convenience and will be remembered between sessions.

### 2. Clearing the API Key

To remove a stored API key:
1. Click the "Clear" button next to the API key input
2. This will remove the key from local storage and clear all doctor data from the view

## Features

### Search and Filtering

- **Search**: Type in the search box to filter doctors by name or email address
  - Search is case-insensitive and matches partial strings
  - Results update automatically with a 300ms delay to reduce API calls

- **Status Filter**: Use the dropdown to filter by doctor status:
  - "All Status" - Shows all doctors
  - "Active" - Shows only enabled doctors
  - "Inactive" - Shows only disabled doctors

### Create New Doctor Account

**Creating a Doctor Account:**
1. Click the "Create Doctor" button in the blue card section
2. Fill out the required information:
   - **Email Address** (required): Must be unique and valid
   - **Password** (required): 6-50 characters long
   - **Medical Specialty** (required): Choose from dropdown list
   - **Full Name** (optional): Doctor's full name
   - **Institution Branch** (optional): Branch or department
3. Click "Create Account" to submit
4. Upon success, you'll see the new doctor's details including:
   - Unique Document ID
   - Email address
   - **API Key** - Save this securely as it won't be shown again!
5. The new doctor will immediately appear in your doctors list

**Important Notes:**
- Each doctor gets their own unique API key for system access
- API keys are shown only once during account creation
- Use the copy button to save the API key to clipboard
- The new account is automatically enabled upon creation

### Doctor Status Management

#### Enabling a Doctor
- Toggle the switch for an inactive doctor to the "on" position
- The change takes effect immediately without requiring a confirmation

#### Disabling a Doctor
- Toggle the switch for an active doctor to the "off" position  
- A modal will appear asking for a reason (required)
- Provide a reason between 5-500 characters
- Click "Disable Account" to confirm

### Pagination

- Navigate through results using the Previous/Next buttons
- View pagination info showing current range and total count
- Default page size is 20 doctors per page

### Real-time Updates

- Changes are applied optimistically (UI updates immediately)
- If an API call fails, the UI reverts to the previous state
- Error messages are displayed with retry options
- The list automatically refreshes after successful status changes

## Data Display

The doctor table shows:
- **Name**: Full name of the doctor (shows "—" if not provided)
- **Email**: Doctor's email address  
- **Specialties**: List of medical specialties (comma-separated)
- **Document ID**: Unique identifier for the doctor account
- **Status**: Current active/inactive status with color-coded badges
- **Created**: Date and time when the account was created
- **Actions**: Toggle switch to enable/disable the account

## API Integration Details

### Endpoints Used

1. **Create Doctor Account**: `POST /api/institutionals/accounts`
   - Creates new doctor accounts with email, password, and specialty
   - Returns unique document ID and API key for the new doctor
   - Supports optional fields like full name and branch information

2. **List Doctors**: `GET /api/institutionals/doctors`
   - Supports pagination with `page` and `limit` parameters
   - Supports filtering by `status` (active/inactive/all)
   - Client-side search is applied to the results

3. **Update Doctor Status**: `PUT /api/institutionals/accounts/{doctorId}/status`
   - Enables or disables doctor accounts
   - Requires a reason when disabling (minimum 5 characters)

### Authentication

- Uses Bearer token authentication with the provided API key
- API key should be from an institutional admin account
- Invalid keys will display appropriate error messages

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid API key" | Wrong or expired API key | Check your API key with your administrator |
| "Access forbidden" | Account lacks institutional permissions | Ensure you're using an institutional admin key |
| "No doctors found" | No doctors match current filters | Try adjusting your search/filter criteria |
| "Network error" | Connection issues | Check your internet connection and retry |

### Error Recovery

- All errors display with a "Retry" button
- Failed status changes automatically revert the UI state
- Network errors preserve your current view and filters

## Limitations

### Client-Side Search
- Search functionality is applied client-side to the current page of results
- This means search only covers doctors currently loaded (up to 20 per page)
- For comprehensive search across all doctors, you may need to remove filters and navigate pages

### Bulk Operations
- Bulk enable/disable operations are currently disabled
- Each doctor must be managed individually to ensure proper reason collection for disables

## Security Notes

- API keys are stored in browser localStorage for convenience
- Keys are never logged or displayed in error messages
- All API communications use HTTPS
- Use the "Clear" button to remove keys from shared computers

## Troubleshooting

### "API key is required" Error
- Ensure you've entered an API key in the input field
- Check that the key is not empty or just whitespace

### Doctors Not Loading
1. Verify your API key is correct
2. Check that you have institutional admin permissions
3. Try clicking the "Refresh" button
4. Check the browser console for additional error details

### Status Changes Not Working
1. Ensure you're not trying to change an account to its current status
2. When disabling, make sure you provide a reason of at least 5 characters
3. Check for network connectivity issues
4. Verify your API key hasn't expired

### Account Creation Issues
1. "Email already exists" - The email is already registered in the system
2. "Invalid password" - Password must be 6-50 characters long
3. Validation errors - Check all required fields are filled correctly
4. "Access forbidden" - Ensure you have institutional admin permissions

### Performance Issues
- Large institutions may experience slower loading times
- Use filters to narrow down results for better performance
- Search is debounced to prevent excessive API calls

## Support

For technical issues or questions about API access:
1. Check this documentation first
2. Review error messages for specific guidance
3. Contact your system administrator for API key issues
4. Report bugs to the development team
