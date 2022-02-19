import type { IncomingMessage, ServerResponse } from 'http'
import { useQuery } from 'h3'

export default async (req: IncomingMessage, res: ServerResponse) => {
  const query = await useQuery(req)
  return { query }
}