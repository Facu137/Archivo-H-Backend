import db from "../config/db.js";

const User = {
  create: (user, callback) => {
    const query =
      "INSERT INTO usuario (email, password, nombre, apellido, rol) VALUES (?, ?, ?, ?, ?)";
    // Establecer el rol como 'user' automáticamente
    const rol = "user";
    db.query(
      query,
      [user.email, user.password, user.nombre, user.apellido, rol],
      callback
    );
  },
  findByEmail: (email, callback) => {
    const query = "SELECT * FROM usuario WHERE email = ?";
    db.query(query, [email], callback);
  },
};

export default User;
