import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  highlights: defineTable({
    title: v.string(),
    path: v.array(v.number()),
  }),
})
