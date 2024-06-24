// server.js
const express = require("express");
const cors = require("cors");
const { db } = require(".");
const { collection, addDoc, getDocs, query, where } = require("firebase/firestore");

const app = express();
app.use(cors());
app.use(express.json());

const responsesCollection = collection(db, "responses");
const usersCollection = collection(db, "users");

app.post("/api/responses", async (req, res) => {
  const responses = req.body;
  const registerNumber = responses[0].registerNumber;

  try {
    const q = query(responsesCollection, where("registerNumber", "==", registerNumber));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return res.status(400).send("You have already submitted your responses.");
    }

    for (const response of responses) {
      await addDoc(responsesCollection, response);
    }
    res.status(201).send("Responses saved successfully");
  } catch (error) {
    res.status(400).send("Error saving responses");
  }
});

app.post("/api/login", async (req, res) => {
  const userDetails = req.body;

  try {
    const q = query(usersCollection, where("registerNumber", "==", userDetails.registerNumber));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return res.status(400).send("You have already registered.");
    }

    await addDoc(usersCollection, userDetails);
    res.status(201).send("User details saved successfully");
  } catch (error) {
    res.status(400).send("Error saving user details");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
