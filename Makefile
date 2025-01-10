.PHONY: db

db:
	turso dev --db-file local.db & npx drizzle-kit push && open https://local.drizzle.studio && npx drizzle-kit studio && fg
