import React, { useState, useEffect } from "react";
import "./App.css";
import { Doughnut } from "react-chartjs-2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faEnvelope, faLock, faUser, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faPlus, faFileUpload, faDownload, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import * as XLSX from "xlsx";
import CircularTimer from "./CircularTimer";
import "bootstrap/dist/css/bootstrap.min.css";
import Imagess from "./image/studys.jpg";

// Import the boom sound
import boomSound from "./songs/boom.mp3";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AdminPage() {
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: "",
    optionsa: "",
    optionb: "",
    optionc: "",
    answer: "",
  });
  const [file, setFile] = useState(null);

  const handleAddQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    if (
      !newQuestion.question ||
      !newQuestion.options ||
      !newQuestion.optionsa ||
      !newQuestion.optionb ||
      !newQuestion.optionc ||
      !newQuestion.answer
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "questions"), newQuestion);
      alert("Question added successfully!");
      setNewQuestion({
        question: "",
        options: "",
        optionsa: "",
        optionb: "",
        optionc: "",
        answer: "",
      });
    } catch (error) {
      alert("Error adding question: " + error.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleAddQuestionsFromFile = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileContent = e.target.result;
        const questions = JSON.parse(fileContent);

        for (const question of questions) {
          if (
            question.question &&
            question.options &&
            question.optionsa &&
            question.optionb &&
            question.optionc &&
            question.answer
          ) {
            await addDoc(collection(db, "questions"), question);
          } else {
            alert("Invalid question format in the JSON file.");
            return;
          }
        }
        alert("Questions added successfully from file!");
      } catch (error) {
        alert("Error adding questions from file: " + error.message);
      }
    };

    reader.onerror = (error) => {
      alert("Error reading file: " + error.message);
    };

    reader.readAsText(file);
  };

  const handleDownloadExcel = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "responses"));
      const responses = querySnapshot.docs.map((doc) => doc.data());

      const userScores = responses.map((response) => ({
        email: response.user.email,
        correct: response.correct || 0,
        incorrect: response.incorrect || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(userScores);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "User Scores");
      XLSX.writeFile(wb, "user_scores.xlsx");
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="logout-button">
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </div>
      <div className="admin-content">
        <div className="admin-card">
          <h3>Add a New Question</h3>
          <form onSubmit={handleAddQuestionSubmit}>
            <div className="form-group">
              <input
                name="question"
                placeholder="Enter the Question"
                value={newQuestion.question}
                onChange={handleAddQuestionChange}
              />
            </div>
            <div className="form-group">
              <input
                name="options"
                placeholder="Option A"
                value={newQuestion.options}
                onChange={handleAddQuestionChange}
              />
            </div>
            <div className="form-group">
              <input
                name="optionsa"
                placeholder="Option B"
                value={newQuestion.optionsa}
                onChange={handleAddQuestionChange}
              />
            </div>
            <div className="form-group">
              <input
                name="optionb"
                placeholder="Option C"
                value={newQuestion.optionb}
                onChange={handleAddQuestionChange}
              />
            </div>
            <div className="form-group">
              <input
                name="optionc"
                placeholder="Option D"
                value={newQuestion.optionc}
                onChange={handleAddQuestionChange}
              />
            </div>
            <div className="form-group">
              <input
                name="answer"
                placeholder="Correct Answer"
                value={newQuestion.answer}
                onChange={handleAddQuestionChange}
              />
            </div>
            <button type="submit">
              <FontAwesomeIcon icon={faPlus} /> Add Question
            </button>
          </form>
        </div>
        <div className="admin-card">
          <h3>Upload Questions from File</h3>
          <div className="form-group">
            <input type="file" accept=".json" onChange={handleFileChange} />
            <button onClick={handleAddQuestionsFromFile}>
              <FontAwesomeIcon icon={faFileUpload} /> Upload
            </button>
          </div>
        </div>
        <div className="admin-card">
          <h3>Download User Answers</h3>
          <button onClick={handleDownloadExcel}>
            <FontAwesomeIcon icon={faDownload} /> Download
          </button>
        </div>
      </div>
      <div className="admin-footer">
        <img src={Imagess} alt="Admin Image" className="admin-image" />
      </div>
    </div>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: "",
    optionsa: "",
    optionb: "",
    optionc: "",
    answer: "",
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const q = query(collection(db, "questions"), orderBy("question"));
      const querySnapshot = await getDocs(q);
      const questionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(questionsData);
      setShuffledData(shuffleArray(questionsData));
    } catch (error) {
      console.error("Error fetching questions: ", error.message);
    }
  };

  const handleAddQuestionChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddQuestionSubmit = async (e) => {
    e.preventDefault();
    if (
      !newQuestion.question ||
      !newQuestion.options ||
      !newQuestion.optionsa ||
      !newQuestion.optionb ||
      !newQuestion.optionc ||
      !newQuestion.answer
    ) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "questions"), newQuestion);
      alert("Question added successfully!");
      setNewQuestion({
        question: "",
        options: "",
        optionsa: "",
        optionb: "",
        optionc: "",
        answer: "",
      });
      fetchQuestions();
    } catch (error) {
      alert("Error adding question: " + error.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleAddQuestionsFromFile = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const fileContent = e.target.result;
        const questions = JSON.parse(fileContent);

        for (const question of questions) {
          if (
            question.question &&
            question.options &&
            question.optionsa &&
            question.optionb &&
            question.optionc &&
            question.answer
          ) {
            await addDoc(collection(db, "questions"), question);
          } else {
            alert("Invalid question format in the JSON file.");
            return;
          }
        }
        alert("Questions added successfully from file!");
        fetchQuestions();
      } catch (error) {
        alert("Error adding questions from file: " + error.message);
      }
    };

    reader.onerror = (error) => {
      alert("Error reading file: " + error.message);
    };

    reader.readAsText(file);
  };

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const [shuffledData, setShuffledData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [showChart, setShowChart] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userDetails, setUserDetails] = useState({
    email: "",
    password: "",
    registerNumber: "",
  });
  const [timeLeft, setTimeLeft] = useState(60);
  const [timedOutQuestions, setTimedOutQuestions] = useState(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isScoreViewed, setIsScoreViewed] = useState(false);

  useEffect(() => {
    setShuffledData(shuffleArray(data));
  }, [data]);

  useEffect(() => {
    if (shuffledData.length > 0 && !isScoreViewed) {
      const timer = setInterval(() => {
        setTimeLeft((prevTimeLeft) => {
          if (prevTimeLeft > 0) {
            setTimeSpent((prevTimeSpent) => prevTimeSpent + 1);
            return prevTimeLeft - 1;
          } else {
            clearInterval(timer);
            handleNext(true);
            return 60;
          }
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentIndex, shuffledData, isScoreViewed]);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsLoggedIn(true);
          setUserDetails({
            email: user.email,
            role: userData.role,
            registerNumber: userData.registerNumber,
            hasSubmitted: userData.hasSubmitted || false,
          });
          setIsAdmin(
            user.email === "admin@gmail.com" && userData.role === "admin"
          );
          if (userData.hasSubmitted) {
            setIsSubmitted(true);
          } else {
            fetchQuestions();
          }
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setData([]);
      }
    });
  }, []);

  useEffect(() => {
    let sound;
    if (timeLeft <= 10 && timeLeft >= 1) {
      sound = new Audio(boomSound);
      sound.play();
    }
    return () => {
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    };
  }, [timeLeft]);

  const handleNext = (isTimedOut = false) => {
    if (selectedOption || isTimedOut) {
      setIsFadingOut(true);
      setTimeout(() => {
        const currentItem = shuffledData[currentIndex];
        setAnsweredQuestions((prev) => [
          ...prev,
          {
            question: currentItem.question,
            selectedOption: selectedOption || "No Answer",
            correctAnswer: currentItem.answer,
            email: userDetails.email,
          },
        ]);
        setSelectedOption("");
        setTimedOutQuestions((prev) => new Set(prev).add(currentIndex));
        if (currentIndex < shuffledData.length - 1) {
          setCurrentIndex((prevIndex) => prevIndex + 1);
          setTimeLeft(60);
        } else {
          handleSubmit();
        }
        setIsFadingOut(false);
      }, 500);
    } else {
      alert("Please select an option before proceeding.");
    }
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      alert("User is not authenticated. Please log in again.");
      return;
    }

    const updatedScore = calculateScore();

    try {
      const docRef = await addDoc(collection(db, "responses"), {
        user: userDetails,
        answers: answeredQuestions,
        correct: updatedScore.correct,
        incorrect: updatedScore.incorrect,
      });

      await setDoc(doc(db, "users", auth.currentUser.uid), {
        ...userDetails,
        hasSubmitted: true,
      });

      setIsSubmitted(true);
      alert("Responses submitted successfully!");
    } catch (error) {
      if (error.code === "permission-denied") {
        alert(
          "Error submitting responses: Permission denied. Please check your Firestore security rules."
        );
      } else {
        alert("Error submitting responses: " + error.message);
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0 && !timedOutQuestions.has(currentIndex - 1)) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      setTimeLeft(60);
    } else if (timedOutQuestions.has(currentIndex - 1)) {
      alert("This question's time is over, continue to the next question.");
    }
  };

  const calculateScore = () => {
    let correct = 0;
    let incorrect = 0;

    shuffledData.forEach((question, index) => {
      const answeredQuestion = answeredQuestions.find(
        (aq) => aq.question === question.question
      );

      if (answeredQuestion) {
        if (answeredQuestion.selectedOption === question.answer) {
          correct++;
        } else {
          incorrect++;
        }
      } else {
        incorrect++;
      }
    });

    const updatedScore = { correct, incorrect };
    setScore(updatedScore);
    return updatedScore;
  };

  const handleViewScore = () => {
    calculateScore();
    setShowChart(true);
    setIsScoreViewed(true);
  };

  const dataChart = {
    labels: ["Correct Answers", "Incorrect Answers"],
    datasets: [
      {
        label: "Answers",
        data: [score.correct, score.incorrect],
        backgroundColor: ["#4caf50", "#f44336"],
        borderColor: ["#4caf50", "#f44336"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: "Quiz Results",
      },
    },
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        userDetails.email,
        userDetails.password
      );
      setIsLoggedIn(true);
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        email: userCredential.user.email,
        registerNumber: userDetails.registerNumber,
      }));
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists()) {
        setIsAdmin(
          userCredential.user.email === "admin@gmail.com" &&
            userDoc.data().role === "admin"
        );
        if (userDoc.data().hasSubmitted) {
          setIsSubmitted(true);
        } else {
          fetchQuestions();
        }
      }
    } catch (error) {
      alert("Error logging in: " + error.message);
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userDetails.email,
        userDetails.password
      );
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userDetails.email,
        role: "user",
        registerNumber: userDetails.registerNumber,
        hasSubmitted: false,
      });
      alert("Registered successfully!");
      setIsRegistering(false);
    } catch (error) {
      alert("Error registering: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setUserDetails({ email: "", password: "", registerNumber: "" });
      setIsAdmin(false);
      setData([]);
      setShuffledData([]);
      setIsSubmitted(false);
      setCurrentIndex(0);
      setSelectedOption("");
      setAnsweredQuestions([]);
      setScore({ correct: 0, incorrect: 0 });
      setShowChart(false);
      setTimeLeft(60);
      setTimedOutQuestions(new Set());
      setTimeSpent(0);
      setIsFadingOut(false);
      setIsScoreViewed(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "responses"));
      const responses = querySnapshot.docs.map((doc) => doc.data());

      const userScores = responses.map((response) => ({
        email: response.user.email,
        correct: response.correct || 0,
        incorrect: response.incorrect || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(userScores);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "User Scores");
      XLSX.writeFile(wb, "user_scores.xlsx");
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!isLoggedIn) {
    if (isRegistering) {
      return (
        <div className="hero-container">
          <div className="hero-section">
            <div className="hero-text">
              <h1>Welcome to the Quiz Platform</h1>
              <p>Register to get started</p>
            </div>
            <div className="form-container">
              <form onSubmit={handleRegisterSubmit} className="formstylesplus">
                <h2 className="formstyleform">Register</h2>
                <div className="form-group">
                  <FontAwesomeIcon icon={faEnvelope} className="fa" />
                  <input
                    type="email"
                    name="email"
                    value={userDetails.email}
                    onChange={handleRegisterChange}
                    required
                    className="emailinput-style"
                    placeholder="Email ID"
                  />
                </div>
                <div className="form-group">
                  <FontAwesomeIcon icon={faLock} className="fa" />
                  <input
                    type="password"
                    name="password"
                    value={userDetails.password}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Password"
                  />
                </div>
                <div className="form-group">
                  <FontAwesomeIcon icon={faUser} className="fa" />
                  <input
                    type="text"
                    name="registerNumber"
                    value={userDetails.registerNumber}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Register Number"
                  />
                </div>
                <div className="button-group">
                  <button type="submit" className="login-button">
                    Register
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="login-button"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
              <div className="image-container">
                <img src={Imagess} alt="Register Image" className="form-image" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="hero-container">
        <div className="hero-section">
          <div className="hero-text">
            <h1>Welcome to the Quiz Platform</h1>
            <p>Login to continue</p>
          </div>
          <div className="form-container">
            <form onSubmit={handleLoginSubmit} className="login-form">
              <h2>Login</h2>
              <div className="form-group">
                <FontAwesomeIcon icon={faEnvelope} className="fa" />
                <input
                  type="email"
                  name="email"
                  value={userDetails.email}
                  onChange={handleLoginChange}
                  required
                  placeholder="Email ID"
                />
              </div>
              <div className="form-group">
                <FontAwesomeIcon icon={faLock} className="fa" />
                <input
                  type="password"
                  name="password"
                  value={userDetails.password}
                  onChange={handleLoginChange}
                  required
                  placeholder="Password"
                />
              </div>
              <div className="form-group">
                <FontAwesomeIcon icon={faUser} className="fa" />
                <input
                  type="text"
                  name="registerNumber"
                  value={userDetails.registerNumber}
                  onChange={handleLoginChange}
                  required
                  placeholder="Register Number"
                />
              </div>
              <div className="button-group">
                <button type="submit" className="login-button">
                  Login
                </button>
                <button
                  onClick={() => setIsRegistering(true)}
                  className="register-style"
                >
                  Register
                </button>
              </div>
            </form>
            <div className="image-container">
              <img src={Imagess} alt="Login Image" className="form-image" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminPage />;
  }

  if (shuffledData.length === 0 && !isSubmitted) {
    return <div>Loading...</div>;
  }

  if (isSubmitted) {
    return (
      <div className="App">
        <div className="content">
          <button onClick={handleViewScore} className="view-score-button">
            View Score
          </button>
          {showChart && (
            <div className="chart-container">
              <div className="score">
                <p>Correct answers: {score.correct}</p>
                <p>Incorrect answers: {score.incorrect}</p>
              </div>
              <div className="doughnut-container">
                <Doughnut data={dataChart} options={options} />
              </div>
              <div className="time-spent">
                <p>Total time spent: {formatTime(timeSpent)}</p>
              </div>
            </div>
          )}
          {isLoggedIn && (
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentItem = shuffledData[currentIndex];

  return (
    <div className="App">
      <button className="menu-button" onClick={toggleMenu}>
        <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
      </button>
      <div className={`menu ${isMenuOpen ? "open" : ""}`}>
        <ul className="menu-items">
          {shuffledData.map((item, index) => (
            <li
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsMenuOpen(false);
              }}
              className={currentIndex === index ? "active" : ""}
            >
              Question {index + 1}
            </li>
          ))}
        </ul>
      </div>
      <div className="content">
        {!isSubmitted ? (
          <div className={`item ${isFadingOut ? "fade-out" : ""}`}>
            <div className="header">
              <h2 className="small-font">{currentItem.question}</h2>
              <div className="timer-container">
                <CircularTimer timeLeft={timeLeft} totalTime={60} />
              </div>
            </div>
            <div className="options">
              {["options", "optionsa", "optionb", "optionc"].map(
                (optionKey, index) => (
                  <div
                    key={index}
                    className={`option ${
                      selectedOption === currentItem[optionKey]
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => setSelectedOption(currentItem[optionKey])}
                  >
                    {currentItem[optionKey]}
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          <div>
            <button onClick={handleViewScore} className="view-score-button">
              View Score
            </button>
            {showChart && (
              <div className="chart-container">
                <div className="score">
                  <p>Correct answers: {score.correct}</p>
                  <p>Incorrect answers: {score.incorrect}</p>
                </div>
                <div className="doughnut-container">
                  <Doughnut data={dataChart} options={options} />
                </div>
                <div className="time-spent">
                  <p>Total time spent: {formatTime(timeSpent)}</p>
                </div>
              </div>
            )}
          </div>
        )}
        {!isSubmitted && (
          <div className="buttons">
            <button
              onClick={handlePrevious}
              className="previous-button"
              disabled={currentIndex === 0}
            >
              Previous
            </button>
            {currentIndex < shuffledData.length - 1 ? (
              <button onClick={handleNext} className="next-button">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} className="submit-button">
                Submit
              </button>
            )}
          </div>
        )}
        {isLoggedIn && (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
