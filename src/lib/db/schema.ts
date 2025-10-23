import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const trees = sqliteTable('trees', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  treeType: text('tree_type', { enum: ['medical', 'motor'] }).notNull(),
  structure: text('structure', { mode: 'json' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type TreeRecord = typeof trees.$inferSelect;
export type NewTreeRecord = typeof trees.$inferInsert;
