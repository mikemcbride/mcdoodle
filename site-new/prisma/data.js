const { Prisma } = require('@prisma/client');

const polls = [
  {
    title: 'January TOOL - Team 14',
    description: 'Jan meetings (test)',
    status: 'open',
  },
  {
    title: 'Feburary TOOL - Team 14',
    description: 'Feb meetings (test)',
    status: 'open',
  },
];

const questions = [
  {
    value: new Date('2023-01-06'),
    poll_id: 1,
  },
  {
    value: new Date('2023-01-07'),
    poll_id: 1,
  },
  {
    value: new Date('2023-01-08'),
    poll_id: 1,
  },
  {
    value: new Date('2023-02-06'),
    poll_id: 2,
  },
  {
    value: new Date('2023-02-07'),
    poll_id: 2,
  },
  {
    value: new Date('2023-02-08'),
    poll_id: 2,
  },
];

const submissions = [
  {
    person: 'McBrides',
    poll_id: 1,
  },
  {
    person: 'McBrides',
    poll_id: 2,
  },
  {
    person: 'Dalys',
    poll_id: 1,
  },
  {
    person: 'Dalys',
    poll_id: 2,
  },
  {
    person: 'Wills',
    poll_id: 1,
  },
  {
    person: 'Wills',
    poll_id: 2,
  },
];

const responses = [
  {
    value: 'yes',
    submission_id: 1,
    question_id: 1,
  },
  {
    value: 'no',
    submission_id: 1,
    question_id: 2,
  },
  {
    value: 'if_needed',
    submission_id: 1,
    question_id: 3,
  },
  {
    value: 'yes',
    submission_id: 2,
    question_id: 4,
  },
  {
    value: 'no',
    submission_id: 2,
    question_id: 5,
  },
  {
    value: 'if_needed',
    submission_id: 2,
    question_id: 6,
  },
  {
    value: 'yes',
    submission_id: 3,
    question_id: 1,
  },
  {
    value: 'no',
    submission_id: 3,
    question_id: 2,
  },
  {
    value: 'if_needed',
    submission_id: 3,
    question_id: 3,
  },
  {
    value: 'yes',
    submission_id: 4,
    question_id: 4,
  },
  {
    value: 'no',
    submission_id: 4,
    question_id: 5,
  },
  {
    value: 'if_needed',
    submission_id: 4,
    question_id: 6,
  },
  {
    value: 'yes',
    submission_id: 5,
    question_id: 1,
  },
  {
    value: 'no',
    submission_id: 5,
    question_id: 2,
  },
  {
    value: 'if_needed',
    submission_id: 5,
    question_id: 3,
  },
  {
    value: 'yes',
    submission_id: 6,
    question_id: 4,
  },
  {
    value: 'no',
    submission_id: 6,
    question_id: 5,
  },
  {
    value: 'if_needed',
    submission_id: 6,
    question_id: 6,
  },
];

module.exports = {
  polls,
  questions,
  submissions,
  responses,
};
