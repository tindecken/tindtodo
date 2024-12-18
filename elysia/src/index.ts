import { Elysia, t } from "elysia";
import { swagger } from '@elysiajs/swagger'
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { item } from "./db/schema/items"; 
import { cors } from '@elysiajs/cors'
import { desc, eq } from "drizzle-orm";

const sqlite = new Database(Bun.env.DATABASE_URL);
const db = drizzle(sqlite);
const app = new Elysia()
    .use(swagger())
    .use(cors({
      origin: ['tindecken.xyz', 'localhost']
    }))
    .get("/", () => "Hello Elysia")
    .get("/items",  async() => {
      const items =  await db.select().from(item).orderBy(desc(item.createdDate));
      return items
    })
    .post('/items', async ({ body })  => {
      const newIitem = await db.insert(item).values({ title: body.title, description: body.description, dueDate: body.dueDate}).returning()
      return newIitem
    }, {
      body: t.Object({
        title: t.String(),
        description: t.String(),
        dueDate: t.String()
      }),
    })
    .post('/items/done', async ({ body, set })  => {
      const updateItem = await db.update(item).set({ isDone: body.isDone}).where(eq(item.id, body.id)).returning()
      if (updateItem.length > 0) {
        return updateItem
      }
      set.status = 404
      return 'Not found'
    }, {
      body: t.Object({
        id: t.Numeric(),
        isDone: t.Number()
      }),
    })
    .ws('/ws', {
      open(ws) {
        ws.subscribe('public');
      },
      close(ws) {
      },
      async message(ws, msg) {
        ws.publish('public',msg);
      }
    })
    .listen({
      port: (Bun.env.PORT) as string,
      tls: {
        cert: Bun.file('/etc/letsencrypt/live/todo.tindecken.xyz/fullchain.pem'),
        key: Bun.file('/etc/letsencrypt/live/todo.tindecken.xyz/privkey.pem')
      }
    })

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
