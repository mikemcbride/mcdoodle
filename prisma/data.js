const fs = require('fs')
const path = require('path')
const json = fs.readFileSync(path.join(process.cwd(), 'prisma', 'data.json'), 'utf8')
const { polls, questions, submissions, responses } = JSON.parse(json)

const users = [
  {
    first_name: "Mike",
    last_name: "McBride",
    user_name: "mike",
    email: "mike.mcbride@hey.com",
    password: "eca817c049b14e60a6db8d2216d24a57d51a516efa4c21f3ce15d25f1bff015d234261d3b549a591c2ee09e472a26523f2ecb78278120de94588fbc6500a790a"
  },
  {
    first_name: "Becky",
    last_name: "McBride",
    user_name: "becky",
    email: "rmcbride0914@gmail.com",
    password: "7b9d2bf616b84d14616b9d3d4011093088f94e41a846fabc6cb2c1da51eb5578e6b8e6c382a350d34238786d6596751680923a941f65fd0c11f9ee59e460f666"
  },
  {
    first_name: "Carrie",
    last_name: "Bajzath",
    user_name: "carrie",
    email: "carriejas1@gmail.com",
    password: "ff72d5b4682cc221f4312dce3cbd30eb0fa5084e4c01395e16b872c68ad0460ebf8d4a40c3c9800d54a3dfd20ffd6993f32c73fbd40d233d45e0c38449e289c3"
  },
  {
    first_name: "Jim",
    last_name: "Bajzath",
    user_name: "jim",
    email: "bajzathj@yahoo.com",
    password: "ff72d5b4682cc221f4312dce3cbd30eb0fa5084e4c01395e16b872c68ad0460ebf8d4a40c3c9800d54a3dfd20ffd6993f32c73fbd40d233d45e0c38449e289c3"
  },
]

module.exports = {
  polls,
  questions,
  submissions,
  responses,
  users,
};
