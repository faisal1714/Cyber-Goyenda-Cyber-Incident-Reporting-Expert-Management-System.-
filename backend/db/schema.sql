-- =========================================================
-- Cyber Goyenda - An Intelligent Cyber Incident Reporting
-- and Expert Management System
-- Database Schema (MySQL) - rebuilt for the Node/Express/JWT stack
-- =========================================================

CREATE DATABASE IF NOT EXISTS cyber_goyenda_app
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE cyber_goyenda_app;

-- ---------------------------------------------------------
-- users : people who report cyber incidents
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NULL,       -- bcrypt hash; NULL for Google-only accounts
  google_id VARCHAR(255) NULL UNIQUE, -- Google "sub" claim, set for Google Sign-In accounts
  role ENUM('user') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- admins : system administrators
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,   -- bcrypt hash
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- experts : cybersecurity specialists available for assignment
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS experts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL
);

-- ---------------------------------------------------------
-- incident_templates : predefined incident categories used
-- for automatic keyword-based matching
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS incident_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  keywords TEXT NOT NULL,
  description TEXT NOT NULL
);

-- ---------------------------------------------------------
-- user_incidents : incidents reported by users
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_incidents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  type VARCHAR(50),
  severity VARCHAR(20),
  description TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  matched_template_id INT NULL,
  status ENUM('matched','expert_request') DEFAULT 'expert_request',
  expert_name VARCHAR(100) DEFAULT NULL,
  admin_status ENUM('pending','assigned','completed') DEFAULT 'pending',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (matched_template_id) REFERENCES incident_templates(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------
-- expert_requests : requests for expert assistance
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS expert_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  incident_id INT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  business_name VARCHAR(150) DEFAULT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending','approved','rejected','assigned') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES user_incidents(id) ON DELETE SET NULL
);

-- ---------------------------------------------------------
-- Seed data: incident templates (kept identical to the
-- original DBMS project so matching behaviour is unchanged)
-- ---------------------------------------------------------
INSERT INTO incident_templates (type, severity, keywords, description) VALUES
('DDoS', 'High', 'website down,site down,slow,timeout,not loading', 'Distributed Denial of Service attack detected'),
('Phishing', 'Medium', 'fake login,email scam,otp,email link,suspicious mail', 'Phishing attack targeting user credentials'),
('Malware', 'High', 'virus,trojan,ransomware,file encrypted,unknown app', 'Malicious software detected'),
('Unauthorized Access', 'Critical', 'password reset,login attempt,unknown login,hacked', 'Unauthorized access detected'),
('SQL Injection', 'High', 'sql injection,error 500,db error,query failed', 'SQL Injection attack detected on web application'),
('Cross-Site Scripting', 'Medium', 'xss,suspicious script,alert popup', 'XSS attack detected on user inputs'),
('Brute Force', 'High', 'too many login attempts,password guess,lockout', 'Brute force login attempts detected'),
('Ransomware', 'Critical', 'file encrypted,ransom note,unlock key', 'Ransomware detected on user system'),
('Phishing SMS', 'Medium', 'sms scam,otp request,bank link', 'SMS-based phishing attack detected'),
('Malicious Email Attachment', 'High', 'attachment virus,email infected', 'Email attachment containing malware detected'),
('Unknown', 'Unknown', '', 'User does not know the incident type');

-- ---------------------------------------------------------
-- Seed data: cyber experts
-- ---------------------------------------------------------
INSERT INTO experts (name, specialization) VALUES
('Cyber Analyst', 'General incident triage'),
('Network Security Expert', 'DDoS / Network attacks'),
('Forensic Specialist', 'Unauthorized access / breach forensics'),
('Malware Analyst', 'Malware / Ransomware');

-- NOTE: The default admin account is created by `npm run seed`
-- (backend/db/seed.js), not here, so its password is properly
-- bcrypt-hashed instead of stored in plain SQL.

