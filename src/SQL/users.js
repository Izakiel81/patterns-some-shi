import { UserDatabase } from "./userDatabase.js";

export let users = [];
let userId = 0;

  // Wait for SQL.js to initialize
  if (window.initSqlJs) {
    const SQL = await window.initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`,
    });
    window.SQL = SQL;
  }
  export const db = new UserDatabase();
  await db.init();


export class Logger {
  constructor() {
    if (!Logger.instance) Logger.instance = this;
    this.logs = [];
    return Logger.instance;
  }

  logAction(action, user) {
    const currentDate = new Date();
    const log = `${currentDate.toISOString()} - ${user.name} виконав дію: ${action}`;
    this.logs.push(log);
    console.log(log);
  }

  getLogs() {
    return this.logs;
  }
}

export const logger = new Logger();

export class User {
  #password;
  constructor(name, email, password, id = null) {
    this.id = id ?? userId++;
    this.name = name;
    this.email = email;
    this.#password = password;
    logger.logAction("створив користувача", this);
  }

  getInfo() {
    logger.logAction(`Надані дані про користувача`, this);
    return { id: this.id, name: this.name, email: this.email, role: this.getRole() };
  }

  getRole() { return "User"; }

  checkPassword(ex_pass) {
    logger.logAction("перевірив пароль", this);
    return this.#password === ex_pass;
  }

  changePassword(npass) {
    this.#password = npass;
    logger.logAction("змінив пароль", this);
  }

  getPassword() { return this.#password; }
}

export class Admin extends User {
  getRole() { return "Admin"; }

  deleteUser(user_t) {
    logger.logAction(`видалив користувача ${user_t.name}`, this);
    users = users.filter(u => u.id !== user_t.id);
  }

  resetPassword(user, newPassword) {
    logger.logAction(`скинув пароль користувачу ${user.name}`, this);
    if (user.checkPassword(newPassword)) return;
    user.changePassword(newPassword);
  }
}

export class Moderator extends User {
  constructor(name, email, password, id = null) {
    super(name, email, password, id);
    this.mutedUsers = new Map();
  }

  getRole() { return "Moderator"; }

  warnUser(user) {
    logger.logAction(`видав попередження користувачу ${user.name}`, this);
  }

  muteUser(user, duration) {
    const until = new Date(Date.now() + duration * 1000);
    this.mutedUsers.set(user.id, until);
    logger.logAction(`заблокував ${user.name} на ${duration} сек.`, this);
  }

  isMuted(user) {
    const until = this.mutedUsers.get(user.id);
    return until ? Date.now() < until : false;
  }
}

export class SuperAdmin extends Admin {
  getRole() { return "SuperAdmin"; }

  createUser(type, name, email, password) {
    const factory = new UserFactory();
    const newUser = factory.createUser(type, name, email, password);
    users.push(newUser);
    logger.logAction(`створив ${newUser.getRole()} ${name}`, this);
    if (newUser) {
      db.createUser({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.getRole(),
      });
    }
    return newUser;
  }
}

export class UserFactory {
  createUser(type, name, email, password, id = null) {
    switch (type) {
      case "User": return new User(name, email, password, id);
      case "Користувач": return new User(name, email, password, id);
      case "Admin": return new Admin(name, email, password, id);
      case "Адміністратор": return new Admin(name, email, password, id);
      case "Moderator": return new Moderator(name, email, password, id);
      case "Модератор": return new Moderator(name, email, password, id);
      case "SuperAdmin": return new SuperAdmin(name, email, password, id);
      case "Super Admin": return new SuperAdmin(name, email, password, id);
      case "Супер Адміністратор": return new SuperAdmin(name, email, password, id);
      default: throw new Error("Невідомий тип користувача.");
    }
  }
}
