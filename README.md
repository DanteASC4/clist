### Note: This is still a big work in progress!
---

# Clist


### TOC
---
- Description of Clist
- List of current functionality
- WIP / Goals
- Function documentation

### Description
---
Why is the npm package called cli-list if it's called clist? Because clist is taken!
Clist is a command line interface / application for creating to-do lists by communicating with a webhosted sql database.
Why a CLI? I wanted to make something that would be fast, and wouldn't require much loading. Something that you could use
inbetween git pushes to check on what you still need to get done, or after a break if you've forgotten what you're working on,
even to start off the morning and get going quickly. Currently the Functionality is limited to me, as it's setup to communicate with one database.
I of course want to make this available for use for anyone, but I've gotta get everything working first.



### Current Functionality
---
- Display to-do list items
- Add items to your list
- Update items in your list
- Remove items from your list
- Email your list to one or more person
- Displays time since, in days, an item was added to the list



### WIP
---
#### Short-term larger scale changes
- Login system
- Daily email

#### Minor changes
- Display time remaining until due-date
- Display current time
- Display date item was added in time since column
- Get rid of username column from modify command
- Make email function more dynamic
  - If user says yes to wanting to add more recipients, askes for how many more, and then does for i in num_of_recipients etc...
- Make a better "item has been received response"

#### Long term
- All in one bundle, download and becomes useable
- Users have separate to-do lists
  - Maybe allow users to have more than one to-do list,



## Functions
---

##### Show list items
```javascript
clist s
```
List is then printed to the console, in a table, certain values are highlighted for clarity.

---

##### Add item to list
```javascript
clist a
// User is then prompted with the following questions:
"Name of item"
"Description of item"
"Due date: must be in mm/dd/yyyy format"
"Time since automatically generated"
```
Item is then sent and added to list

---

##### Modify list item
```javascript
clist m
//User then chooses item to be modified, and then the column value for said item they'd like to change, and prompted for the new value.
```
Item is then modified in database

----

##### Delete list item
```javascript
clist d
//User then chooses item to be deleted.
```
Item is then deleted from the database. ** Cannot be undone **

---

##### Email list items
```javascript
clist e
//User is prompted for email, and then asked if they'd to add more like more email addresses
```
Entered recipients are then emailed the entire to-do list

---
