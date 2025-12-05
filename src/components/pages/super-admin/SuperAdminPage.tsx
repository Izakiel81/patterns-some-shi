import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const SuperAdminPage = () => {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
  ]);

  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    email: "",
    role: "user",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = (id: number) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  const handleEdit = (user: User) => {
    setFormData(user);
    setIsEditing(true);
  };

  const handleSubmit = () => {
    if (isEditing) {
      setUsers(users.map((u) => (u.id === formData.id ? formData : u)));
      setIsEditing(false);
    } else {
      setUsers([...users, { ...formData, id: Date.now() }]);
    }

    setFormData({ id: 0, name: "", email: "", role: "user" });
  };

  return (
    <div style={{ padding: "20px", display: "grid", gap: "20px" }}>
      <Paper style={{ padding: "20px" }}>
        <h2>Add User/Admin/Super Admin</h2>

        <TextField
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          fullWidth
          margin="normal"
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Role</InputLabel>
          <Select
            value={formData.role}
            label="Role"
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value as string })
            }
          >
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="super-admin">Super Admin</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {isEditing ? "Update User" : "Add User"}
        </Button>
      </Paper>

      <Paper style={{ padding: "20px" }}>
        <h2>User Table</h2>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      onClick={() => handleEdit(user)}
                      style={{ marginRight: "10px" }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default SuperAdminPage;
