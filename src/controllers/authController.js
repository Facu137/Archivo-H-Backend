import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
const { sign } = jwt;
import { createTransport } from "nodemailer";
import User from "../models/User.js";

const register = (req, res) => {
  const { email, password, nombre, apellido } = req.body;

  hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    const user = {
      email,
      password: hash,
      nombre,
      apellido,
    };

    User.create(user, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err });
      }

      // Enviar correo de validación
      const transporter = createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.EMAIL_USER, // Asegúrate de tener esta variable en tu .env
          pass: process.env.EMAIL_PASS, // Asegúrate de tener esta variable en tu .env
        },
      });

      const mailOptions = {
        from: "archivohistoricosde2008@gmail.com", // Cambia esto a tu dirección de correo
        to: email,
        subject: "Verificación de cuenta",
        text: `Gracias por registrarte. Por favor, verifica tu cuenta haciendo clic en el siguiente enlace: http://localhost:3000/verify?email=${email}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Correo enviado: " + info.response);
        }
      });

      res.status(201).json({ message: "Usuario registrado con éxito" });
    });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    if (results.length === 0) {
      return res
        .status(401)
        .json({ message: "Correo o contraseña incorrectos" });
    }

    const user = results[0];

    compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err });
      }

      if (result) {
        const token = sign(
          { id: user.id, rol: user.rol },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        return res.status(200).json({ token });
      } else {
        return res
          .status(401)
          .json({ message: "Correo o contraseña incorrectos" });
      }
    });
  });
};

export default {
  register,
  login,
};
