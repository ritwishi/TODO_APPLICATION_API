const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const format = require('date-fns/format')
const isMatch = require('date-fns/isMatch')
const app = express()
app.use(express.json())

let db
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, 'todoApplication.db'),
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBandServer()

//api 1

const hasPriorityAndStatusProperties = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasPriorityProperty = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasStatusProperty = requestQuery => {
  return requestQuery.status !== undefined
}

const hasCategoryAndStatus = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  )
}

const hasCategoryAndPriority = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  )
}

const hasSearchProperty = requestQuery => {
  return requestQuery.search_q !== undefined
}

const hasCategoryProperty = requestQuery => {
  return requestQuery.category !== undefined
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status, category} = request.query

  // priority and status
  if (hasPriorityAndStatusProperties(request.query)) {
    if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        getTodosQuery = `
        SELECT 
          id AS id,
          todo AS todo,
          priority AS priority,
          status AS status,
          category AS category,
          due_date AS dueDate
         FROM 
          todo 
        WHERE 
          status = '${status}' 
        AND 
          priority = '${priority}';`

        data = await db.all(getTodosQuery)
        response.send(data)
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  }
  // category and status
  else if (hasCategoryAndStatus(request.query)) {
    if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        getTodosQuery = `
        SELECT 
          id AS id,
          todo AS todo,
          priority AS priority,
          status AS status,
          category AS category,
          due_date AS dueDate 
        FROM
          todo
        WHERE 
          category='${category}' 
        AND 
          status='${status}';`

        data = await db.all(getTodosQuery)
        response.send(data)
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  }
  // category and priority
  else if (hasCategoryAndPriority(request.query)) {
    if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        getTodosQuery = `SELECT 
          id AS id,
          todo AS todo,
          priority AS priority,
          status AS status,
          category AS category,
          due_date AS dueDate 
        FROM 
          todo 
        WHERE 
          category='${category}' 
        AND 
          priority='${priority}';`

        data = await db.all(getTodosQuery)
        response.send(data)
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  }
  //  priority
  else if (hasPriorityProperty(request.query)) {
    if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
      getTodosQuery = `
      SELECT 
          id AS id,
          todo AS todo,
          priority AS priority,
          status AS status,
          category AS category,
          due_date AS dueDate 
      FROM 
        todo 
      WHERE 
        priority = '${priority}';`

      data = await db.all(getTodosQuery)
      response.send(data)
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  }
  // status
  else if (hasStatusProperty(request.query)) {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      getTodosQuery = `SELECT 
        id AS id,
        todo AS todo,
        priority AS priority,
        status AS status,
        category AS category,
        due_date AS dueDate 
      FROM 
        todo 
      WHERE 
        status = '${status}';`

      data = await db.all(getTodosQuery)
      response.send(data)
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  }
  //  search property
  else if (hasSearchProperty(request.query)) {
    getTodosQuery = `
    SELECT 
      id AS id,
      todo AS todo,
      priority AS priority,
      status AS status,
      category AS category,
      due_date AS dueDate
    FROM 
      todo 
    WHERE 
      todo like '%${search_q}%';`

    data = await db.all(getTodosQuery)
    response.send(data)
  }
  //   category
  else if (hasCategoryProperty(request.query)) {
    if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
      getTodosQuery = `
      SELECT 
        id AS id,
        todo AS todo,
        priority AS priority,
        status AS status,
        category AS category,
        due_date AS dueDate 
      FROM 
        todo 
      WHERE 
        category='${category}';`

      data = await db.all(getTodosQuery)
      response.send(data)
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  }
  // default
  else {
    getTodosQuery = `
      SELECT 
        id AS id,
        todo AS todo,
        priority AS priority,
        status AS status,
        category AS category,
        due_date AS dueDate  
      FROM 
        todo;`
    data = await db.all(getTodosQuery)
    response.send(data)
  }
})

// API 2

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getToDoQuery = `
    SELECT 
      id AS id,
      todo AS todo,
      priority AS priority,
      status AS status,
      category AS category,
      due_date AS dueDate 
    FROM 
      todo 
    WHERE 
      id=${todoId};`
  const getResult = await db.get(getToDoQuery)
  response.send(getResult)
})

// API 3

app.get('/agenda/', async (request, response) => {
  const {date} = request.query

  if (isMatch(date, 'yyyy-MM-dd')) {
    const newDate = format(new Date(date), 'yyyy-MM-dd')
    
    const daterequestQuery = `
      SELECT 
        id AS id,
        todo AS todo,
        priority AS priority,
        status AS status,
        category AS category,
        due_date AS dueDate
      FROM 
        todo 
      WHERE 
        due_date='${newDate}';`
    const dateResult = await db.all(daterequestQuery)

    response.send(dateResult)
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

// API 4

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const nextDueDate = format(new Date(dueDate), 'yyyy-MM-dd')
          const nextTodoQuery = `
            INSERT INTO
              todo (id, todo, category,priority, status, due_date)
            VALUES
              (${id}, '${todo}', '${category}','${priority}', '${status}', '${nextDueDate}');`
          await db.run(nextTodoQuery)
          response.send('Todo Successfully Added')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else {
    response.status(400)
    response.send('Invalid Todo Priority')
  }
})

// API 5

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const requestBody = request.body

  const previousTodoQuery = `
    SELECT 
      * 
    FROM
      todo 
    WHERE 
      id = ${todoId};`

  const previousTodo = await db.get(previousTodoQuery)

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body

  let updateTodoQuery

  // status
  if (requestBody.status !== undefined) {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id = ${todoId};`
      await db.run(updateTodoQuery)
      response.send(`Status Updated`)
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  }
  // priority
  else if (requestBody.priority !== undefined) {
    if (priority === 'HIGH' || priority === 'LOW' || priority === 'MEDIUM') {
      updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id = ${todoId};`
      await db.run(updateTodoQuery)
      response.send(`Priority Updated`)
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  }
  // todo
  else if (requestBody.todo !== undefined) {
    updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id = ${todoId};`
    await db.run(updateTodoQuery)
    response.send(`Todo Updated`)
  }
  // category
  else if (requestBody.category !== undefined) {
    if (category === 'WORK' || category === 'HOME' || category === 'LEARNING') {
      updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${dueDate}' WHERE id = ${todoId};`
      await db.run(updateTodoQuery)
      response.send(`Category Updated`)
    } else {
      response.status(400)
      response.send('Invalid Todo Category')
    }
  }
  //  due date
  else if (requestBody.dueDate !== undefined) {
    if (isMatch(dueDate, 'yyyy-MM-dd')) {
      const newDueDate = format(new Date(dueDate), 'yyyy-MM-dd')
      updateTodoQuery = `UPDATE todo SET todo='${todo}', priority='${priority}', status='${status}', category='${category}', due_date='${newDueDate}' WHERE id = ${todoId};`
      await db.run(updateTodoQuery)
      response.send(`Due Date Updated`)
    } else {
      response.status(400)
      response.send('Invalid Due Date')
    }
  }
})

// API 6 -

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`

  await db.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app
