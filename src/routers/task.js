const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

// Create task
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save() 
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

// Read tasks
router.get('/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      owner: req.user._id,
      completed: req.query.completed ? req.query.completed === 'true' : [true, false]
    })
    res.send(tasks)
  } catch (e) {
    res.status(500).send(e)
  }
})

//Read task by id
router.get('/tasks/:id', auth, async (req, res) => {
  const { params: { id } } = req
  try {
    const task = await Task.findOne({ _id: id, owner: req.user._id })
    if (!task)
      res.status(404).send()
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Update task
router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!'})
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

    if (!task)
      return res.status(404).send()
    
    updates.forEach(update => task[update] = req.body[update])
    
    await task.save()
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Delete task
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if (!task)
      return res.status(404).send()
    res.send(task)
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router