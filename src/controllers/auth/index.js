const {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
  DecodeSignature,
} = require("../../utils");

const { prisma } = require("../../config/prisma");

async function Register(req, res) {
  const { email, username, password, confirmPassword, role } = req.body;

  try {
    if (password !== confirmPassword) {
      throw new Error("password not match");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      throw new Error("email already used");
    }

    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: userPassword,
        username,
        salt,
        role,
      },
    });

    const token = await GenerateSignature({
      id: newUser.id,
      email,
      username,
      role,
    });

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: username,
        role: role,
        email: email,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function Login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const validPassword = await ValidatePassword(
        password,
        user.password,
        user.salt
      );

      if (validPassword) {
        const token = await GenerateSignature({
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        });

        res.status(200).json({
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
          },
        });
        return;
      }

      throw new Error("Email or Password Incorect");
    }

    throw new Error("User not found");
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
}

async function GetUser(req, res) {
  try {
    const { id: userId } = await DecodeSignature(req);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        username: true,
      },
    });

    res.status(200).json({ data: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function UpdateUser(req, res) {
  const { email, username, password, confirmPassword } = req.body;

  try {
    let aditionalData = {};
    const updatedUser = await prisma.user.findUnique({ where: { email } });
    if (password) {
      if (password !== confirmPassword) {
        throw new Error("Password and confirm password not match");
      }

      const userPassword = await GeneratePassword(password, updatedUser.salt);
      aditionalData = { password: userPassword };
    }

    const user = await prisma.user.update({
      where: { email },
      data: { username, email, ...aditionalData },
    });

    const token = await GenerateSignature({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

module.exports = { Register, Login, GetUser, UpdateUser };
