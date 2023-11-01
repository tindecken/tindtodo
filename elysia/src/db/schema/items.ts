import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const item = sqliteTable('item', {
    id: integer('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    createdDate: text('createdDate').default(sql`datetime()`),
    dueDate: text('dueDate'),
    isDone: integer('isDone').default(0)
  }, (item) => ({
    nameIdx: uniqueIndex('nameIdx').on(item.title),
  })
);

export type NewItem = typeof item.$inferInsert