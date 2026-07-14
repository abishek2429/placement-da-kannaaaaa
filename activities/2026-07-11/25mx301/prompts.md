# Prompts Log — Day 2

---

## Prompt 1

**Prompt:**
```
Explain why in a linked list reversal I need to save `next = current.next` before reassigning `current.next = prev`
```

**Outcome:** Very helpful. Claude gave a clear sequential explanation showing that once `current.next = prev` executes, the only pointer to the rest of the list is gone. The analogy it used (holding a rope that gets cut if you let go) made it click.

---

## Prompt 2

**Prompt:**
```
Show me the Python implementation of linked list reversal step by step with inline comments explaining each line
```

**Outcome:** Helpful. The commented code matched exactly what I had tried to write, which confirmed my logic was almost right — I just had the `next = current.next` line in the wrong place.

---

## Prompt 3

**Prompt:**
```
What are the edge cases for linked list reversal that I should handle?
```

**Outcome:** Partially helpful. Claude listed empty list and single-node list, which I hadn't thought about. I added both checks to my final solution. It also mentioned circular lists, which isn't relevant here.
