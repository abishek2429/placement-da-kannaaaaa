# Reflection — Day 2

## Problem
Reverse a singly linked list in-place. Input: `1 → 2 → 3 → 4 → 5`, Expected output: `5 → 4 → 3 → 2 → 1`.

## My Initial Thinking
I knew I needed to traverse the list and flip pointers. I started by drawing nodes on paper and drew arrows showing `prev`, `current`, and `next`.

## Where I Got Stuck
I kept overwriting `current.next` before saving `next`, so I'd lose part of the list. I spent about 8 minutes on this before I noticed the bug.

## Claude Prompts Used
- "Explain why in a linked list reversal I need to save `next = current.next` before reassigning `current.next = prev`"
- "Show me the Python implementation step by step with comments"

## What AI Taught Me
Claude explained that because Python assignments are sequential, once I write `current.next = prev`, the reference to the rest of the list is gone. I had understood this conceptually but not why it caused the exact bug I was seeing. The visual explanation in the response clicked immediately.

## What I'd Do Differently
Next time I would draw the pointer diagram *first*, before writing a single line of code. Trying to hold three pointers in my head at once without a diagram is what caused the mistake.
