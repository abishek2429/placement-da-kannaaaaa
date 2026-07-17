# Mission Deloitte 2 – Core Engineering

## Problem Statement

Build a dynamic JSON-driven form generator in React/Next.js that renders a nested questionnaire with validation and conditional fields.

---

# Technical Requirements

- Generate forms from a JSON schema.
- Support nested form fields.
- Validate user input (Age must be greater than 18).
- Display Company Name only when "Employed" is selected.
- Show validation errors.

---

# System Architecture

```
User

↓

React / Next.js UI

↓

JSON Schema

↓

Form Renderer

↓

Validation Engine

↓

Submitted Data
```

---

# Sample JSON Schema

```json
{
  "fields": [
    {
      "type": "number",
      "label": "Age",
      "name": "age",
      "validation": {
        "min": 19
      }
    },
    {
      "type": "checkbox",
      "label": "Employed",
      "name": "employed"
    },
    {
      "type": "text",
      "label": "Company Name",
      "name": "company",
      "showIf": {
        "field": "employed",
        "value": true
      }
    }
  ]
}
```

---

# React Logic

```jsx
{schema.fields.map((field) => {

if (
field.showIf &&
formData[field.showIf.field] !== field.showIf.value
)
return null;

return (
<input
type={field.type}
name={field.name}
/>
);

})}
```

---

# Validation

```javascript
if(age <= 18){
return "Age must be greater than 18";
}
```

---

# Edge Cases

- Age less than or equal to 18
- Empty required fields
- Company Name hidden when not employed
- Invalid number input

---

# Big-O Analysis

Rendering Fields: O(n)

Validation: O(n)

Memory Usage: O(n)

where n = number of fields.

---

# Technical Decisions

- JSON is used because it is flexible and easy to update.
- React components improve code reusability.
- Conditional rendering improves user experience.
- Validation prevents incorrect data submission.

---

# Trade-offs

Advantages

- Easy to extend
- Dynamic forms
- Reusable components

Disadvantages

- Large schemas increase complexity.
- Deep nesting requires additional processing.
