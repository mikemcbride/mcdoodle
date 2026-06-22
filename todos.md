Things we want to do:

## Done

- [x] allow closing and reopening polls (in addition to deleting)
- [x] Only show polls on dashboard that you have access to see (now scoped to
      polls you created; admins see all; ownership enforced on edit/delete)
- [x] Enable user administration. Adjust someone's role via admin dashboard.
- [x] Session management using cookies instead of local storage (HttpOnly
      session cookies; replaced the shared API key + localStorage token)
- [x] Make "if needed" an optional choice when creating a poll.
- [x] Fix Doodle admin page "delete" button alignment (and, on mobile, the
      close/delete buttons now stack below the title)
- [x] Option to require an account to participate in a poll. Anonymous visitors
      get a "create a free account to participate" popup; enforced server-side.

## Decided against (for now)

- [ ] ~~Allow sharing a poll with users?~~ — deferred. The poll link already is
      the share mechanism (anyone with the link can view/vote). A users/permissions
      table + share UI is a lot of surface for a niche co-organizer use case.
      Easy to revisit later since poll ownership now exists.
- [ ] ~~Share poll via email~~ — deferred. Mostly duplicates copy-the-link, and an
      "email any address from our domain" endpoint is a spam/abuse vector.

Instead of the above two, we added a **Copy link** button on the poll page — the
idiomatic, zero-overhead "share" for a Doodle-style app.
