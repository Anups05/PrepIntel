const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Create a pool without specifying database (for initial setup)
const createInitPool = () => {
  return mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
};

// Create the main pool with the database specified
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'prepintel_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database, tables, and seed admin
const initDB = async () => {
  const initPool = createInitPool();
  try {
    // Create database
    await initPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'prepintel_db'}\``);
    console.log('✅ Database ensured.');

    await initPool.end();

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        desired_batch ENUM('JEE Advanced', 'JEE Main', 'NEET', 'CET') NOT NULL,
        role ENUM('student', 'admin') DEFAULT 'student',
        avatar_initials VARCHAR(5),
        phone VARCHAR(20) DEFAULT '',
        location VARCHAR(100) DEFAULT '',
        display_name VARCHAR(100) DEFAULT '',
        target_exam VARCHAR(100) DEFAULT '',
        streak INT DEFAULT 0,
        tests_taken INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'SUPER-ADMIN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables ensured.');

    // Create tests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        test_type VARCHAR(50) NOT NULL,
        test_date DATE NOT NULL,
        duration INT NOT NULL,
        total_questions INT DEFAULT 0,
        total_marks INT DEFAULT 0,
        assigned_batches VARCHAR(500) DEFAULT '',
        instructions TEXT,
        status ENUM('Scheduled', 'Active', 'Completed') DEFAULT 'Scheduled',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create questions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_id INT NOT NULL,
        question_text TEXT NOT NULL,
        option_a VARCHAR(500) NOT NULL,
        option_b VARCHAR(500) NOT NULL,
        option_c VARCHAR(500) NOT NULL,
        option_d VARCHAR(500) NOT NULL,
        answer VARCHAR(1) NOT NULL,
        difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
        subject VARCHAR(100) DEFAULT '',
        topic VARCHAR(100) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Tests & Questions tables ensured.');

    // Create test_attempts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS test_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        test_id INT NOT NULL,
        score INT DEFAULT 0,
        total_marks INT DEFAULT 0,
        correct_count INT DEFAULT 0,
        incorrect_count INT DEFAULT 0,
        unattempted_count INT DEFAULT 0,
        time_taken INT DEFAULT 0,
        attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_attempt (user_id, test_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Test Attempts table ensured.');

    // Create question_responses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS question_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        test_id INT NOT NULL,
        question_id INT NOT NULL,
        selected_answer VARCHAR(2) DEFAULT NULL,
        correct_answer VARCHAR(2) NOT NULL,
        is_correct TINYINT(1) DEFAULT 0,
        is_attempted TINYINT(1) DEFAULT 0,
        is_revisited TINYINT(1) DEFAULT 0,
        time_taken_seconds INT DEFAULT 0,
        difficulty VARCHAR(20) DEFAULT 'Medium',
        subject VARCHAR(100) DEFAULT '',
        responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Question Responses table ensured.');

    // Seed default admin if not exists
    const [existingAdmin] = await pool.query('SELECT id FROM admins WHERE email = ?', ['admin@gmail.com']);
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await pool.query(
        'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@gmail.com', hashedPassword, 'SUPER-ADMIN']
      );
      console.log('✅ Default admin seeded (admin@gmail.com / Admin@123).');
    } else {
      console.log('ℹ️  Admin already exists, skipping seed.');
    }

    console.log('🚀 Database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = { pool, initDB };
