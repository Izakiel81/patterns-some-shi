import { users, SuperAdmin, UserFactory, db } from "./users.js";

export async function initApp() {
  const factory = new UserFactory();

  // Load users from DB
  db.getAllUsers().forEach((u) => {
    const newUser = factory.createUser(
      u.role,
      u.name,
      u.email,
      u.password,
      u.id,
    );
    users.push(newUser);
  });

  console.log(
    "SUCCESS: Loaded users:",
    users.map((u) => u.getInfo()),
  );

  // Example: Create a user via SuperAdmin
  const superAdmin = users.find((u) => u instanceof SuperAdmin);
  if (superAdmin) {
    const admin1 = superAdmin.createUser(
      "Admin",
      "Андрій",
      "andriy@admin.com",
      "adminpass",
    );
    await db.createUser({
      id: admin1.id,
      name: admin1.name,
      email: admin1.email,
      password: admin1.getPassword(),
      role: admin1.getRole(),
    });
  }

  // UI handlers
  document
    .getElementById("newUserForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.target;
      const newUser = {
        name: form.name.value,
        email: form.email.value,
        role: form.role.value,
      };
      await db.createUser(newUser);
      form.reset();
    });

  document
    .getElementById("deleteAllUsersBtn")
    .addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete all users?"))
        await db.deleteAllUsers();
    });

  document.getElementById("searchUser").addEventListener("input", (e) => {
    const results = db.searchUser(e.target.value);
    const output = results
      .map((u) => `${u.id} ${u.name} ${u.email} ${u.role}`)
      .join("\n");
    document.getElementById("searchUserResult").textContent = output;
  });

  db.refreshTable();
}

