const mongoose = require("mongoose");

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://fullstack:${password}@fullstackopencluster.lbzvb4p.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

if (process.argv.length < 3) {
  console.log("Give password as an argument in order to proceed ");
  process.exit(1);
}

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length > 3) {
  const person = new Person({
    name: `${name}`,
    number: `${number}`,
  });

  person.save().then((result) => {
    console.log(`Added ${name} - ${number} to the phonebook`);
    mongoose.connection.close();
  });
} else {
  Person.find({}).then((result) => {
    console.log("Phonebook:");
    result.map((person) => {
      console.log(`${person.name} | ${person.number}`);
    });
    mongoose.connection.close();
  });
}
