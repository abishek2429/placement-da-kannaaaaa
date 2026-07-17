# Dynamic JSON-Driven Form Generator

## Overview

This project implements a dynamic form generator using React/Next.js. The form is rendered entirely from a JSON schema and supports validation and conditional logic.

## Features

* JSON-driven UI rendering
* Field-level validation (e.g., age > 18)
* Conditional rendering (e.g., show Company Name if employed)
* Scalable and reusable architecture

## Architecture

### Components

* FormRenderer: Core engine that renders fields dynamically
* Validation Layer: Handles rules defined in schema
* Schema: Defines structure, validation, and conditions

### Data Flow

1. JSON schema → parsed by renderer
2. User input → stored in state
3. Validation → triggered on submit
4. Conditional logic → evaluated during render

## Big-O Analysis

### Rendering

* O(n): Each field is processed once

### Validation

* O(n): Each field validated once

### Conditional Checks

* O(n): Each field checked for visibility

Overall Complexity: O(n)

## Trade-offs

### Pros

* Highly scalable
* Easy to modify via JSON
* Clean separation of concerns

### Cons

* Large schemas can affect performance
* Complex conditions increase logic complexity

## How to Run

```
npm install
npm run dev
```
