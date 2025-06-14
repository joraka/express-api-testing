const express = require("express");
const app = express();
const port = 3131;

app.use(express.json());

const db = {
  max_id: 0,
  users: [],
};

const getUserData = (userObj) => {
  const filteredObj = { ...userObj };
  delete filteredObj.password;
  return filteredObj;
};

const validator = {
  isValidId: (id) => {
    if (typeof id !== "number") throw new Error("ID must be a number");
    return isFinite(id) && id >= 1;
  },

  isAllFieldExists: (fields) => {
    return fields.every(Boolean);
  },

  isSomeFieldsExist: (fields) => {
    return fields.some(Boolean);
  },

  isUsernameExits: (username, id) => {
    if (typeof username !== "string") throw new Error("username must be a string");
    if (id) {
      if (typeof id !== "number") throw new Error("ID must be a number");
      return db.users.some((user) => user.username === username && user.id !== id);
    }
    return db.users.some((user) => user.username === username);
  },

  isValidUsername: (username) => {
    if (username.length < 3 || username.length > 32) return false;
    return true;
  },

  isEmailExists: (email, id) => {
    if (typeof email !== "string") throw new Error("Email must be a string");
    if (id) {
      if (typeof id !== "number") throw new Error("ID must be a number");
      return db.users.some((user) => user.email === email && user.id !== id);
    }
    return db.users.some((user) => user.email === email);
  },

  isValidEmail: (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  },

  isValidPassword: (password) => {
    if (password.length < 2 || password.length > 32) {
      return false;
    }

    let hasLetters = false;
    let hasNumbers = false;

    for (let i = 0; i < password.length; i++) {
      const code = password.charCodeAt(i);

      if (code >= 48 && code <= 57) {
        // 0-9
        hasNumbers = true;
      } else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
        // A-Z, a-z
        hasLetters = true;
      } else {
        return false;
      }
    }

    if (!hasLetters || !hasNumbers) {
      return false;
    }

    return true;
  },
};

app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/v1/", (req, res) => {
  res.status(200).send("hi");
});

app.get("/v1/users", (req, res) => {
  res.status(200).json(db.users.map(getUserData));
});

app.get("/v1/users/:id", (req, res) => {
  const idNum = parseInt(req.params?.id, 10);

  if (!validator.isValidId(idNum)) {
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  const userObj = db.users.find((user) => user.id === idNum);

  if (!userObj) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    message: "User found",
    user: getUserData(userObj),
  });
});

//post methods
app.post("/v1/users", (req, res) => {
  let { username, email, password } = req?.body || {};

  if (!validator.isAllFieldExists([username, email, password])) {
    return res
      .status(400)
      .json({ message: "Missing field. Username, email and password are required." });
  }

  username = username.trim();

  //unique username validation
  //username length validation 3 to 35

  if (!validator.isValidUsername(username)) {
    return res.status(400).json({ message: "Username length must be between 3 and 32" });
  }

  if (validator.isUsernameExits(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  //email validation unique
  //email format validation
  if (!validator.isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  if (validator.isEmailExists(email)) {
    return res.status(400).json({ message: "Email already exists" });
  }

  //possword validation - length 8 to 32,
  //password validation - only numbers and alphabetical characters
  if (!validator.isValidPassword(password)) {
    return res.status(400).json({
      message:
        "Password must be in numerical and alphabetical characters, length must be between 3 and 32 characters",
    });
  }

  const user = {
    id: ++db.max_id,
    username: username,
    email: email,
    password: password,
  };

  db.users.push(user);

  res.json({
    message: "User created",
    user: getUserData(user),
  });
});

// put methods
app.put("/v1/users/:id", (req, res) => {
  let { username, email, password } = req?.body || {};
  const idNum = parseInt(req.params?.id, 10);

  if (!validator.isValidId(idNum)) {
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  if (!validator.isAllFieldExists([username, email, password])) {
    return res
      .status(400)
      .json({ message: "Missing field. Username, email and password are required." });
  }

  const userObj = db.users.find((user) => user.id === idNum);

  if (!userObj) {
    return res.status(404).json({ message: "User not found" });
  }

  username = username.trim();

  //unique username validation
  //username length validation 3 to 35
  if (!validator.isValidUsername(username)) {
    return res.status(400).json({ message: "Username length must be between 3 and 32" });
  }

  if (validator.isUsernameExits(username, idNum)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  //email validation unique
  //email format validation
  if (!validator.isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  if (validator.isEmailExists(email, idNum)) {
    return res.status(400).json({ message: "Email already exists" });
  }

  //possword validation - length 8 to 32,
  //password validation - only numbers and alphabetical characters
  if (!validator.isValidPassword(password)) {
    return res.status(400).json({
      message:
        "Password must be in numerical and alphabetical characters, length must be between 3 and 32 characters",
    });
  }

  userObj.username = username;
  userObj.email = email;
  userObj.password = password;

  res.json({
    message: "User updated",
    user: getUserData(userObj),
  });
});

// patch methods
app.patch("/v1/users/:id", (req, res) => {
  let { username, email, password } = req?.body || {};
  const idNum = parseInt(req.params?.id, 10);

  if (!validator.isValidId(idNum)) {
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  const user = db.users.find((_user) => _user.id === idNum);

  const updateObj = {};

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!validator.isSomeFieldsExist([username, email, password])) {
    return res.status(400).json({
      message: "Must have at least one field, allowed fields are: username, email, password",
    });
  }

  //unique username validation
  //username length validation 3 to 35
  if (username) {
    username = username.trim();
    if (!validator.isValidUsername(username)) {
      return res.status(400).json({ message: "Username length must be between 3 and 32" });
    }
    if (validator.isUsernameExits(username, idNum)) {
      return res.status(400).json({ message: "Username already exists" });
    }
    updateObj.username = username;
  }

  //email validation unique
  //email format validation
  if (email) {
    if (!validator.isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    if (validator.isEmailExists(email, idNum)) {
      return res.status(400).json({ message: "Email already exists" });
    }
    updateObj.email = email;
  }

  //possword validation - length 8 to 32,
  //password validation - only numbers and alphabetical characters
  if (password) {
    if (!validator.isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be in numerical and alphabetical characters, length must be between 3 and 32 characters",
      });
    }
    updateObj.password = password;
  }

  Object.assign(user, updateObj);

  res.json({
    message: "User updated",
    user: getUserData(user),
  });
});

// delete methods
app.delete("/v1/users/:id", (req, res) => {
  //user id validation
  const idNum = parseInt(req.params?.id, 10);

  if (!validator.isValidId(idNum)) {
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  const userIndex = db.users.findIndex((user) => user.id === idNum);

  if (userIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  db.users.splice(userIndex, 1);

  res.json({
    message: "User deleted",
  });
});

//login
app.get("/v1/login", (req, res) => {
  let { username, password } = req?.body || {};

  if (!validator.isAllFieldExists([username, password])) {
    return res.status(400).json({ message: "Must have valid username and password" });
  }

  if (!validator.isValidUsername(username)) {
    return res.status(400).json({ message: "Username length must be between 3 and 32" });
  }

  if (!validator.isValidPassword(password)) {
    return res.status(400).json({
      message:
        "Password must be in numerical and alphabetical characters, length must be between 3 and 32 characters",
    });
  }

  const foundUserIndex = db.users.findIndex(
    (user) => user.username === username && user.password === password
  );

  if (foundUserIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    message: "User logged in",
    user: getUserData(db.users[foundUserIndex]),
    token: `${Date.now()}-${parseInt(Math.random() * 1e13)}`,
  });
});

app.listen(port, (err) => {
  if (err) return console.log(err);
  console.log(`listening at http://localhost:${port}`);
});
