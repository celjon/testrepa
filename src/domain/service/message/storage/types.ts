import { Create } from './create'
import { Get } from './get'
import { List } from './list'
import { Update } from './update'
import { UpdateMany } from './update-many'

export type MessageStorage = {
  create: Create
  get: Get
  list: List
  update: Update
  updateMany: UpdateMany
}
