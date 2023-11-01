import type { Config } from "drizzle-kit";

 
export default {
  schema: "./src/db/schema/items.ts",
  out: "./drizzle",
  driver: "better-sqlite",
  dbCredentials: {
    url: './src/todo.db', // 👈 this could also be a path to the local sqlite file
  }
  
} satisfies Config;