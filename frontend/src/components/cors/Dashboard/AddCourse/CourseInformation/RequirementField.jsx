import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export default function RequirementsField({
  name,
  label,
  register,
  setValue,
  errors,
  getValues,
}) {
  const { editCourse, course } = useSelector((state) => state.course)
  const [requirement, setRequirement] = useState("")
  const [requirementsList, setRequirementsList] = useState([])

  useEffect(() => {
    if (editCourse) {
      setRequirementsList(course?.instructions)
    }
    register(name, { required: true, validate: (value) => value.length > 0 })
  }, [])

  useEffect(() => {
    setValue(name, requirementsList)
  }, [requirementsList])

  const handleAddRequirement = () => {
    if (requirement && requirement.trim()) {
      setRequirementsList([...requirementsList, requirement.trim()])
      setRequirement("")
    }
  }

  const handleRemoveRequirement = (index) => {
    const updatedRequirements = [...requirementsList]
    updatedRequirements.splice(index, 1)
    setRequirementsList(updatedRequirements)
  }

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm text-richblack-5" htmlFor={name}>
        {label} <sup className="text-pink-200">*</sup>
      </label>
      <div className="flex flex-col items-start space-y-2">
        <input
          type="text"
          id={name}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddRequirement()
            }
          }}
          placeholder="Enter requirement and press Enter or click Add"
          className="form-style w-full"
        />
        <button
          type="button"
          onClick={handleAddRequirement}
          disabled={!requirement.trim()}
          className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 ${
            requirement.trim() 
              ? 'bg-yellow-50 text-richblack-900 hover:bg-yellow-100 cursor-pointer' 
              : 'bg-richblack-700 text-richblack-400 cursor-not-allowed'
          }`}
        >
          Add
        </button>
      </div>
      {requirementsList.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-richblack-300 mb-2">
            Added Requirements ({requirementsList.length}):
          </p>
          <ul className="list-inside list-disc space-y-1">
            {requirementsList.map((requirement, index) => (
              <li key={`requirement-${index}`} className="flex items-center justify-between text-richblack-5 bg-richblack-700 p-2 rounded">
                <span>{requirement}</span>
                <button
                  type="button"
                  className="ml-2 text-xs text-pink-200 hover:text-pink-100 transition-colors"
                  onClick={() => handleRemoveRequirement(index)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {errors[name] && (
        <span className="ml-2 text-xs tracking-wide text-pink-200">
          {label} is required
        </span>
      )}
    </div>
  )
}