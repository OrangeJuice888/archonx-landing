import { motion } from 'framer-motion'

const cache = new Map()

// framer-motion's motion.create() builds a new component every call, which
// would remount the element on each render. Memoise per tag name so
// polymorphic `as` props stay referentially stable.
export function motionTag(tag) {
  if (!cache.has(tag)) cache.set(tag, motion.create(tag))
  return cache.get(tag)
}
