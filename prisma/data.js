const fs = require('fs')
const path = require('path')
const json = fs.readFileSync(path.join(process.cwd(), 'prisma', 'data.json'), 'utf8')
const { polls, questions, submissions, responses } = JSON.parse(json)

// manually export users if you need them, then add them here.
const users = []

module.exports = {
  polls,
  questions,
  submissions,
  responses,
  users,
};
