const { Prisma } = require('@prisma/client');

const polls = [
  {
    "title": "May TOOL - Team 14",
    "status": "open",
    "description": ""
  },
  {
    "title": "January 2023 TOOLS Meeting - Team 9",
    "status": "open",
    "description": "Let's see when we can meet in January"
  },
  {
    "title": "February 2023 TOOLS Meeting - Team 9",
    "status": "open",
    "description": "Let see when we can meet in Feb"
  },
  {
    "title": "March TOOL - Team 14",
    "status": "open",
    "description": ""
  },
  {
    "title": "February TOOL - Team 14",
    "status": "open",
    "description": ""
  },
  {
    "title": "January TOOL - Team 14",
    "status": "open",
    "description": ""
  },
  {
    "title": "April TOOL - Team 14",
    "status": "open",
    "description": ""
  }
]
const questions = [
  {
    "value": "2023-01-13",
    "poll_id": 2
  },
  {
    "value": "2023-02-03",
    "poll_id": 3
  },
  {
    "value": "2023-01-28",
    "poll_id": 2
  },
  {
    "value": "2023-05-19",
    "poll_id": 1
  },
  {
    "value": "2023-05-12",
    "poll_id": 1
  },
  {
    "value": "2023-04-08",
    "poll_id": 7
  },
  {
    "value": "2023-04-21",
    "poll_id": 7
  },
  {
    "value": "2023-01-21",
    "poll_id": 6
  },
  {
    "value": "2023-03-04",
    "poll_id": 4
  },
  {
    "value": "2023-02-17",
    "poll_id": 5
  },
  {
    "value": "2023-01-21",
    "poll_id": 2
  },
  {
    "value": "2023-01-20",
    "poll_id": 6
  },
  {
    "value": "2023-05-20",
    "poll_id": 1
  },
  {
    "value": "2023-04-14",
    "poll_id": 7
  },
  {
    "value": "2023-01-06",
    "poll_id": 6
  },
  {
    "value": "2023-03-18",
    "poll_id": 4
  },
  {
    "value": "2023-01-27",
    "poll_id": 2
  },
  {
    "value": "2023-03-24",
    "poll_id": 4
  },
  {
    "value": "2023-02-04",
    "poll_id": 5
  },
  {
    "value": "2023-05-05",
    "poll_id": 1
  },
  {
    "value": "2023-05-26",
    "poll_id": 1
  },
  {
    "value": "2023-04-01",
    "poll_id": 7
  },
  {
    "value": "2023-02-24",
    "poll_id": 3
  },
  {
    "value": "2023-03-03",
    "poll_id": 4
  },
  {
    "value": "2023-02-11",
    "poll_id": 5
  },
  {
    "value": "2023-01-20",
    "poll_id": 2
  },
  {
    "value": "2023-02-18",
    "poll_id": 3
  },
  {
    "value": "2023-02-18",
    "poll_id": 5
  },
  {
    "value": "2023-01-07",
    "poll_id": 6
  },
  {
    "value": "2023-01-27",
    "poll_id": 6
  },
  {
    "value": "2023-04-22",
    "poll_id": 7
  },
  {
    "value": "2023-01-13",
    "poll_id": 6
  },
  {
    "value": "2023-04-29",
    "poll_id": 7
  },
  {
    "value": "2023-05-06",
    "poll_id": 1
  },
  {
    "value": "2023-02-25",
    "poll_id": 3
  },
  {
    "value": "2023-01-28",
    "poll_id": 6
  },
  {
    "value": "2023-03-10",
    "poll_id": 4
  },
  {
    "value": "2023-02-17",
    "poll_id": 3
  },
  {
    "value": "2023-02-04",
    "poll_id": 3
  },
  {
    "value": "2023-04-07",
    "poll_id": 7
  },
  {
    "value": "2023-04-15",
    "poll_id": 7
  },
  {
    "value": "2023-02-25",
    "poll_id": 5
  },
  {
    "value": "2023-01-07",
    "poll_id": 2
  },
  {
    "value": "2023-03-25",
    "poll_id": 4
  },
  {
    "value": "2023-04-28",
    "poll_id": 7
  },
  {
    "value": "2023-02-11",
    "poll_id": 3
  },
  {
    "value": "2023-03-17",
    "poll_id": 4
  },
  {
    "value": "2023-02-24",
    "poll_id": 5
  },
  {
    "value": "2023-02-10",
    "poll_id": 5
  },
  {
    "value": "2023-02-03",
    "poll_id": 5
  },
  {
    "value": "2023-01-14",
    "poll_id": 2
  },
  {
    "value": "2023-01-14",
    "poll_id": 6
  },
  {
    "value": "2023-01-06",
    "poll_id": 2
  },
  {
    "value": "2023-05-27",
    "poll_id": 1
  },
  {
    "value": "2023-05-13",
    "poll_id": 1
  },
  {
    "value": "2023-03-31",
    "poll_id": 4
  },
  {
    "value": "2023-02-10",
    "poll_id": 3
  },
  {
    "value": "2023-03-11",
    "poll_id": 4
  }
]
const submissions = [
  {
    "person": "Wills",
    "poll_id": 4
  },
  {
    "person": "Banners",
    "poll_id": 4
  },
  {
    "person": "Beltz",
    "poll_id": 1
  },
  {
    "person": "Fosters",
    "poll_id": 2
  },
  {
    "person": "Danica",
    "poll_id": 2
  },
  {
    "person": "Fosters",
    "poll_id": 3
  },
  {
    "person": "Dan",
    "poll_id": 3
  },
  {
    "person": "Wills",
    "poll_id": 5
  },
  {
    "person": "McBrides",
    "poll_id": 1
  },
  {
    "person": "Zaegels",
    "poll_id": 2
  },
  {
    "person": "Zaegels",
    "poll_id": 3
  },
  {
    "person": "McBrides",
    "poll_id": 6
  },
  {
    "person": "Zaegel",
    "poll_id": 5
  },
  {
    "person": "Banner",
    "poll_id": 5
  },
  {
    "person": "Banners",
    "poll_id": 1
  },
  {
    "person": "Zaegel",
    "poll_id": 7
  },
  {
    "person": "Hamer",
    "poll_id": 3
  },
  {
    "person": "Wills",
    "poll_id": 1
  },
  {
    "person": "Beltz",
    "poll_id": 4
  },
  {
    "person": "McBrides",
    "poll_id": 7
  },
  {
    "person": "Lancias",
    "poll_id": 3
  },
  {
    "person": "Dalys",
    "poll_id": 4
  },
  {
    "person": "Dalys",
    "poll_id": 7
  },
  {
    "person": "McBrides",
    "poll_id": 5
  },
  {
    "person": "Danica",
    "poll_id": 3
  },
  {
    "person": "Dalys",
    "poll_id": 5
  },
  {
    "person": "Wills",
    "poll_id": 6
  },
  {
    "person": "Zaegel",
    "poll_id": 6
  },
  {
    "person": "Zaegel",
    "poll_id": 1
  },
  {
    "person": "Beltz",
    "poll_id": 7
  },
  {
    "person": "Zaegel",
    "poll_id": 4
  },
  {
    "person": "Dan",
    "poll_id": 2
  },
  {
    "person": "Hermanns",
    "poll_id": 6
  },
  {
    "person": "Dalys",
    "poll_id": 6
  },
  {
    "person": "Hamer",
    "poll_id": 2
  },
  {
    "person": "Lancias",
    "poll_id": 2
  },
  {
    "person": "Dalys",
    "poll_id": 1
  },
  {
    "person": "Beltz",
    "poll_id": 5
  },
  {
    "person": "Beltz",
    "poll_id": 6
  },
  {
    "person": "Banners",
    "poll_id": 7
  },
  {
    "person": "McBrides",
    "poll_id": 4
  },
  {
    "person": "Banners",
    "poll_id": 6
  },
  {
    "person": "Wills",
    "poll_id": 7
  }
]
const responses = [
  {
    "value": "if_needed",
    "question_id": 14,
    "submission_id": 30
  },
  {
    "value": "yes",
    "question_id": 1,
    "submission_id": 5
  },
  {
    "value": "yes",
    "question_id": 11,
    "submission_id": 10
  },
  {
    "value": "if_needed",
    "question_id": 44,
    "submission_id": 2
  },
  {
    "value": "if_needed",
    "question_id": 26,
    "submission_id": 36
  },
  {
    "value": "no",
    "question_id": 50,
    "submission_id": 8
  },
  {
    "value": "yes",
    "question_id": 2,
    "submission_id": 11
  },
  {
    "value": "yes",
    "question_id": 44,
    "submission_id": 1
  },
  {
    "value": "yes",
    "question_id": 21,
    "submission_id": 15
  },
  {
    "value": "no",
    "question_id": 42,
    "submission_id": 14
  },
  {
    "value": "no",
    "question_id": 10,
    "submission_id": 14
  },
  {
    "value": "if_needed",
    "question_id": 7,
    "submission_id": 16
  },
  {
    "value": "if_needed",
    "question_id": 20,
    "submission_id": 9
  },
  {
    "value": "if_needed",
    "question_id": 14,
    "submission_id": 40
  },
  {
    "value": "if_needed",
    "question_id": 27,
    "submission_id": 11
  },
  {
    "value": "yes",
    "question_id": 14,
    "submission_id": 23
  },
  {
    "value": "yes",
    "question_id": 43,
    "submission_id": 10
  },
  {
    "value": "no",
    "question_id": 14,
    "submission_id": 16
  },
  {
    "value": "yes",
    "question_id": 27,
    "submission_id": 6
  },
  {
    "value": "yes",
    "question_id": 45,
    "submission_id": 23
  },
  {
    "value": "if_needed",
    "question_id": 57,
    "submission_id": 7
  },
  {
    "value": "if_needed",
    "question_id": 53,
    "submission_id": 36
  },
  {
    "value": "yes",
    "question_id": 12,
    "submission_id": 27
  },
  {
    "value": "yes",
    "question_id": 48,
    "submission_id": 13
  },
  {
    "value": "yes",
    "question_id": 7,
    "submission_id": 30
  },
  {
    "value": "yes",
    "question_id": 16,
    "submission_id": 1
  },
  {
    "value": "if_needed",
    "question_id": 42,
    "submission_id": 8
  },
  {
    "value": "yes",
    "question_id": 35,
    "submission_id": 7
  },
  {
    "value": "if_needed",
    "question_id": 51,
    "submission_id": 10
  },
  {
    "value": "yes",
    "question_id": 52,
    "submission_id": 34
  },
  {
    "value": "no",
    "question_id": 19,
    "submission_id": 24
  },
  {
    "value": "yes",
    "question_id": 24,
    "submission_id": 22
  },
  {
    "value": "yes",
    "question_id": 42,
    "submission_id": 26
  },
  {
    "value": "no",
    "question_id": 24,
    "submission_id": 41
  },
  {
    "value": "if_needed",
    "question_id": 20,
    "submission_id": 18
  },
  {
    "value": "yes",
    "question_id": 3,
    "submission_id": 5
  },
  {
    "value": "if_needed",
    "question_id": 55,
    "submission_id": 18
  },
  {
    "value": "yes",
    "question_id": 28,
    "submission_id": 26
  },
  {
    "value": "yes",
    "question_id": 50,
    "submission_id": 38
  },
  {
    "value": "yes",
    "question_id": 13,
    "submission_id": 37
  },
  {
    "value": "yes",
    "question_id": 53,
    "submission_id": 5
  },
  {
    "value": "if_needed",
    "question_id": 26,
    "submission_id": 35
  },
  {
    "value": "if_needed",
    "question_id": 14,
    "submission_id": 43
  },
  {
    "value": "yes",
    "question_id": 58,
    "submission_id": 2
  },
  {
    "value": "yes",
    "question_id": 8,
    "submission_id": 12
  },
  {
    "value": "yes",
    "question_id": 39,
    "submission_id": 17
  },
  {
    "value": "yes",
    "question_id": 37,
    "submission_id": 41
  },
  {
    "value": "yes",
    "question_id": 10,
    "submission_id": 24
  },
  {
    "value": "yes",
    "question_id": 48,
    "submission_id": 8
  },
  {
    "value": "yes",
    "question_id": 52,
    "submission_id": 28
  },
  {
    "value": "yes",
    "question_id": 25,
    "submission_id": 8
  },
  {
    "value": "if_needed",
    "question_id": 1,
    "submission_id": 36
  },
  {
    "value": "yes",
    "question_id": 24,
    "submission_id": 19
  },
  {
    "value": "yes",
    "question_id": 1,
    "submission_id": 4
  },
  {
    "value": "yes",
    "question_id": 33,
    "submission_id": 43
  },
  {
    "value": "yes",
    "question_id": 39,
    "submission_id": 21
  },
  {
    "value": "no",
    "question_id": 13,
    "submission_id": 15
  },
  {
    "value": "no",
    "question_id": 46,
    "submission_id": 17
  },
  {
    "value": "yes",
    "question_id": 45,
    "submission_id": 30
  },
  {
    "value": "no",
    "question_id": 5,
    "submission_id": 3
  },
  {
    "value": "yes",
    "question_id": 17,
    "submission_id": 10
  },
  {
    "value": "yes",
    "question_id": 52,
    "submission_id": 39
  },
  {
    "value": "no",
    "question_id": 41,
    "submission_id": 43
  },
  {
    "value": "yes",
    "question_id": 15,
    "submission_id": 42
  },
  {
    "value": "no",
    "question_id": 41,
    "submission_id": 40
  },
  {
    "value": "yes",
    "question_id": 53,
    "submission_id": 10
  },
  {
    "value": "if_needed",
    "question_id": 47,
    "submission_id": 41
  },
  {
    "value": "yes",
    "question_id": 39,
    "submission_id": 11
  },
  {
    "value": "if_needed",
    "question_id": 52,
    "submission_id": 42
  },
  {
    "value": "yes",
    "question_id": 45,
    "submission_id": 43
  },
  {
    "value": "yes",
    "question_id": 24,
    "submission_id": 31
  },
  {
    "value": "yes",
    "question_id": 31,
    "submission_id": 43
  },
  {
    "value": "yes",
    "question_id": 18,
    "submission_id": 22
  },
  {
    "value": "yes",
    "question_id": 2,
    "submission_id": 25
  },
  {
    "value": "if_needed",
    "question_id": 55,
    "submission_id": 15
  },
  {
    "value": "no",
    "question_id": 54,
    "submission_id": 15
  },
  {
    "value": "yes",
    "question_id": 22,
    "submission_id": 40
  },
  {
    "value": "yes",
    "question_id": 43,
    "submission_id": 4
  },
  {
    "value": "yes",
    "question_id": 28,
    "submission_id": 13
  },
  {
    "value": "yes",
    "question_id": 33,
    "submission_id": 23
  },
  {
    "value": "yes",
    "question_id": 51,
    "submission_id": 4
  },
  {
    "value": "yes",
    "question_id": 46,
    "submission_id": 7
  },
  {
    "value": "yes",
    "question_id": 8,
    "submission_id": 28
  },
  {
    "value": "no",
    "question_id": 6,
    "submission_id": 23
  },
  {
    "value": "yes",
    "question_id": 50,
    "submission_id": 26
  },
  {
    "value": "yes",
    "question_id": 36,
    "submission_id": 28
  },
  {
    "value": "yes",
    "question_id": 5,
    "submission_id": 15
  },
  {
    "value": "yes",
    "question_id": 4,
    "submission_id": 3
  },
  {
    "value": "yes",
    "question_id": 57,
    "submission_id": 11
  },
  {
    "value": "no",
    "question_id": 15,
    "submission_id": 34
  },
  {
    "value": "yes",
    "question_id": 15,
    "submission_id": 33
  },
  {
    "value": "no",
    "question_id": 6,
    "submission_id": 30
  },
  {
    "value": "no",
    "question_id": 12,
    "submission_id": 42
  },
  {
    "value": "yes",
    "question_id": 2,
    "submission_id": 6
  },
  {
    "value": "no",
    "question_id": 28,
    "submission_id": 14
  },
  {
    "value": "yes",
    "question_id": 8,
    "submission_id": 39
  },
  {
    "value": "yes",
    "question_id": 12,
    "submission_id": 39
  },
  {
    "value": "yes",
    "question_id": 33,
    "submission_id": 40
  },
  {
    "value": "yes",
    "question_id": 8,
    "submission_id": 34
  },
  {
    "value": "yes",
    "question_id": 20,
    "submission_id": 3
  },
  {
    "value": "yes",
    "question_id": 16,
    "submission_id": 22
  },
  {
    "value": "yes",
    "question_id": 5,
    "submission_id": 9
  },
  {
    "value": "yes",
    "question_id": 36,
    "submission_id": 42
  },
  {
    "value": "yes",
    "question_id": 28,
    "submission_id": 24
  },
  {
    "value": "if_needed",
    "question_id": 17,
    "submission_id": 35
  },
  {
    "value": "yes",
    "question_id": 47,
    "submission_id": 22
  },
  {
    "value": "yes",
    "question_id": 41,
    "submission_id": 23
  },
  {
    "value": "yes",
    "question_id": 49,
    "submission_id": 14
  },
  {
    "value": "if_needed",
    "question_id": 20,
    "submission_id": 15
  },
  {
    "value": "if_needed",
    "question_id": 21,
    "submission_id": 37
  },
  {
    "value": "yes",
    "question_id": 48,
    "submission_id": 24
  },
  {
    "value": "if_needed",
    "question_id": 38,
    "submission_id": 17
  },
  {
    "value": "no",
    "question_id": 10,
    "submission_id": 8
  },
  {
    "value": "if_needed",
    "question_id": 16,
    "submission_id": 41
  },
  {
    "value": "no",
    "question_id": 18,
    "submission_id": 31
  },
  {
    "value": "no",
    "question_id": 53,
    "submission_id": 32
  },
  {
    "value": "if_needed",
    "question_id": 53,
    "submission_id": 35
  },
  {
    "value": "yes",
    "question_id": 49,
    "submission_id": 13
  },
  {
    "value": "no",
    "question_id": 9,
    "submission_id": 1
  },
  {
    "value": "no",
    "question_id": 15,
    "submission_id": 12
  },
  {
    "value": "yes",
    "question_id": 36,
    "submission_id": 12
  },
  {
    "value": "yes",
    "question_id": 55,
    "submission_id": 37
  },
  {
    "value": "yes",
    "question_id": 26,
    "submission_id": 5
  },
  {
    "value": "yes",
    "question_id": 30,
    "submission_id": 28
  },
  {
    "value": "yes",
    "question_id": 13,
    "submission_id": 3
  },
  {
    "value": "yes",
    "question_id": 27,
    "submission_id": 25
  },
  {
    "value": "yes",
    "question_id": 56,
    "submission_id": 22
  },
  {
    "value": "if_needed",
    "question_id": 23,
    "submission_id": 21
  },
  {
    "value": "yes",
    "question_id": 7,
    "submission_id": 40
  },
  {
    "value": "if_needed",
    "question_id": 23,
    "submission_id": 17
  },
  {
    "value": "yes",
    "question_id": 31,
    "submission_id": 23
  },
  {
    "value": "yes",
    "question_id": 31,
    "submission_id": 20
  },
  {
    "value": "yes",
    "question_id": 50,
    "submission_id": 24
  },
  {
    "value": "yes",
    "question_id": 13,
    "submission_id": 9
  },
  {
    "value": "yes",
    "question_id": 48,
    "submission_id": 14
  },
  {
    "value": "yes",
    "question_id": 43,
    "submission_id": 36
  },
  {
    "value": "yes",
    "question_id": 29,
    "submission_id": 12
  },
  {
    "value": "yes",
    "question_id": 35,
    "submission_id": 6
  },
  {
    "value": "no",
    "question_id": 1,
    "submission_id": 35
  },
  {
    "value": "yes",
    "question_id": 42,
    "submission_id": 38
  },
  {
    "value": "yes",
    "question_id": 56,
    "submission_id": 31
  },
  {
    "value": "yes",
    "question_id": 20,
    "submission_id": 37
  },
  {
    "value": "if_needed",
    "question_id": 14,
    "submission_id": 20
  },
  {
    "value": "yes",
    "question_id": 18,
    "submission_id": 19
  },
  {
    "value": "no",
    "question_id": 29,
    "submission_id": 27
  },
  {
    "value": "yes",
    "question_id": 49,
    "submission_id": 26
  },
  {
    "value": "yes",
    "question_id": 22,
    "submission_id": 23
  },
  {
    "value": "yes",
    "question_id": 57,
    "submission_id": 25
  },
  {
    "value": "yes",
    "question_id": 30,
    "submission_id": 39
  },
  {
    "value": "yes",
    "question_id": 36,
    "submission_id": 34
  },
  {
    "value": "yes",
    "question_id": 32,
    "submission_id": 28
  },
  {
    "value": "if_needed",
    "question_id": 26,
    "submission_id": 32
  },
  {
    "value": "yes",
    "question_id": 11,
    "submission_id": 36
  },
  {
    "value": "no",
    "question_id": 46,
    "submission_id": 21
  },
  {
    "value": "if_needed",
    "question_id": 47,
    "submission_id": 1
  },
  {
    "value": "no",
    "question_id": 41,
    "submission_id": 20
  },
  {
    "value": "yes",
    "question_id": 37,
    "submission_id": 1
  },
  {
    "value": "if_needed",
    "question_id": 54,
    "submission_id": 9
  },
  {
    "value": "yes",
    "question_id": 38,
    "submission_id": 6
  },
  {
    "value": "no",
    "question_id": 13,
    "submission_id": 29
  },
  {
    "value": "if_needed",
    "question_id": 19,
    "submission_id": 14
  },
  {
    "value": "if_needed",
    "question_id": 18,
    "submission_id": 41
  },
  {
    "value": "yes",
    "question_id": 37,
    "submission_id": 22
  },
  {
    "value": "if_needed",
    "question_id": 34,
    "submission_id": 18
  },
  {
    "value": "yes",
    "question_id": 25,
    "submission_id": 24
  },
  {
    "value": "yes",
    "question_id": 8,
    "submission_id": 42
  },
  {
    "value": "no",
    "question_id": 24,
    "submission_id": 1
  },
  {
    "value": "yes",
    "question_id": 21,
    "submission_id": 3
  },
  {
    "value": "yes",
    "question_id": 56,
    "submission_id": 1
  },
  {
    "value": "yes",
    "question_id": 55,
    "submission_id": 9
  },
  {
    "value": "yes",
    "question_id": 29,
    "submission_id": 28
  },
  {
    "value": "yes",
    "question_id": 43,
    "submission_id": 5
  },
  {
    "value": "if_needed",
    "question_id": 2,
    "submission_id": 17
  },
  {
    "value": "yes",
    "question_id": 10,
    "submission_id": 38
  },
  {
    "value": "yes",
    "question_id": 12,
    "submission_id": 34
  },
  {
    "value": "yes",
    "question_id": 23,
    "submission_id": 11
  },
  {
    "value": "if_needed",
    "question_id": 16,
    "submission_id": 2
  },
  {
    "value": "yes",
    "question_id": 18,
    "submission_id": 1
  },
  {
    "value": "yes",
    "question_id": 36,
    "submission_id": 39
  },
  {
    "value": "no",
    "question_id": 15,
    "submission_id": 27
  },
  {
    "value": "if_needed",
    "question_id": 5,
    "submission_id": 18
  },
  {
    "value": "yes",
    "question_id": 44,
    "submission_id": 22
  },
  {
    "value": "yes",
    "question_id": 23,
    "submission_id": 6
  },
  {
    "value": "yes",
    "question_id": 12,
    "submission_id": 33
  },
  {
    "value": "yes",
    "question_id": 35,
    "submission_id": 21
  },
  {
    "value": "yes",
    "question_id": 12,
    "submission_id": 28
  },
  {
    "value": "if_needed",
    "question_id": 49,
    "submission_id": 24
  },
  {
    "value": "yes",
    "question_id": 33,
    "submission_id": 20
  },
  {
    "value": "yes",
    "question_id": 58,
    "submission_id": 41
  },
  {
    "value": "yes",
    "question_id": 32,
    "submission_id": 39
  },
  {
    "value": "yes",
    "question_id": 51,
    "submission_id": 32
  },
  {
    "value": "yes",
    "question_id": 16,
    "submission_id": 31
  },
  {
    "value": "if_needed",
    "question_id": 32,
    "submission_id": 42
  },
  {
    "value": "yes",
    "question_id": 54,
    "submission_id": 29
  },
  {
    "value": "yes",
    "question_id": 17,
    "submission_id": 4
  },
  {
    "value": "yes",
    "question_id": 46,
    "submission_id": 6
  },
  {
    "value": "yes",
    "question_id": 34,
    "submission_id": 29
  },
  {
    "value": "yes",
    "question_id": 7,
    "submission_id": 23
  },
  {
    "value": "yes",
    "question_id": 52,
    "submission_id": 27
  },
  {
    "value": "yes",
    "question_id": 57,
    "submission_id": 6
  },
  {
    "value": "yes",
    "question_id": 8,
    "submission_id": 33
  },
  {
    "value": "yes",
    "question_id": 32,
    "submission_id": 33
  },
  {
    "value": "no",
    "question_id": 34,
    "submission_id": 15
  },
  {
    "value": "if_needed",
    "question_id": 57,
    "submission_id": 17
  },
  {
    "value": "yes",
    "question_id": 3,
    "submission_id": 32
  },
  {
    "value": "yes",
    "question_id": 9,
    "submission_id": 22
  },
  {
    "value": "if_needed",
    "question_id": 23,
    "submission_id": 7
  },
  {
    "value": "no",
    "question_id": 15,
    "submission_id": 39
  },
  {
    "value": "yes",
    "question_id": 7,
    "submission_id": 43
  },
  {
    "value": "yes",
    "question_id": 23,
    "submission_id": 25
  },
  {
    "value": "no",
    "question_id": 41,
    "submission_id": 16
  },
  {
    "value": "yes",
    "question_id": 43,
    "submission_id": 32
  },
  {
    "value": "yes",
    "question_id": 3,
    "submission_id": 10
  },
  {
    "value": "yes",
    "question_id": 30,
    "submission_id": 34
  },
  {
    "value": "yes",
    "question_id": 31,
    "submission_id": 30
  },
  {
    "value": "yes",
    "question_id": 51,
    "submission_id": 5
  },
  {
    "value": "yes",
    "question_id": 11,
    "submission_id": 5
  },
  {
    "value": "yes",
    "question_id": 15,
    "submission_id": 28
  },
  {
    "value": "yes",
    "question_id": 47,
    "submission_id": 31
  },
  {
    "value": "yes",
    "question_id": 42,
    "submission_id": 24
  },
  {
    "value": "if_needed",
    "question_id": 47,
    "submission_id": 2
  },
  {
    "value": "yes",
    "question_id": 10,
    "submission_id": 13
  },
  {
    "value": "yes",
    "question_id": 21,
    "submission_id": 18
  },
  {
    "value": "if_needed",
    "question_id": 17,
    "submission_id": 32
  },
  {
    "value": "if_needed",
    "question_id": 38,
    "submission_id": 21
  },
  {
    "value": "yes",
    "question_id": 30,
    "submission_id": 27
  },
  {
    "value": "yes",
    "question_id": 51,
    "submission_id": 36
  },
  {
    "value": "no",
    "question_id": 29,
    "submission_id": 34
  },
  {
    "value": "yes",
    "question_id": 17,
    "submission_id": 5
  },
  {
    "value": "yes",
    "question_id": 27,
    "submission_id": 7
  },
  {
    "value": "no",
    "question_id": 44,
    "submission_id": 31
  },
  {
    "value": "if_needed",
    "question_id": 41,
    "submission_id": 30
  },
  {
    "value": "yes",
    "question_id": 33,
    "submission_id": 16
  },
  {
    "value": "if_needed",
    "question_id": 29,
    "submission_id": 33
  },
  {
    "value": "yes",
    "question_id": 36,
    "submission_id": 27
  },
  {
    "value": "if_needed",
    "question_id": 22,
    "submission_id": 30
  },
  {
    "value": "yes",
    "question_id": 48,
    "submission_id": 38
  },
  {
    "value": "yes",
    "question_id": 5,
    "submission_id": 37
  },
  {
    "value": "yes",
    "question_id": 25,
    "submission_id": 26
  },
  {
    "value": "no",
    "question_id": 32,
    "submission_id": 12
  },
  {
    "value": "yes",
    "question_id": 54,
    "submission_id": 3
  },
  {
    "value": "no",
    "question_id": 4,
    "submission_id": 15
  },
  {
    "value": "yes",
    "question_id": 4,
    "submission_id": 9
  },
  {
    "value": "yes",
    "question_id": 9,
    "submission_id": 31
  },
  {
    "value": "yes",
    "question_id": 48,
    "submission_id": 26
  },
  {
    "value": "yes",
    "question_id": 25,
    "submission_id": 38
  },
  {
    "value": "if_needed",
    "question_id": 4,
    "submission_id": 29
  },
  {
    "value": "yes",
    "question_id": 44,
    "submission_id": 19
  },
  {
    "value": "no",
    "question_id": 24,
    "submission_id": 2
  },
  {
    "value": "yes",
    "question_id": 9,
    "submission_id": 41
  },
  {
    "value": "yes",
    "question_id": 37,
    "submission_id": 2
  },
  {
    "value": "no",
    "question_id": 55,
    "submission_id": 29
  },
  {
    "value": "no",
    "question_id": 29,
    "submission_id": 39
  },
  {
    "value": "yes",
    "question_id": 3,
    "submission_id": 36
  },
  {
    "value": "yes",
    "question_id": 7,
    "submission_id": 20
  },
  {
    "value": "no",
    "question_id": 6,
    "submission_id": 43
  },
  {
    "value": "yes",
    "question_id": 10,
    "submission_id": 26
  },
  {
    "value": "yes",
    "question_id": 27,
    "submission_id": 21
  },
  {
    "value": "no",
    "question_id": 55,
    "submission_id": 3
  },
  {
    "value": "yes",
    "question_id": 9,
    "submission_id": 19
  },
  {
    "value": "no",
    "question_id": 17,
    "submission_id": 36
  },
  {
    "value": "yes",
    "question_id": 54,
    "submission_id": 18
  },
  {
    "value": "yes",
    "question_id": 11,
    "submission_id": 35
  },
  {
    "value": "yes",
    "question_id": 47,
    "submission_id": 19
  },
  {
    "value": "yes",
    "question_id": 42,
    "submission_id": 13
  },
  {
    "value": "if_needed",
    "question_id": 56,
    "submission_id": 19
  },
  {
    "value": "yes",
    "question_id": 25,
    "submission_id": 14
  },
  {
    "value": "yes",
    "question_id": 20,
    "submission_id": 29
  },
  {
    "value": "if_needed",
    "question_id": 34,
    "submission_id": 9
  },
  {
    "value": "yes",
    "question_id": 22,
    "submission_id": 43
  },
  {
    "value": "yes",
    "question_id": 35,
    "submission_id": 17
  },
  {
    "value": "yes",
    "question_id": 30,
    "submission_id": 42
  },
  {
    "value": "no",
    "question_id": 40,
    "submission_id": 30
  },
  {
    "value": "no",
    "question_id": 52,
    "submission_id": 12
  },
  {
    "value": "yes",
    "question_id": 37,
    "submission_id": 19
  },
  {
    "value": "yes",
    "question_id": 12,
    "submission_id": 12
  },
  {
    "value": "no",
    "question_id": 50,
    "submission_id": 13
  },
  {
    "value": "no",
    "question_id": 57,
    "submission_id": 21
  },
  {
    "value": "yes",
    "question_id": 58,
    "submission_id": 19
  },
  {
    "value": "if_needed",
    "question_id": 38,
    "submission_id": 7
  },
  {
    "value": "if_needed",
    "question_id": 38,
    "submission_id": 11
  },
  {
    "value": "yes",
    "question_id": 33,
    "submission_id": 30
  },
  {
    "value": "yes",
    "question_id": 39,
    "submission_id": 25
  },
  {
    "value": "yes",
    "question_id": 32,
    "submission_id": 27
  },
  {
    "value": "yes",
    "question_id": 34,
    "submission_id": 37
  },
  {
    "value": "no",
    "question_id": 19,
    "submission_id": 13
  },
  {
    "value": "yes",
    "question_id": 11,
    "submission_id": 4
  },
  {
    "value": "yes",
    "question_id": 45,
    "submission_id": 20
  },
  {
    "value": "yes",
    "question_id": 36,
    "submission_id": 33
  },
  {
    "value": "yes",
    "question_id": 16,
    "submission_id": 19
  },
  {
    "value": "yes",
    "question_id": 56,
    "submission_id": 2
  },
  {
    "value": "yes",
    "question_id": 4,
    "submission_id": 37
  },
  {
    "value": "yes",
    "question_id": 28,
    "submission_id": 38
  },
  {
    "value": "no",
    "question_id": 40,
    "submission_id": 23
  },
  {
    "value": "if_needed",
    "question_id": 2,
    "submission_id": 21
  },
  {
    "value": "yes",
    "question_id": 34,
    "submission_id": 3
  },
  {
    "value": "if_needed",
    "question_id": 9,
    "submission_id": 2
  },
  {
    "value": "yes",
    "question_id": 13,
    "submission_id": 18
  },
  {
    "value": "yes",
    "question_id": 4,
    "submission_id": 18
  },
  {
    "value": "yes",
    "question_id": 37,
    "submission_id": 31
  },
  {
    "value": "if_needed",
    "question_id": 40,
    "submission_id": 40
  },
  {
    "value": "yes",
    "question_id": 40,
    "submission_id": 16
  },
  {
    "value": "no",
    "question_id": 19,
    "submission_id": 8
  },
  {
    "value": "if_needed",
    "question_id": 18,
    "submission_id": 2
  },
  {
    "value": "yes",
    "question_id": 27,
    "submission_id": 17
  },
  {
    "value": "yes",
    "question_id": 49,
    "submission_id": 38
  },
  {
    "value": "yes",
    "question_id": 50,
    "submission_id": 14
  },
  {
    "value": "yes",
    "question_id": 11,
    "submission_id": 32
  },
  {
    "value": "yes",
    "question_id": 3,
    "submission_id": 4
  },
  {
    "value": "yes",
    "question_id": 21,
    "submission_id": 29
  },
  {
    "value": "no",
    "question_id": 6,
    "submission_id": 20
  },
  {
    "value": "yes",
    "question_id": 29,
    "submission_id": 42
  },
  {
    "value": "yes",
    "question_id": 49,
    "submission_id": 8
  },
  {
    "value": "no",
    "question_id": 6,
    "submission_id": 40
  },
  {
    "value": "yes",
    "question_id": 46,
    "submission_id": 11
  },
  {
    "value": "if_needed",
    "question_id": 2,
    "submission_id": 7
  },
  {
    "value": "yes",
    "question_id": 43,
    "submission_id": 35
  },
  {
    "value": "if_needed",
    "question_id": 30,
    "submission_id": 12
  },
  {
    "value": "yes",
    "question_id": 22,
    "submission_id": 16
  },
  {
    "value": "no",
    "question_id": 51,
    "submission_id": 35
  },
  {
    "value": "yes",
    "question_id": 35,
    "submission_id": 11
  },
  {
    "value": "no",
    "question_id": 1,
    "submission_id": 32
  },
  {
    "value": "if_needed",
    "question_id": 54,
    "submission_id": 37
  },
  {
    "value": "yes",
    "question_id": 56,
    "submission_id": 41
  },
  {
    "value": "if_needed",
    "question_id": 31,
    "submission_id": 16
  },
  {
    "value": "yes",
    "question_id": 21,
    "submission_id": 9
  },
  {
    "value": "yes",
    "question_id": 39,
    "submission_id": 6
  },
  {
    "value": "yes",
    "question_id": 1,
    "submission_id": 10
  },
  {
    "value": "yes",
    "question_id": 35,
    "submission_id": 25
  },
  {
    "value": "yes",
    "question_id": 6,
    "submission_id": 16
  },
  {
    "value": "yes",
    "question_id": 25,
    "submission_id": 13
  },
  {
    "value": "yes",
    "question_id": 8,
    "submission_id": 27
  },
  {
    "value": "no",
    "question_id": 40,
    "submission_id": 20
  },
  {
    "value": "no",
    "question_id": 52,
    "submission_id": 33
  },
  {
    "value": "yes",
    "question_id": 53,
    "submission_id": 4
  },
  {
    "value": "no",
    "question_id": 32,
    "submission_id": 34
  },
  {
    "value": "yes",
    "question_id": 58,
    "submission_id": 1
  },
  {
    "value": "yes",
    "question_id": 45,
    "submission_id": 16
  },
  {
    "value": "yes",
    "question_id": 26,
    "submission_id": 4
  },
  {
    "value": "if_needed",
    "question_id": 44,
    "submission_id": 41
  },
  {
    "value": "yes",
    "question_id": 19,
    "submission_id": 38
  },
  {
    "value": "yes",
    "question_id": 39,
    "submission_id": 7
  },
  {
    "value": "yes",
    "question_id": 58,
    "submission_id": 22
  },
  {
    "value": "yes",
    "question_id": 22,
    "submission_id": 20
  },
  {
    "value": "yes",
    "question_id": 30,
    "submission_id": 33
  },
  {
    "value": "if_needed",
    "question_id": 45,
    "submission_id": 40
  },
  {
    "value": "no",
    "question_id": 19,
    "submission_id": 26
  },
  {
    "value": "no",
    "question_id": 26,
    "submission_id": 10
  },
  {
    "value": "yes",
    "question_id": 3,
    "submission_id": 35
  },
  {
    "value": "yes",
    "question_id": 46,
    "submission_id": 25
  },
  {
    "value": "yes",
    "question_id": 38,
    "submission_id": 25
  },
  {
    "value": "no",
    "question_id": 58,
    "submission_id": 31
  },
  {
    "value": "yes",
    "question_id": 31,
    "submission_id": 40
  },
  {
    "value": "if_needed",
    "question_id": 28,
    "submission_id": 8
  },
  {
    "value": "no",
    "question_id": 40,
    "submission_id": 43
  },
  {
    "value": "no",
    "question_id": 5,
    "submission_id": 29
  }
]

module.exports = {
  polls,
  questions,
  submissions,
  responses,
};
