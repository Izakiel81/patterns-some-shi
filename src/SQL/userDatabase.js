// userDatabase.js
let instance = null;

export class UserDatabase {
  constructor() {
    if (instance) return instance; // ensure singleton
    instance = this;
    this.db = null;
    this.users = [];
    this.useSQLite = false;
    this.localKey = "users_backup";
  }

  async init() {
    // Wait up to 10 seconds for SQL.js to load
    const waitForSQL = async (timeoutMs = 10000, intervalMs = 200) => {
      const start = Date.now();
      while (!window.initSqlJs && Date.now() - start < timeoutMs) {
        await new Promise((r) => setTimeout(r, intervalMs));
      }
      if (!window.initSqlJs) {
        throw new Error("SQL.js failed to load within timeout");
      }
    };

    try {
      await waitForSQL();
      const SQL = await window.initSqlJs({
        locateFile: (file) =>
          `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`,
      });
      window.SQL = SQL;
    } catch (err) {
      console.warn("WARN: SQL.js not available:", err);
    }

    // Try SQLite
    if (window.SQL) {
      try {
        this.db = new window.SQL.Database();
        this.db.run(
          "CREATE TABLE IF NOT EXISTS users (id TEXT, name TEXT, email TEXT, role TEXT)",
        );
        console.log("SUCCESS: Using SQLite in-memory database");
        this.useSQLite = true;
      } catch (e) {
        console.warn("SQLite initialization failed:", e);
        this.useSQLite = false;
      }
    }

    // Load from localStorage or fallback JSON
    await this.loadFromStorage();
  }

  async loadFromStorage() {
    const saved = localStorage.getItem(this.localKey);

    if (saved) {
      // Load from localStorage backup
      console.log("Loaded users from localStorage backup");
      this.users = JSON.parse(saved);
    } else {
      // Load from JSON file (first time only)
      console.log("Loading users from users.json...");
      try {
        const response = await fetch("users.json");
        this.users = await response.json();
        this.saveToLocal();
      } catch (e) {
        console.warn("No users.json found or failed to load:", e);
        this.users = [];
      }
    }

    // Sync data to SQL if available
    if (this.useSQLite) {
      this.db.run("DELETE FROM users");
      for (const u of this.users) {
        this.db.run("INSERT INTO users VALUES (?, ?, ?, ?)", [
          u.id,
          u.name,
          u.email,
          u.role,
        ]);
      }
    }
  }

  getAllUsers() {
    if (this.useSQLite) {
      const stmt = this.db.prepare("SELECT * FROM users");
      const result = [];
      while (stmt.step()) result.push(stmt.getAsObject());
      stmt.free();
      this.users = result;
      return result;
    }
    return this.users;
  }

  saveToLocal() {
    const data = this.getAllUsers();
    localStorage.setItem(this.localKey, JSON.stringify(data));
    this.saveToJSONFile(data);
  }

  saveToJSONFile(data) {
    // This works only for user download or debugging
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.json";
    a.style.display = "none";
    document.body.appendChild(a);
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async createUser(user) {
    const all = this.getAllUsers();

    // Duplicate email check
    const existing = all.find((u) => u.email === user.email);
    if (existing) {
      console.warn(
        `WARN: User with email "${user.email}" already exists (ID: ${existing.id})`,
      );
      // Save and refresh table
      this.saveToLocal();
      this.refreshTable();
      return; // Stop creation
    }

    // Compute next ID
    const nextId =
      all.length > 0 ? Math.max(...all.map((u) => Number(u.id) || 0)) + 1 : 1;

    const newUser = {
      id: nextId,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Insert into SQLite or JSON backup
    if (this.useSQLite) {
      try {
        this.db.run(
          "INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)",
          [newUser.id, newUser.name, newUser.email, newUser.role],
        );
        console.log(`SUCCESS: Added user to SQLite: ${newUser.name}`);
      } catch (err) {
        console.error("SQLite insert error:", err);
      }
    } else {
      this.users.push(newUser);
      console.log(`SUCCESS: Added user to JSON: ${newUser.name}`);
    }

    // Save and refresh table
    this.saveToLocal();
    this.refreshTable();
  }

  async deleteAllUsers() {
    if (this.useSQLite) {
      try {
        this.db.run("DELETE FROM users");
        console.log("All users deleted from SQLite");
      } catch (err) {
        console.error("SQLite delete error:", err);
      }
    } else {
      // Leftover
      this.users = [];
      console.log("All users deleted from JSON");
    }

    this.saveToLocal();
    this.refreshTable();
  }

  searchUser(query) {
    const all = this.getAllUsers();
    return all.filter(
      (u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        u.role.toLowerCase().includes(query.toLowerCase()),
    );
  }

  refreshTable() {
    const users = this.getAllUsers();
    const tbody = document.getElementById("userTableBody");
    if (!tbody) return;
    tbody.innerHTML = users
      .map(
        (u) => `
        <tr>
          <td>${u.id}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
        </tr>`,
      )
      .join("");
  }
}

