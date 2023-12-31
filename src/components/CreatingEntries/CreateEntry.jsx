import { useEffect, useState } from "react"
import { baseURL, headers, entryBlueprint } from "../../helpers/constants"
import { useNavigate } from "react-router"
import BatchImport from "./BatchImport"

function DropdownField ({category}) {
  const {id, title} = category
  return (
    <option id={id}>{title}</option>
  )
}

export default function CreateEntry() {
  const [categories, setCategories] = useState(null)

  const navigate = useNavigate()

  const getCategories = () => {
    const endpoint = "/categories"
    fetch(baseURL + endpoint)
      .then(response => response.json())
      .then(data => setCategories(data))
      .catch(error => console.log("error loading categories", error))
  }

  useEffect(getCategories, [])

  const initForm = {
    "categoryId": null,
    "prompt": "",
    "answer": "",
    "clue": ""
  }

  const [form, setForm] = useState(initForm)

  const resetForm = () => setForm(initForm)

  const handleInput = (event) => {
    const { name, value } = event.target
    setForm({ ...form, [name]:value })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.categoryId) return
    
    const endpoint = "/entries"

    const body = { ...entryBlueprint,
      "categoryId": Number(form.categoryId),
      "last": new Date().toISOString(),
      "prompt": form.prompt,
      "answer": form.answer,
      "clue": form.clue
    }

    const options = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    }

    fetch(baseURL + endpoint, options)
      .then(response => response.json())
      .then(() => navigate("/new-entry"))
      .then(() => resetForm())
      .catch(error => console.log("error creating entry", error))
  }
  
  if (!categories) return (<div className="center">
    Loading categories…
  </div>)

  return (
    <form className="twoColumns" onSubmit={handleSubmit}>
      <label>Category</label>
      <select name="categoryId" value={form.categoryId || "Select Category"} onChange={handleInput} required>
        {!form.categoryId && <option>Select Category</option>}
        {categories.map((category, index) => <option key={index} value={category.id}>{category.title}</option>)}
      </select>
      <label>Prompt</label>
      <textarea type="text" name="prompt" value={form.prompt} onChange={handleInput} required />
      <label>Answer</label>
      <textarea type="text" name="answer" value={form.answer} onChange={handleInput}  required />
      <label>Clue / Context</label>
      <textarea type="text" name="clue" value={form.clue} onChange={handleInput} />
      <div className="buttoncontainer">
        <p>Want to create a lot of entries?</p>
        <button onClick={() => navigate("/import")}>Import</button>
      </div>
      <div className="buttoncontainer">
        {!!form.categoryId && form.answer && form.prompt && <button value="Submit">➕ Create</button>}
        {(form.prompt || form.answer || form.clue) && <button onClick={resetForm}>clear</button>}
      </div>
    </form>
  )
}