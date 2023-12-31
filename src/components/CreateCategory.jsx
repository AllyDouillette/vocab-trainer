import { userContext } from "../App"
import { baseURL, headers } from "../helpers/constants"
import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router"

export default function CreateCategory () {
  const {user} = useContext(userContext)
  const navigate = useNavigate()
  const [categories, setCategories] = useState(null)
  const [form, setForm] = useState({user: (user || "unknown"), entries: []})

  const getCategories = () => {
    const endpoint = "/categories"
    fetch(baseURL + endpoint)
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.log("error loading categories", error))
  }

  useEffect(getCategories, [])

  const handleChange = (event) => {
    const {name, value} = event.target
    setForm({...form, [name]: value})
  }

  const duplicate = () => !!categories.find(category => category.title === form.title)

  const createCategory = () => {
    
    const endpoint = "/categories"
    const body = {
      "author": (user ? user.displayname : "unknown"),
      "title": form.title,
      "entries": []
    }

    const options = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    }

    fetch(baseURL + endpoint, options)
      .then(response => response.json())
      .then(data => console.log(data, "success"))
      .then(() => navigate("/select-category"))
      .catch(error => console.log("Error creating category", error))
    
  }

  const handleSubmit = () => {
    event.preventDefault()
    duplicate() ? navigate("/select-category") : createCategory()
  }

  if (!categories) return (<div className="center">
    Loading categories…
  </div>)

  return (
    <main className="center">
    <h2>Create new category</h2>
    <form onChange={handleChange} onSubmit={handleSubmit}>
      <label>Name</label>
      <input name="title"/>
      <button>Create</button>
    </form>
    </main>
  )
}