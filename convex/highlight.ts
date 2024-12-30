import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const highlight = mutation({
  args: {
    title: v.string(),
    path: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    ctx.db.insert('highlights', {
      title: args.title,
      path: args.path,
    })
  },
})

export const getHighlights = query({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('highlights')
      .filter((q) => q.eq(q.field('title'), args.title))
      .collect()
  },
})

export const deleteHighlight = mutation({
  args: {
    id: v.id('highlights'),
  },
  handler: async (ctx, args) => {
    ctx.db.delete(args.id)
  },
})
