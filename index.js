#!/usr/bin/env node

const chalk = require('chalk')
const clear = require('clear')
const figlet = require('figlet')
const fetch = require('node-fetch')
const log = console.log;
const ora = require('ora')
const { prompt } = require('inquirer')
const { table } = require('table');
const spinner = ora('Loading unicorns')
const fs  = require('fs')

let moment = require('moment')
let program = require('commander')
let nodemailer = require('nodemailer')
let ip = require('ip')

// let ui = new inquirer.ui.BottomBar();
// let loading = new Spinner('Loading...  ', ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']);


/**
 * Chalk themes
 * @desc {[important]} Bold red theme
 * @desc {[cmd]} Bold yellow theme
 * @desc {[title]} Bold green
 */

const important = chalk.red.bold;
const cmd = chalk.yellow.bold;
const title = chalk.bold.green;



//Table variables
let data;
let output;


// 1. NOTE: Add a login system
// 2. NOTE: ADD TIME UNTIL DEADLINE in EMAIL
// 3. NOTE: ADD TIME SINCE ITEM ADDED IN EMAIL
// 4. NOTE:Make email template https://email-templates.js.org/#/?id=automatic-inline-css-via-stylesheets




clear()

/**
 * Creates timestamp
 * @return {[array]} [mm-dd-yyyy]
 */
const tStamp = () => {
  const dateArr = []
  const now = moment()
  dateArr.push(now.get('year'))
  dateArr.push(now.get('month'))
  dateArr.push(now.get('date'))
  return dateArr
}

const tStamper = () => {
  const dateArr = []
  const now = moment()
  dateArr.push(now.get('month'))
  dateArr.push(now.get('date'))
  dateArr.push(now.get('year'))
  dateArr.push(now.get('hour') + ':' + now.get('minute'))
  return dateArr.join('-')
}


//Gets time from two dates
const timeSince = (timestamp, timenow) => {
  let a = moment(timestamp, ["MM-DD-YYYY", "YYYY-MM-DD"]);
  let b = moment(timenow, ["MM-DD-YYYY", "YYYY-MM-DD"]);
  let itsbeen = a.from(b)


  if (itsbeen == 'a few seconds ago') {
    return 'today'
  } else {
    return itsbeen
  }
}


//Url's to the webapp
const baseUrl = "https://clist.glitch.me/"
const urlShow = baseUrl + "getListItems"
const urlBob = baseUrl + "bob"
const urlDel = baseUrl + "delItemList"
const urlIte = baseUrl + "delItem"
const urlUlist = baseUrl + "ulist"
const urldescC = baseUrl + "desc"
const urlName = baseUrl + "name"
const urlDue = baseUrl + "due"
const urlUsr = baseUrl + "usr"
const urlNusr = baseUrl + "nusr"
const urlMail = baseUrl + "mail"


if (process.argv.length < 3) {
  log(
    chalk.magenta(
      figlet.textSync('Clist', {
        horizontalLayout: 'full'
      })
    ))
  log(important('\n' + ' type clist --help for a list of available commands'))
}




//Inquirer questions to be asked when adding an item

const questions = [{
    type: 'input',
    name: 'name',
    message: 'Enter a name for the item:  ',
    validate: function validateDescrip(name) {
      if (name == '') {
        return 'This item cannot be empty'
      } else {
        return true
      }
    }
  },
  {
    type: 'input',
    name: 'desc',
    message: 'Enter a description of the item:  ',
    validate: function validateDescrip(desc) {
      if (desc == '') {
        return 'This item cannot be empty'
      } else {
        return true
      }
    }
  },
  {
    type: 'input',
    name: 'due',
    message: 'Enter the due date in mm-dd-yyyy form:  ',
    validate: function validateDate(due) {
      if (!/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/.test(due)) {
        return 'Invalid date format'
      } else {
        return true
      }

    }
  },

]



/**
 * Shows current to-do list.
 */
const showList = () => {
  clear()
  spinner.start()
  fetch(urlShow)
    .then(function(response) {

      return response.json();
    })
    .then(function(myJson) {


      let data = [

      ]

      myJson.map(e => data.push(Object.values(e)))
      data.forEach(f => {
        f.shift()
      })
      data.forEach(x => x[x.length - 2] = 'You added this item ' + important(timeSince(x[x.length - 2], tStamp())))
      data.forEach(y => y[0] = title(y[0]))
      data.unshift(['Name', 'Description', 'Due Date', 'Time since', 'Username'])


      output = table(data)
      spinner.stop()
      clear()
      log(
        chalk.magenta(
          figlet.textSync('Your list :D', {
            horizontalLayout: 'full'
          })
        ))
      log(output)

    });
}

/**
 * Deletes an item from the to-do list.
 */
const deleteItem = () => {
  log(
    chalk.magenta(
      figlet.textSync('Clist', {
        horizontalLayout: 'full'
      })
    ))
  clear()

  fetch(urlDel)
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      let datArr = []
      let secArr = []

      myJson.map(f => datArr.push(Object.values(f)))
      datArr.map(x => secArr.push(x.join(' ')))

      const delQuestions = [{
        type: 'list',
        name: 'itemtoDel',
        message: 'What item do you want to delete?',
        choices: secArr
      }]

      prompt(delQuestions).then(responses => {

        return responses
      }).then(rez => {

        let ans = rez.itemtoDel[0];

        deleteItemm(urlIte, rez)
          .then(data => console.log(data)) // JSON from `response.json()` call
          .catch(error => console.error(error));
      })


    });

}

const emailQs = [
  {
    type: 'input',
    name: 'ema',
    message: 'Enter the email recipient of your to-do list: ',
  },
  {
    type: 'confirm',
    name: 'anothaOne',
    message: 'Would you like to enter another recipient?',
    default: true
  }

]


const emailThem = () =>{
  let addressBook = []
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'clist.bot.bot@gmail.com',
      pass: 'Clistmailer1!'
    }
  })


  clear()
  prompt(emailQs).then(ans =>{
    addressBook.push(ans.ema)
    if(ans.anothaOne){
      emailThem()
    } else{


      fetch(urlShow)
        .then(function(response) {

          return response.json();
        })
        .then(function(myJson) {
          let html = []
          myJson.map(e => html.push('<strong>• ' + e.name  + '</strong>','   ' + e.due_date + '<br>'))
          // html.forEach((a, i, e) => e[i] = '<strong>' + e[i] + '</strong><br>')
          log(html)
          let normalMessage = "This is your current list of things you gotta get done!<br>"

          const mailOptions = {
            from: 'Clist bot <clist@mail.com>',
            to: addressBook,
            subject: 'A message from  ' + tStamper(),
            html: normalMessage + html.join('')
          };

          transporter.sendMail(mailOptions, function (err, info) {
            if(err)
            console.log(err)
            else
            console.log(info);
          });

        })



    }
  })


}




/**
 * Update an item in your to-do list
 * @return {[string]} Successfully updated item
 */
const updateItem = () => {
  clear()

  fetch(urlUlist)
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      let datArr = []
      let secArr = []


      myJson.map(f => datArr.push(Object.values(f)))
      // log(datArr)
      datArr.map(g => {
        g[1] = cmd(g[1] + " |")
      })
      datArr.map(x => secArr.push(x.join(' ')))


      const upQuestions = [{
          type: 'list',
          name: 'itemChoice',
          message: 'What item do you want to delete?',
          choices: secArr
        },
        {
          type: 'list',
          name: 'itemtoChange',
          message: 'What are you changing?',
          choices: ['name', 'description', 'due date', 'username']
        },
        {
          type: 'input',
          name: 'updatedC',
          message: 'Enter the new content',
          validate: function validateDate(due) {
            if (Number(due[0])) {
              if (!/^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/.test(due)) {
                return 'Invalid date format'
              } else {
                return true
              }
            } else {
              if (due == '') {
                return 'This item cannot be empty'
              } else {
                return true
              }
            }
          }
        }
      ]

      prompt(upQuestions).then(responses => {
        return responses
      }).then(rez => {
        log(rez)
        if (rez.itemtoChange == 'description') {
          ur = urldescC
        }
        if (rez.itemtoChange == 'name') {
          ur = urlName
        }
        if (rez.itemtoChange == 'due date') {
          ur = urlDue
        }
        if (rez.itemtoChange == 'username') {
          ur = urlUsr
        }
        deleteItemm(ur, rez)
          .then(data => console.log(data)) // JSON from `response.json()` call
          .catch(error => console.error(error));
      })
    })
}

// User questions
// Check if current ip address exists in db, if not proceed
// Question: what's your email,
// send to db: email + ip address (given automatically)



const newUsr = () => {

}



/**
 * Send item to server to be added to db
 * @param  {[url to server]} url       [Where it's being sent]
 * @param  {Object} [data={}] [Item to be added based off of inquirer q's]
 * @return {[string]}           [Successful or an error]
 */
const postData = (url, data = {}) => {
  console.log(JSON.stringify(data))
  return fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      redirect: "follow",
      referrer: "no-referrer",
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .catch(error => console.error(`Fetch Error =\n`, error));
}


/**
 * Send id of already existing item to server to be be deleted from to-do list
 * @param  {[url to server]} url       [Where it's being sent]
 * @param  {Object} [data={}] [Item id to be delted]
 * @return {[string]}           [Successful or an error]
 */
const deleteItemm = (url, data = {}) => {
  console.log(JSON.stringify(data))
  return fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      redirect: "follow",
      referrer: "no-referrer",
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .catch(error => console.error(`Fetch Error =\n`, error));
}



const emailList = (url, data = {}) => {
  console.log(JSON.stringify(data))
  return fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      redirect: "follow",
      referrer: "no-referrer",
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .catch(error => console.error(`Fetch Error =\n`, error));
}
/**
 * Delete command
 * @type {String}
 */
program
  .command('delete')
  .alias('d')
  .description('Delete an item from your to-do list')
  .action(() => {
    deleteItem()
  })



/**
 * 1. Would you like to email your list just to yourself, or to multiple parties?
 * 2. If self, ask for user to enter their username, and get email that's tied to it and email them there.
 *  a. Need to get all list items with the show items function
 * 3. If multiple parties, use inquirer to get them all, comma seperated list or array of emails.
 */

program
  .command('email')
  .alias('e')
  .description('Email your to-do list to youself and others!')
  .action(() =>{
    emailThem()



  })

/**
 * Add item command
 * @type {String}
 */
program
  .command('addItem')
  .alias('a')
  .description('Add an item to your to_do list')
  .action(() => {

    clear()
    prompt(questions).then(answers => {
      return answers
    }).then(ansData => {

      let ans = {
        'name': 0,
        'desc': 0,
        'due': 0,
        'ip': ip.address()
      }
      ans.name = ansData.name
      ans.desc = ansData.desc
      ans.due = ansData.due
      ans.ip = ansData.usr

      // log(ans)
      postData(urlBob, ans)
        .then(data => console.log(data)) // JSON from `response.json()` call
        .catch(error => console.error(error));


    })


  })

/**
 * List command
 * @type {[string]}
 */
program
  .command('list')
  .alias('s')
  .action(() => {

    showList()

  })

/**
 * Modify a to-do list item
 * @type {[string]}
 */
program
  .command('modify')
  .alias('m')
  .action(() => {
    updateItem()
  })


/**
 * Checks for invalid commands
 * @return {[error]} [throws error if user enters invalid/unrecognized command]
 */
program.on('command:*', function() {
  console.error(important('Invalid command: %s\nSee --help for a list of available commands.'), program.args.join(' '));
  process.exit(1);
});
program.parse(process.argv)
