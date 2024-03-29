export const baseURL = import.meta.env.VITE_API_URL

export const headers = {
  "content-type": "application/json"
}

export const entryBlueprint = {
  "categoryId": "",
  "level": 0,
  "last": "",
  "repetitions": {
    "correct": 0,
    "wrong": 0
  },
"prompt": "",
"answer": ""
}

export const maxLevel = 10

const dayInMilliseconds = 1000 * 60 * 60 * 24

const timeToNextPractice = (level) => level ** 2.4 * dayInMilliseconds

export const timeToNextPracticeObj = () => {
  const obj = {}

  for (let i = 0; i <= maxLevel; i++) {
    obj[String(i)] = parseInt(timeToNextPractice(i).toFixed(0))
  }

  return obj
}

export const siteTitle = "Apprendio"
export const alternateSiteTitle = "Come back!"

export const shuffle = (array) => array.sort(() => Math.random() - 0.5)
