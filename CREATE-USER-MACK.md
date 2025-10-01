# 👤 Create User "mack" with Password "12345"

## 📋 User Details
- **Username:** mack
- **User ID:** 1001
- **Password:** 12345
- **Encrypted Password:** `rolif`
- **Access Level:** 1 (standard user)
- **Admin Level:** 0 (not admin)

## 🔐 Password Encryption
The password "12345" has been encrypted using the VBA-compatible algorithm:
- **Original:** `12345`
- **Encrypted:** `rolif`

## 🗄️ Database Setup

### Option 1: Run SQL Script (Recommended)
1. Open SQL Server Management Studio or your database client
2. Connect to your database
3. Run the SQL script: `scripts/create-user-mack.sql`

### Option 2: Manual SQL Command
Execute this SQL command in your database:

```sql
-- Check if user exists
IF EXISTS (SELECT 1 FROM USU WHERE ENTUSU = 1001)
BEGIN
    PRINT 'User already exists! Updating password...'
    UPDATE USU SET CONUSU = 'rolif' WHERE ENTUSU = 1001;
END
ELSE
BEGIN
    PRINT 'Creating new user...'
    INSERT INTO USU (ENTUSU, CONUSU, ACCUSU, ADMUSU, FEAUSU)
    VALUES (1001, 'rolif', 1, 0, GETDATE());
END

-- Verify the user
SELECT 
    ENTUSU as 'User ID',
    CONUSU as 'Encrypted Password',
    ACCUSU as 'Access Level',
    ADMUSU as 'Admin Level',
    FEAUSU as 'Created Date'
FROM USU 
WHERE ENTUSU = 1001;
```

## 🧪 Test the User

After creating the user, you can test the login:

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Go to the login page:**
   - Open: http://localhost:3000/login

3. **Login with:**
   - **User ID:** 1001
   - **Password:** 12345

## 🔧 Troubleshooting

### If the user already exists:
```sql
UPDATE USU SET CONUSU = 'rolif' WHERE ENTUSU = 1001;
```

### If you want to change the password:
1. Encrypt the new password:
   ```bash
   npm run encrypt-password <new_password>
   ```

2. Update the database:
   ```sql
   UPDATE USU SET CONUSU = '<encrypted_password>' WHERE ENTUSU = 1001;
   ```

### If you want to delete the user:
```sql
DELETE FROM USU WHERE ENTUSU = 1001;
```

## 📊 Database Schema Reference

The USU table structure:
```sql
CREATE TABLE USU (
    ENTUSU INT PRIMARY KEY,    -- User ID
    CONUSU NVARCHAR(50),       -- Encrypted password
    ACCUSU INT,                -- Access level
    ADMUSU INT,                -- Admin level
    FEAUSU DATETIME            -- Creation date
);
```

## ✅ Verification

After running the SQL, you should see:
- User ID: 1001
- Encrypted Password: rolif
- Access Level: 1
- Admin Level: 0
- Created Date: [current timestamp]

The user "mack" is now ready to use with password "12345"!
