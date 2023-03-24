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

const getPersonId = () => {
  return Math.floor(Math.random() * 100);
};

app.get("/", (req, res) => {
  res.send("<h1>Person's Application</h1>");
});

app.get("/info", (req, res) => {
  const requestTime = new Date();

  Person.find({}).then((persons) => {
    res.send(
      `<p>This Phonebook API has info for ${persons.length} people </p> <p>${requestTime}</p>`
    );
  });
});

//
// * Get a list of people from the phonebook
//
app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

//
// * Get a single person from the phonebook
//
app.get("/api/persons/:personId", (req, res, next) => {
  Person.findById(req.params.personId)
    .then((person) => {
      res.json(person);
    })
    .catch((error) => next(error));
});

//
// * Delete a person from the phonebook
//
app.delete("/api/persons/:personId", (req, res, next) => {
  Person.findByIdAndRemove(req.params.personId)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

//
// * Create a new person for the phonebook
//
app.post("/api/persons/", (req, res, next) => {
  const name = req.body.name;
  const number = req.body.number;
  const find = Person.find({ name: name }).exec();
  console.log("find", find);

  const personObject = new Person({
    name: name,
    number: number,
  });

  personObject
    .save()
    .then((savedNumber) => {
      res.json(savedNumber);
    })
    .catch((error) => next(error));
});

//
// * Update a person's details in the phonebook
//
app.patch("/api/persons/:personId", (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate(
    req.params.personId,
    { name, number },
    { new: true, runValidators: true }
  )
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

//
// * Unknown Endpoint Handler Middlware
//
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

//
// * Error Handler Middleware
//
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, (req, res) => console.log(`Server listening on port ${PORT}`));
