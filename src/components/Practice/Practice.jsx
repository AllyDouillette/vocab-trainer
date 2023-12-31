import { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router"
import CardPair from "./CardPair"
import CardStats from "./CardStatistics"
import { baseURL, headers, shuffle, maxStage, timeToNextPracticeObj } from "../../helpers/constants"
import { readyForPractice } from "../../helpers/functions"
import { sessionContext, userContext } from "../../App"

export default function Practice () {

  const { user, setUser } = useContext(userContext)
  const { setSessionStats } = useContext(sessionContext)
  const { categoryId, cardId } = useParams()
  const navigate = useNavigate()
  const [entries, setEntries] = useState(null)
  const [category, setCategory] = useState(null)
  const [currentCard, setCurrentCard] = useState(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [userEntry, setUserEntry] = useState("")
  const [evaluation, setEvaluation] = useState(null)
  const timeDiffObj = timeToNextPracticeObj()

  const getCategory = () => {
    const endpoint = "/categories/" + categoryId

    fetch(baseURL + endpoint)
      .then(response => response.json())
      .then(data => setCategory(data))
      .catch(error => console.log("error getting entries", error))
  }

  useEffect(getCategory, [])

  const getEntries = () => {
    const endpoint = "/entries"
    
    fetch(baseURL + endpoint)
    .then(response => response.json())
    .then(data => {
      const entriesFromCategory = data.filter(entry => entry.categoryId === Number(categoryId) && entry.stage < maxStage && readyForPractice(entry.last, timeDiffObj[entry.stage]))
      if (entriesFromCategory.length) {
        setCurrentCardIndex(0)
        setEntries(shuffle(entriesFromCategory))
        navigate("/practice/"+ categoryId + "/" + entriesFromCategory[0].id)
        setCurrentCard(entriesFromCategory[0])
      } else {
        setEntries([])
      }
      })
      .catch(error => console.log("error getting entries", error))
  }

  useEffect(getEntries, [])
  
  const getCurrentCard = () => {if (entries && currentCardIndex) {
      setShowAnswer(false)
      setEvaluation(null)
      setCurrentCard(entries[currentCardIndex])
    }
  }

  useEffect(getCurrentCard, [currentCardIndex])

  const handleEntry = (event) => setUserEntry(event.target.value) 

  const handleSubmit = () => {
    currentCard.answer.match(userEntry) ? setEvaluation(true) : setEvaluation(false)
    setShowAnswer(true)
  }

  const logCorrect = () => {
    increaseCardStats("correct")

    if (user) {
      updateUserStats("correct")
    } else {
      increaseSessionStats("correct")
    }
    
    setUserEntry("")
    next()
  }
  
  const logWrong = () => {
    increaseCardStats("wrong")

    if (user) {
      updateUserStats("wrong")
    } else {
      increaseSessionStats("wrong")
    }
    setUserEntry("")
    next()
  }

  const increaseCardStats = (keyName) => {
    const endpoint = "/entries/" + currentCard.id

    const body = {
      "repetitions": {
        ...currentCard.repetitions,
        [keyName]: currentCard.repetitions[keyName] + 1
      }
    }

    if (currentCard.stage < maxStage && keyName === "correct") {
      body.stage = currentCard.stage + 1
    }

    if (keyName === "correct") {
      body.last = new Date().toISOString()
    }
    
    const options = {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify(body)
    }

    fetch(baseURL + endpoint, options)
      .then(response => response.json())
      .catch(error => console.log("error registering change in card", error))
  }

  const increaseSessionStats = (keyName) => {
    const sessionStatsOld = JSON.parse(sessionStorage.getItem("sessionStats"))
    const sessionStatsNew = {...sessionStatsOld, [keyName]: sessionStatsOld[keyName]+1} 
    sessionStorage.setItem("sessionStats", JSON.stringify(sessionStatsNew))
    setSessionStats(sessionStatsNew)
  }

  const updateUserStats = (type) => {
    if (!type || !user) return
    const endpoint = "/users/" + user.id

      const body = {
        statistics: {...user.statistics, [type]: user.statistics[type] + 1}
      }

      const options = {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(body)
      }

      fetch(baseURL + endpoint, options)
        .then(response => response.json())
        .then(data => setUser(data))
        .catch(error => console.log(error, "error updating user"))
  }

  const next = () => {
    if (currentCardIndex + 1 < entries.length) {
      const nextCard = entries[Number(currentCardIndex + 1)]
      setCurrentCardIndex(currentCardIndex+1)
      navigate("/practice/"+ categoryId + "/" + nextCard.id)
    } else {
      navigate("/")
    }
  }

  useEffect(getCurrentCard, [currentCardIndex])

  if (!category) return

  if (entries && entries.length === 0) {
    return (
      <div className="center">
        <h3>Whoops!</h3>
        <p>There are no entries to practice for "{category.title}".</p>
        <button onClick={() => navigate("/new-entry")}>➕ Add Entry</button>
      </div>
    )
  }

  if (!currentCard) return (<div className="center">
    Loading card…
  </div>)

  return (
    <>
      <CardStats props={currentCard} />
      <CardPair props={currentCard} revealAnswer={showAnswer} handleEntry={handleEntry}/>
      {evaluation === null &&
        <div className="buttoncontainer">
          <button onClick={() => handleSubmit()}>Enter</button>
          <button className="red" onClick={() => next()}>Next →</button>
        </div>
      }
      {evaluation !== null &&
      <div className="buttoncontainer">
        <button className="circlebutton green" onClick={() => logCorrect()}>✓</button>
        <button className="circlebutton red" onClick={() => logWrong()}>×</button>
      </div>
      }
    </>
  )
}