# McDoodle

[![daily health check](https://github.com/mikemcbride/mcdoodle/actions/workflows/health_check.yml/badge.svg)](https://github.com/mikemcbride/mcdoodle/actions/workflows/health_check.yml)

I used to use Doodle all the time for finding days that worked best for groups of people to meet. At some point in the last few months, Doodle released a bunch of updates and the SUPER basic functionality that I had used for years suddenly didn't work the way it used to.

So I'm making an app to fix it. This app has the very basic Doodle functionality of being able to pick a bunch of dates and people can select Yes, No, or If Needed on each of the dates. THATS ALL IT DOES.

## Local Dev

To start Turso locally and view it in Drizzle Studio:

1. Start the database:
    ```sh
    turso dev --db-file local.db
    ```
2. Push DB changes:
    ```sh
    npx drizzle-kit push:sqlite
    ```
3. Start drizzle studio:
    ```sh
    npx drizzle-kit studio
    ```

You can run `./run-db-local.sh` to do all of this for you.

To run the next.js app, `npm run dev`.

### API testing

You can import the `.bruno` folder into Bruno as a collection with all of the API requests to make debugging easier. You'll need to set the `API_SECRET` environment variable.

## Migrations

To run db migrations:

First, make sure your `.envrc` file has the production Turso URL set as the environment variable. Then:

```
npm run db:generate
npm run db:migrate
```

This will generate any necessary migration files and then apply them.
