require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/personModel");

const app = express();

app.use(express.json());
app.use(express.static("build"));
app.use(morgan("tiny"));
app.use(cors());

morgan.token("postLog", (req, res) => {
  return req;
});

const postLog = (req, res, next) => {
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Body:", req.body);
  console.log("----");
  next();
};

app.use(postLog);

const persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const getPersonId = () => {
  return Math.floor(Math.random() * 100);
};

app.get("/", (req, res) => {
  res.send("<h1>Person's Application</h1>");
});

app.get("/info", (req, res) => {
  const requestTime = new Date();

  // TODO : Update personCount function
  // const personCount = Person.countDocuments({}, (err, count) => count);

  res.send(
    `<p>This Phonebook API has info for  people </p> <p>${requestTime}</p>`
  );
});

// Get a list of people from the phonebook
app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

// Get a single person from the phonebook
app.get("/api/persons/:personId", (req, res) => {
  Person.findById(req.params.personId).then((person) => {
    res.json(person);
  });
});

// Delete a person from the phonebook
app.delete("/api/persons/:personId", (req, res) => {
  const id = Number(req.params.personId);
  const person = persons.filter((person) => person.id !== id);

  res.status(204).end();
});

// Create a new person for the phonebook
app.post("/api/persons/", (req, res) => {
  const name = req.body.name;
  const number = req.body.number;
  const findablePerson = persons.find((person) => person.name === name);

  if (name === "" || number == "") {
    res.statusMessage = "Make sure to have all fields filled";
    res.status(404).end();
  } else if (typeof findablePerson !== "undefined") {
    res.statusMessage = "This person is already in the list";
    res.status(404).end();
  } else {
    const personObject = new Person({
      name: name,
      number: number,
    });

    personObject.save().then((savedNumber) => {
      res.json(savedNumber);
    });
  }
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, (req, res) => console.log(`Server listening on port ${PORT}`));
