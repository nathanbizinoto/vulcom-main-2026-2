import prisma from '../database/client.js'
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

const controller = {}

// DOMPurify precisa de um DOM; no Node usamos o JSDOM.
const DOMPurify = createDOMPurify(new JSDOM('').window)

controller.retrieveComments = async function(req, res) {
  try {
    const comments = await prisma.xssComment.findMany({
      orderBy: { id: 'asc' }
    })

    res.send(comments)
  }
  catch(error) {
    console.error(error)
    res.status(500).end()
  }
}

controller.createComment = async function(req, res) {
  try {
    // Sanitização: remove scripts e atributos de evento (onerror, onclick...)
    // antes de persistir o comentário.
    const content = DOMPurify.sanitize(String(req.body?.content ?? ''))

    await prisma.xssComment.create({
      data: { content }
    })

    res.status(201).end()
  }
  catch(error) {
    console.error(error)
    res.status(500).end()
  }
}

export default controller
